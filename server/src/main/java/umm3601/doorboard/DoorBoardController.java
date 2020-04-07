package umm3601.doorboard;

import java.util.ArrayList;
import java.util.List;

import com.mongodb.client.MongoDatabase;

import org.bson.Document;

import io.javalin.http.Context;
import umm3601.JwtProcessor;

public class DoorBoardController {
  private MongoDatabase database;
  private JwtProcessor jwtProcessor;

  public DoorBoardController(
    MongoDatabase database,
    JwtProcessor jwtProcessor) {
      this.database = database;
      this.jwtProcessor = jwtProcessor;
  }

  public void getDoorBoards(Context ctx) {
  }

  public void getDoorBoard(Context ctx) {
  }

  public void addNewDoorBoard(Context ctx) {
  }
}
