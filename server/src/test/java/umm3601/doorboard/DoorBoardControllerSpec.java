package umm3601.doorboard;

import static com.mongodb.client.model.Filters.eq;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.auth0.jwt.interfaces.DecodedJWT;
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
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.Spy;

import io.javalin.http.BadRequestResponse;
import io.javalin.http.Context;
import io.javalin.http.NotFoundResponse;
import io.javalin.http.util.ContextUtil;
import io.javalin.plugin.json.JavalinJson;
import umm3601.JwtProcessor;


public class DoorBoardControllerSpec{

  MockHttpServletRequest mockReq = new MockHttpServletRequest();
  MockHttpServletResponse mockRes = new MockHttpServletResponse();

  @InjectMocks
  private DoorBoardController doorBoardController;

  private ObjectId samsId;

  static MongoClient mongoClient;
  @Spy
  static MongoDatabase db;

  @Mock(name = "jwtProcessor")
  JwtProcessor jwtProcessorMock;

  static ObjectMapper jsonMapper = new ObjectMapper();

  private void useJwtForSam() {
    // Make a fake DecodedJWT for jwtProcessorMock to return.
    // (Sam's sub is "frogs are the best")
    DecodedJWT mockDecodedJWT = Mockito.mock(DecodedJWT.class);
    when(mockDecodedJWT.getSubject()).thenReturn("frogs are the best");
    when(jwtProcessorMock.verifyJwtFromHeader(any()))
      .thenReturn(mockDecodedJWT);
  }

  private void useJwtForNewUser() {
    DecodedJWT mockDecodedJWT = Mockito.mock(DecodedJWT.class);
    when(mockDecodedJWT.getSubject()).thenReturn("I, Don Quixote, the Lord of La Mancha!");
    when(jwtProcessorMock.verifyJwtFromHeader(any()))
      .thenReturn(mockDecodedJWT);
  }

  private void useInvalidJwt() {
    when(jwtProcessorMock.verifyJwtFromHeader(any()))
      .thenThrow(new UnauthorizedResponse());
  }

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

    MongoCollection<Document> doorBoardDocuments = db.getCollection("doorBoards");
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

  @Test
  public void GetAllDoorBoardsWithJwt() {
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/doorBoards");

    useJwtForSam();

    doorBoardController.getDoorBoards(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    assertEquals(
      db.getCollection("doorBoards").countDocuments(),
      JavalinJson.fromJson(result, DoorBoard[].class).length,
      "Wrong number of entries"
    );
  }

  // DoorBoards aren't private; you should be able to get them with or without
  // a JWT.
  @Test
  public void GetAllDoorBoardsWithoutJwt() {
    Context ctx = ContextUtil.init(mockReq, mockRes, "api/doorBoards");

    useInvalidJwt();

    doorBoardController.getDoorBoards(ctx);

    assertEquals(200, mockRes.getStatus());

    String result = ctx.resultString();
    assertEquals(
      db.getCollection("doorBoards").countDocuments(),
      JavalinJson.fromJson(result, DoorBoard[].class).length,
      "Wrong number of entries"
    );
  }


//   @Test
//   public void GetOwnerWithExistentId() throws IOException {

//     String testID = samsId.toHexString();

//     Context ctx = ContextUtil.init(mockReq, mockRes, "api/owners/:id", ImmutableMap.of("id", testID));
//     ownerController.getOwner(ctx);

//     assertEquals(200, mockRes.getStatus());

//     String result = ctx.resultString();
//     Owner resultOwner = JavalinJson.fromJson(result, Owner.class);

//     assertEquals(resultOwner._id, samsId.toHexString());
//     assertEquals(resultOwner.name, "Sam");
//     assertEquals(resultOwner.email, "sam@frogs.com");
//   }
//   @Test
//   public void GetOwnerWithBadId() throws IOException {

//     Context ctx = ContextUtil.init(mockReq, mockRes, "api/owners/:id", ImmutableMap.of("id", "bad"));

//     assertThrows(BadRequestResponse.class, () -> {
//       ownerController.getOwner(ctx);
//     });
//   }

//   @Test
//   public void GetOwnerWithNonexistentId() throws IOException {

//     Context ctx = ContextUtil.init(mockReq, mockRes, "api/owners/:id", ImmutableMap.of("id", "58af3a600343927e48e87335"));

//     assertThrows(NotFoundResponse.class, () -> {
//       ownerController.getOwner(ctx);
//     });
//   }

//   @Test
//   public void AddOwner() throws IOException {

//     String testNewOwner = "{\"name\": \"Test Owner\", "
//     + "\"building\": \"place\", "
//     + "\"officeNumber\": \"0000\", "
//     + "\"email\": \"test@example.com\" }";

//     mockReq.setBodyContent(testNewOwner);
//     mockReq.setMethod("POST");

//     Context ctx = ContextUtil.init(mockReq, mockRes, "api/owners/new");

//     ownerController.addNewOwner(ctx);

//     assertEquals(201, mockRes.getStatus());

//     String result = ctx.resultString();
//     String id = jsonMapper.readValue(result, ObjectNode.class).get("id").asText();
//     assertNotEquals("", id);

//     assertEquals(1, db.getCollection("owners").countDocuments(eq("_id", new ObjectId(id))));

//     //verify owner was added to the database and the correct ID
//     Document addedOwner = db.getCollection("owners").find(eq("_id", new ObjectId(id))).first();
//     assertNotNull(addedOwner);
//     assertEquals("Test Owner", addedOwner.getString("name"));
//     assertEquals("place", addedOwner.getString("building"));
//     assertEquals("0000", addedOwner.getString("officeNumber"));
//     assertEquals("test@example.com", addedOwner.getString("email"));
//   }
//   @Test
//   public void AddInvalidEmailOwner() throws IOException {
//     String testNewOwner = "{\n\t\"name\": \"Test Owner\",\n\t\"building\": \"place\",\n\t\"officeNumber\": \"5432\",\n\t\"email\": \"invalidemail\" }";
//     mockReq.setBodyContent(testNewOwner);
//     mockReq.setMethod("POST");
//     Context ctx = ContextUtil.init(mockReq, mockRes, "api/owners/new");

//     assertThrows(BadRequestResponse.class, () -> {
//       ownerController.addNewOwner(ctx);
//     });
// }
//   @Test
//   public void AddInvalidNameOwner() throws IOException{
//     String testNewOwner = "{"
//     + "\"building\": \"place\", "
//     + "\"officeNumber\": \"0000\", "
//     + "\"email\": \"test@example.com\" }";

//     mockReq.setBodyContent(testNewOwner);
//     mockReq.setMethod("POST");
//     Context ctx = ContextUtil.init(mockReq, mockRes, "api/owners/new");

//     assertThrows(BadRequestResponse.class, () -> {
//       ownerController.addNewOwner(ctx);
//     });
//   }
}
