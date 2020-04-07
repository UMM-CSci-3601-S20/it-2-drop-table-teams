package umm3601;

import java.util.Optional;

import io.javalin.http.Context;
import javalinjwt.JavalinJWT;

/**
 * This class reads an encoded JWT from the HTTP request.
 */
public class JwtGetter {
  public Optional<String> getTokenFromHeader(Context ctx) {
    return JavalinJWT.getTokenFromHeader(ctx);
  }
}
