package umm3601.doorboard;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.google.common.collect.ImmutableMap;
import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;
import com.mongodb.BasicDBObject;
import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoCollection;
import com.mongodb.client.MongoDatabase;

import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.NotFoundResponse;
import io.javalin.http.util.ContextUtil;
import io.javalin.plugin.json.JavalinJson;


public class DoorBoardControllerSpec{

  MockHttpServletRequest mockReq = new MockHttpServletRequest();
  MockHttpServletResponse mockRes = new MockHttpServletResponse();

  private DoorBoardController doorBoardController;

  private ObjectId samsId;

  static MongoClient mongoClient;
  static MongoDatabase db;

  static ObjectMapper jsonMapper = new ObjectMapper();

  @BeforeAll
  public static void setupAll() {
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");
    mongoClient = MongoClients.create(
      MongoClientSettings.builder()
      .applyToClusterSettings(builder ->
      builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
      .build());

    db = mongoClient.getDatabase("test");
  }

  @BeforeEach
  public void setupEach()throws IOException{

    // Reset our mock request and response objects
    mockReq.resetAll();
    mockRes.resetAll();

    MongoCollection<Document> doorBoardDocuments = db.getCollection("doorboards");
    doorBoardDocuments.drop();
    List<Document> testDoorBoards = new ArrayList<>();
    testDoorBoards.add(Document.parse(
      "{\n" +
      " name: \"Billy \" ,\n" +
      " building: \"Wild \" ,\n" +
      " officeNumber: \"1234 \" ,\n" +
      " email: \"billythekid@this.that \" ,\n" +
      " sub: \"cattlerustler\" \n" +
      "}"
    ));
    testDoorBoards.add(Document.parse(
      "{\n" +
      " name: \"George Washington \" ,\n" +
      " building: \"White House \" ,\n" +
      " officeNumber: \"1789 \" ,\n" +
      " email: \"revolution@freedom.us.fake \" ,\n" +
      " sub: \"1president\" \n" +
      "}"
    ));
    testDoorBoards.add(Document.parse(
      "{\n" +
      " name: \"Not a cat \" ,\n" +
      " building: \"Building for people\" ,\n" +
      " officeNumber: \"1111 \", \n" +
      " email: \"totallynotacat@eatmice.com \" ,\n" +
      " sub: \"meow\" \n" +
      "}"
    ));

    samsId = new ObjectId();
    BasicDBObject sam = new BasicDBObject("_id", samsId);
    sam = sam.append("name", "Sam")
      .append("building", "HFA")
      .append("officeNumber", "23")
      .append("email", "sam@frogs.com")
      .append("sub", "frogs are the best");

    doorBoardDocuments.insertMany(testDoorBoards);
    doorBoardDocuments.insertOne(Document.parse(sam.toJson()));

    doorBoardController = new DoorBoardController(db);
}

  @AfterAll
  public static void teardown(){
    db.drop();
    mongoClient.close();
  }
}
