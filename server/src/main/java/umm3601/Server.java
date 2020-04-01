package umm3601;

import java.security.interfaces.RSAPublicKey;
import java.util.Arrays;
import java.util.NoSuchElementException;

import com.mongodb.MongoClientSettings;
import com.mongodb.ServerAddress;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;

import io.javalin.Javalin;
import io.javalin.http.Context;
import io.javalin.http.UnauthorizedResponse;
import javalinjwt.JavalinJWT;
import umm3601.note.DeathTimer;
import umm3601.note.NoteController;

import com.auth0.jwk.InvalidPublicKeyException;
import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwk.UrlJwkProvider;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;

public class Server {

  private static MongoDatabase database;

  // This is what we'll use to get Auth0's public keys. (In the form of
  // JSON Web Keys, or JWKs.) We'll use these JWKs to verify the tokens that
  // Auth0 sends us.
  public static JwkProvider auth0JwkProvider =
    new UrlJwkProvider("https://doorboard.auth0.com/");

  public static void main(String[] args) {

    // Get the MongoDB address and database name from environment variables and
    // if they aren't set, use the defaults of "localhost" and "dev".
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
    NoteController noteController = new NoteController(database, DeathTimer.getDeathTimerInstance());

    Javalin server = Javalin.create().start(4567);

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

  /**
   * Verifies a JSON Web Token (JWT) from the header of the HTTP request,
   * verifies it against Auth0, and returns the decoded token.
   *
   * @param ctx A Javalin context
   * @return A decoded JWT.
   * @throws UnauthorizedResponse if anything prevents the JWT from being
   *   decoded and validated. (For example, if the JWT doesn't exist, or if
   *   Auth0 isn't talking to us.)
   */
  public static DecodedJWT verifyJwtFromHeader(Context ctx) {
    String encodedToken;
    try {
      encodedToken = JavalinJWT.getTokenFromHeader(ctx).get();
    } catch (NoSuchElementException e) {
      throw new UnauthorizedResponse("Missing token");
    }

    DecodedJWT decodedToken;
    try {
      decodedToken = JWT.decode(encodedToken);
    } catch (JWTDecodeException e) {
      throw new UnauthorizedResponse("Malformed token");
    }

    String keyID = decodedToken.getKeyId();

    if (keyID == null) {
      throw new UnauthorizedResponse("Token does not contain a key ID");
    }

    Jwk jsonWebKey;
    try {
      jsonWebKey = Server.auth0JwkProvider.get(keyID);
    } catch (JwkException e) {
      throw new UnauthorizedResponse(
        "Token doesn't refer to one of Auth0's public keys");
    }

    RSAPublicKey publicKey;
    try {
      publicKey = (RSAPublicKey)jsonWebKey.getPublicKey();
    } catch (InvalidPublicKeyException e) {
      throw new UnauthorizedResponse("Auth0 didn't give us a valid public key");
    }

    try {
      Algorithm algorithm = Algorithm.RSA256(publicKey, null);
      JWTVerifier verifier = JWT.require(algorithm)
        .withIssuer("auth0")
        .build();

      // We've already got the decoded token, so we can just ignore verify()'s
      // return value.
      // (We're only calling verify() for its side-effects.)
      verifier.verify(encodedToken);
    } catch (JWTVerificationException exception) {
      throw new UnauthorizedResponse("Token provided does not verify");
    }

    return decodedToken;
  }
}
