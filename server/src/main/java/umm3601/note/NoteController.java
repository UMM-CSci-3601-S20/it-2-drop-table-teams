package umm3601.note;

import static com.mongodb.client.model.Filters.and;
import static com.mongodb.client.model.Filters.eq;
import static com.mongodb.client.model.Filters.regex;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;

import com.google.common.collect.ImmutableMap;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;
import com.mongodb.client.model.Sorts;

import org.bson.Document;
import org.bson.conversions.Bson;
import org.bson.types.ObjectId;
import org.mongojack.JacksonCodecRegistry;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.ConflictResponse;
import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import io.javalin.http.NotFoundResponse;
import io.javalin.http.UnauthorizedResponse;
import umm3601.JwtProcessor;
import umm3601.UnprocessableResponse;
import umm3601.doorboard.DoorBoard;


/**
 * Controller that manages requests for note data (for a specific doorBoard).
 */
public class NoteController {

  private final String ISO_8601_REGEX = "([+-]\\d\\d)?\\d\\d\\d\\d-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d([+, -.])\\d\\d\\d[\\dZ]";

  private static DeathTimer deathTimer;

  private final JwtProcessor jwtProcessor;

  JacksonCodecRegistry jacksonCodecRegistry = JacksonCodecRegistry.withDefaultObjectMapper();

  private final MongoCollection<Note> noteCollection;
  private final MongoCollection<DoorBoard> doorBoardCollection;

  /**
   * @param database the database containing the note data
   */

  public NoteController(
      MongoDatabase database,
      DeathTimer dt,
      JwtProcessor jwtProcessor) {
    jacksonCodecRegistry.addCodecForClass(Note.class);
    jacksonCodecRegistry.addCodecForClass(DoorBoard.class);

    noteCollection = database.getCollection("notes").withDocumentClass(Note.class)
        .withCodecRegistry(jacksonCodecRegistry);

    doorBoardCollection = database.getCollection("doorBoards").withDocumentClass(DoorBoard.class)
        .withCodecRegistry(jacksonCodecRegistry);

    deathTimer = dt;
    this.jwtProcessor = jwtProcessor;
  }

  /**
   * Given the ObjectId, as a hex string, of a DoorBoard in the database,
   * return that DoorBoard.
   *
   * Returns null if the ObjectId doesn't correspond to any DoorBoard in the
   * database.
   */
  private DoorBoard getDoorBoard(String doorBoardID) {
    return doorBoardCollection
      .find(eq("_id", new ObjectId(doorBoardID)))
      .first();
  }

  /**
   * Delete a note belonging to a specific doorBoard.
   * Uses the following parameters in the request:
   *
   * `id` parameter -> note id
   * `doorBoardid` -> which doorBoard's notes
   *
   * @param ctx a Javalin HTTP context
   */
  public void deleteNote(Context ctx) {
    String id = ctx.pathParam("id");

    // This throws an UnauthorizedResponse if the user isn't logged in.
    String currentUserSub = jwtProcessor.verifyJwtFromHeader(ctx).getSubject();

    Note note;
    try {
      note = noteCollection.find(eq("_id", new ObjectId(id))).first();
    } catch(IllegalArgumentException e) {
      throw new BadRequestResponse("The requested note id wasn't a legal Mongo Object ID.");
    }

    if (note == null) {
      throw new NotFoundResponse("The requested does not exist.");
    }

    String subOfOwnerOfNote = getDoorBoard(note.doorBoardID).sub;
    if (!currentUserSub.equals(subOfOwnerOfNote)) {
      throw new ForbiddenResponse("The requested note does not belong to this doorBoard. It cannot be deleted.");
    }

    noteCollection.deleteOne(eq("_id", new ObjectId(id)));
    deathTimer.clearKey(id);
    ctx.status(204);
  }

  /**
   * Get a sorted JSON response in ascending order that filters by the query parameters
   * supplied by the Javalin HTTP context
   *
   * @param ctx a Javalin HTTP context
   */
  public void getNotesByDoorBoard(Context ctx) {
    checkCredentialsForGetNotesRequest(ctx);

    // If we've gotten this far without throwing an exception,
    // the client has the proper credentials to make the get request.

    List<Bson> filters = new ArrayList<Bson>(); // start with a blank JSON document
    if (ctx.queryParamMap().containsKey("doorBoardid")) {
      String targetDoorBoardID = ctx.queryParam("doorBoardid");
      filters.add(eq("doorBoardID", targetDoorBoardID));
    }
    if (ctx.queryParamMap().containsKey("body")) {
      filters.add(regex("body", ctx.queryParam("body"), "i"));
    }
    if (ctx.queryParamMap().containsKey("status")) {
      filters.add(eq("status", ctx.queryParam("status")));
    }

    String sortBy = ctx.queryParam("sortBy", "status"); //Sort by query param, default being `status`
    String sortOrder = ctx.queryParam("sortorder", "asc");

    ctx.json(noteCollection.find(filters.isEmpty() ? new Document() : and(filters))
      .sort(sortOrder.equals("desc") ?  Sorts.descending(sortBy) : Sorts.ascending(sortBy))
      .into(new ArrayList<>()));
  }

  /**
   * Check whether the user is allowed to perform this get request, or if
   * we should abort and send back some sort of error response.
   *
   * As a precondition, `ctx` should be a GET request to /api/notes.
   *
   * If the user has the right credentials, this method does nothing, and you
   * can proceed as normal
   *
   * If the user doesn't have the right credentials, this method will throw
   * some subclass of HttpResponseException.
   */
  private void checkCredentialsForGetNotesRequest(Context ctx) {
    if (ctx.queryParamMap().containsKey("status")
        && ctx.queryParam("status").equals("active")) {
      // Anyone is allowed to view active notes, even if they aren't logged in.
      return;
    }

    // For any other request, you have to be logged in.
    String currentUserSub;
    try {
      currentUserSub = jwtProcessor.verifyJwtFromHeader(ctx).getSubject();
    } catch (UnauthorizedResponse e) {
      throw e;
      // Catch and rethrow, just to be explicit.
    }

    // You can't view everyone's notes (unless you're only asking for active
    // notes.)

    if (!ctx.queryParamMap().containsKey("doorBoardid")) {
      throw new ForbiddenResponse(
        "Request not allowed; users can only view their own notes.");
    }

    String subOfOwnerOfDoorBoard = getDoorBoard(ctx.queryParam("doorBoardid")).sub;
    if (!currentUserSub.equals(subOfOwnerOfDoorBoard)) {
      throw new ForbiddenResponse(
        "Request not allowed; users can only view their own notes.");
    }
  }


  /**
   * Add a new note and confirm with a successful JSON response
   *
   * @param ctx a Javalin HTTP context
   */
  public void addNewNote(Context ctx) {
    Note newNote = ctx.bodyValidator(Note.class)
      .check((note) -> note.doorBoardID == null) // The doorBoardID shouldn't be present; you can't choose who you're posting the note as.
      .check((note) -> note.body != null && note.body.length() > 0) // Make sure the body is not empty
      .check((note) -> note.addDate != null && note.addDate.matches(ISO_8601_REGEX))
      .check((note) -> note.expireDate == null || note.expireDate.matches(ISO_8601_REGEX))
      .check((note) -> note.status.matches("^(active|draft|deleted|template)$")) // Status should be one of these
      .get();

    // This will throw an UnauthorizedResponse if the user isn't logged in.
    newNote.doorBoardID = jwtProcessor.verifyJwtFromHeader(ctx).getSubject();

    if(newNote.expireDate != null && !(newNote.status.equals("active"))) {
      throw new ConflictResponse("Expiration dates can only be assigned to active notices.");
    }

    if(newNote.expireDate != null || newNote.status.equals("deleted")) {
      deathTimer.updateTimerStatus(newNote); //only make a timer if needed
    }
    noteCollection.insertOne(newNote);

    ctx.status(201);
    ctx.json(ImmutableMap.of("id", newNote._id));
  }

  /**
   * Edit an existing note
   */
  public void editNote(Context ctx) {

    Document inputDoc = ctx.bodyAsClass(Document.class); //throws 400 error
    Document toEdit = new Document();
    Document toReturn = new Document();

    String id = ctx.pathParam("id");
    Note note;

    if(inputDoc.isEmpty()) {
      throw new BadRequestResponse("PATCH request must contain a body.");
    }

    try {
      note = noteCollection.find(eq("_id", new ObjectId(id))).first();
      // This really isn't the right way to do things.  Retrieving the database object
      // in order to check if it exists is inefficient.  We will need to do this at some
      // point, in order to enfore non-active notices not gaining expiration dates--but
      // we can probably move that later.  It's a question of: do the expensive thing always;
      // or do the cheap thing always, and sometimes the expensive thing as well.
    } catch(IllegalArgumentException e) {
      throw new BadRequestResponse("The requested note id wasn't a legal Mongo Object ID.");
    }

    if (note == null) {
      throw new NotFoundResponse("The requested note does not exist.");
    }

    // verifyJwtFromHeader will throw an UnauthorizedResponse if the user isn't logged in.
    String currentUserID = jwtProcessor.verifyJwtFromHeader(ctx).getSubject();

    if (!note.doorBoardID.equals(currentUserID)) {
      throw new ForbiddenResponse("Request not allowed; users can only edit their own notes");
    }

    HashSet<String> validKeys = new HashSet<String>(Arrays.asList("body", "expireDate", "status"));
    HashSet<String> forbiddenKeys = new HashSet<String>(Arrays.asList("doorBoardID", "addDate", "_id"));
    HashSet<String> validStatuses = new HashSet<String>(Arrays.asList("active", "draft", "deleted", "template"));
    for (String key: inputDoc.keySet()) {
      if(forbiddenKeys.contains(key)) {
        throw new BadRequestResponse("Cannot edit the field " + key + ": this field is not editable and should be considered static.");
      } else if (!(validKeys.contains(key))){
        throw new ConflictResponse("Cannot edit the nonexistent field " + key + ".");
      }
    }


    String noteStatus = note.status;
      // At this point, we're taking information from the user and putting it directly into the database.
      // I'm unsure of how to properly sanitize this; StackOverflow just says to use PreparedStatements instead
      // of Statements, but thanks to the magic of mongodb I'm not using either.  At this point I'm going to cross
      // my fingers really hard and pray that this will be fine.

      if(inputDoc.containsKey("body")) {
        toEdit.append("body", inputDoc.get("body"));
      }
      if (inputDoc.containsKey("status")) {
        if (validStatuses.contains(inputDoc.get("status"))) {
          toEdit.append("status", inputDoc.get("status"));
          noteStatus = inputDoc.get("status").toString();
          if(inputDoc.get("status") != "active") {
            toReturn.append("$unset", new Document("expireDate", ""));
            //Only active notices can have expiration dates, so if a notice becomes inactive, it loses
            //its expiration date.
          }
        } else {
          throw new UnprocessableResponse(
              "The 'status' field must contain one of 'active', 'draft', 'deleted', or 'template'.");
        }
      }

      if(inputDoc.containsKey("expireDate")){
        if(inputDoc.get("expireDate") == null) {
          toReturn.append("$unset", new Document("expireDate", "")); //If expireDate is specifically included with a null value, remove the expiration date.
        } else if (!(noteStatus.equals("active"))) {
          throw new ConflictResponse("Expiration dates can only be assigned to active notices.");
          //Order of clauses means we don't mind of someone manually zeroes their expireDate when making something inactive.
        } else if(inputDoc.get("expireDate").toString() //This assumes that we're using the same string encoding they are, but it's our own API we should be fine.
        .matches(ISO_8601_REGEX)) {
          toEdit.append("expireDate", inputDoc.get("expireDate"));
        } else {
          throw new UnprocessableResponse("The 'expireDate' field must contain an ISO 8061 time string.");
        }
        //This is not the right error to throw here.  It would probably make more sense to throw a
        // 400 or 415.  Possibly throw a 422 on attempts to set the expireDate in the past?

        //This would most likely be done by checking new StdDateFormat().parse(inputDoc.get("expireDate").toString()).isAfter(new StdDateFormate().parse(note.addDate))

      }

      //If the message includes a change to status or expiration date, update timers here

      if(!(toEdit.isEmpty())) {
        toReturn.append("$set", toEdit);
      }
      noteCollection.updateOne(eq("_id", new ObjectId(id)), toReturn);
      //Should probably only run update if expiration date or status changed

      deathTimer.updateTimerStatus(noteCollection.find(eq("_id", new ObjectId(id))).first());

      //we're getting the note, we can(should) send it back with a 201 instead of just a 204
      //alternatively, give 204 if all the changed fields have the same values and 201 otherwise
      ctx.status(204);
    }


    /**
     * Silently purge a single notice from the database.
     *
     * A helper function which should never be called directly.
     * This function is not guaranteed to behave well if given an incorrect
     * or invalid argument.
     *
     * @param id the id of the note to be deleted.
     */
    protected void singleDelete(String id) {
      noteCollection.deleteOne(eq("_id", new ObjectId(id)));
      deathTimer.clearKey(id);
    }



    /**
     * Flags a single notice as deleted.
     *
     * A helper function which should never be called directly.
     * Note that this calls UpdateTimerStatus on said note.
     * This function is not guaranteed to behave well
     * if given an incorrect or invalid argument.
     *
     * @param id the id of the note to be flagged.
     */
    protected void flagOneForDeletion(String id) {
      noteCollection.updateOne(eq("_id", new ObjectId(id)),
       new Document("$set", new Document("status", "deleted").append("expireDate", null)));
      deathTimer.updateTimerStatus(noteCollection.find(eq("_id", new ObjectId(id))).first());
    }



  }


