package umm3601;

import java.util.Arrays;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import umm3601.doorboard.DoorBoardController;
import umm3601.note.DeathTimer;
import umm3601.note.NoteController;

import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;

public class Server {

  private static MongoDatabase database;

  // This is what we'll use to get Auth0's public keys. (In the form of
  // JSON Web Keys, or JWKs.) We'll use these JWKs to verify the tokens that
  // Auth0 sends us.
  public static JwkProvider auth0JwkProvider =
    new UrlJwkProvider("https://doorbboard-dev.auth0.com/");

  public static void main(String[] args) {

    // Get the MongoDB address and database name from environment variables and
    // if they aren't set, use the defaults of "localhost" and "team4IterationDev".
    String mongoAddr = System.getenv().getOrDefault("MONGO_ADDR", "localhost");
    String databaseName = System.getenv().getOrDefault("MONGO_DB", "team4IterationDev");

    // Setup the MongoDB client object with the information we set earlier
    MongoClient mongoClient = MongoClients.create(
      MongoClientSettings.builder()
      .applyToClusterSettings(builder ->
        builder.hosts(Arrays.asList(new ServerAddress(mongoAddr))))
      .build());

    // Get the database
    database = mongoClient.getDatabase(databaseName);

    // Initialize dependencies
    NoteController noteController = new NoteController(
      database,
      DeathTimer.getDeathTimerInstance(),
      new JwtProcessor(new JwtGetter(), auth0JwkProvider));

    DoorBoardController doorBoardController = new DoorBoardController(
      database,
      new JwtProcessor(new JwtGetter(), auth0JwkProvider));

    Javalin server = Javalin.create().start(4567);

    // ----- DoorBoard routes ----- //
    server.get("api/doorBoards", doorBoardController::getDoorBoards);

    server.get("api/doorBoards/:id", doorBoardController::getDoorBoard);

    server.post("api/doorBoards/new", doorBoardController::addNewDoorBoard);

    // ----- Note routes ----- //
    // List notes, filtered using query parameters
    server.get("api/notes", noteController::getNotesByOwner);

    // Delete specific note
    server.delete("api/notes/:id", noteController::deleteNote);

    // Add new note
    server.post("api/notes/new", noteController::addNewNote);

    // Update a note
    server.patch("api/notes/:id", noteController::editNote);

    server.exception(Exception.class, (e, ctx) -> {
      ctx.status(500);
      ctx.json(e); // you probably want to remove this in production
    });
  }
}
