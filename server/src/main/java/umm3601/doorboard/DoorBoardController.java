package umm3601.doorboard;

import java.util.ArrayList;
import java.util.List;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;
import org.mongojack.JacksonCodecRegistry;

import io.javalin.http.Context;
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
  }

  public void addNewDoorBoard(Context ctx) {
  }
}
