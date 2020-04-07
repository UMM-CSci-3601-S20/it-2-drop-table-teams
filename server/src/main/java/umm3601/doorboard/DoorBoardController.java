package umm3601.doorboard;

import java.util.ArrayList;
import java.util.List;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.mongojack.JacksonCodecRegistry;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
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
  }
}
