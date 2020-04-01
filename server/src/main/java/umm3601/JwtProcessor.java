package umm3601;

import java.security.interfaces.RSAPublicKey;
import java.util.NoSuchElementException;

import com.auth0.jwk.InvalidPublicKeyException;
import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkException;
import com.auth0.jwt.JWT;
import com.auth0.jwt.JWTVerifier;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTDecodeException;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;

import io.javalin.http.Context;
import io.javalin.http.UnauthorizedResponse;
import javalinjwt.JavalinJWT;

/**
 * This class, a singleton, contains methods for processing and verifying JWTs.
 */
public enum JwtProcessor {
  INSTANCE;

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
