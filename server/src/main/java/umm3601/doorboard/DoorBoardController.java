package umm3601.doorboard;

import java.util.ArrayList;
import java.util.List;

import com.auth0.jwt.interfaces.DecodedJWT;
import com.google.common.collect.ImmutableMap;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.mongojack.JacksonCodecRegistry;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.ForbiddenResponse;
import io.javalin.http.NotFoundResponse;
import umm3601.JwtProcessor;

public class DoorBoardController {
  private MongoCollection<DoorBoard> doorBoards;
  private JwtProcessor jwtProcessor;

  public DoorBoardController(
      MongoDatabase database,
      JwtProcessor jwtProcessor) {
    JacksonCodecRegistry codecs =
        JacksonCodecRegistry.withDefaultObjectMapper();
    codecs.addCodecForClass(DoorBoard.class);

    this.doorBoards = database.getCollection("doorBoards")
        .withDocumentClass(DoorBoard.class)
        .withCodecRegistry(codecs);

    this.jwtProcessor = jwtProcessor;
  }

  public void getDoorBoards(Context ctx) {
    List<DoorBoard> doorBoardList = doorBoards
      .find(new Document())
      .into(new ArrayList<>());

    ctx.json(doorBoardList);
  }

  public void getDoorBoard(Context ctx) {
    ObjectId doorBoardId;
    try {
      // The path parameter should always be present;
      // there should be no danger of a NullPointerException
      // here.
      doorBoardId = new ObjectId(ctx.pathParam("id"));
    } catch (IllegalArgumentException e) {
      throw new BadRequestResponse(
        ctx.pathParam("id") + " is not a well-formed id");
    }

    DoorBoard doorBoard = doorBoards
        .find(new Document().append("_id", doorBoardId))
        .first();

    if (doorBoard == null) {
      throw new NotFoundResponse(
        ctx.pathParam("id") + " does not match any DoorBoard");
    }

    ctx.json(doorBoard);
  }

  public void addNewDoorBoard(Context ctx) {
    // This will throw an UnauthorizedException if the user isn't logged in.
    DecodedJWT jwt = jwtProcessor.verifyJwtFromHeader(ctx);

    DoorBoard doorBoard = ctx.bodyValidator(DoorBoard.class)
        .check(body -> body.name != null && !body.name.isEmpty())
        .check(body -> body.building != null && !body.building.isEmpty())
        .check(body -> body.officeNumber != null && !body.officeNumber.isEmpty())
        .check(body -> body.email != null && !body.email.isEmpty())
        .check(body -> body.email.contains("@"))
        .get();

    if (!doorBoard.sub.equals(jwt.getSubject())) {
      throw new ForbiddenResponse("Can't make a DoorBoard for another user");
    }

    doorBoards.insertOne(doorBoard);

    ctx.status(201);
    ctx.json(ImmutableMap.of("id", doorBoard._id));
  }
}
