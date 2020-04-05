package umm3601.note;

import java.io.IOException;
import java.security.KeyFactory;
import java.security.NoSuchAlgorithmException;
import java.security.PublicKey;
import java.security.spec.InvalidKeySpecException;
import java.security.spec.X509EncodedKeySpec;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import com.auth0.jwk.Jwk;
import com.auth0.jwk.JwkException;
import com.auth0.jwk.JwkProvider;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.mockrunner.mock.web.MockHttpServletRequest;
import com.mockrunner.mock.web.MockHttpServletResponse;

import org.bson.Document;
import org.bson.types.ObjectId;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.fail;

import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.MockitoAnnotations;
import org.mockito.Spy;

import io.javalin.http.Context;
import io.javalin.http.UnauthorizedResponse;
import io.javalin.http.util.ContextUtil;

import umm3601.JwtGetter;
import umm3601.JwtProcessor;

public class JwtProcessorSpec {
  @Mock(name = "jwtGetter")
  public JwtGetter mockJwtGetter;

  @Mock(name = "jwkProvider")
  public JwkProvider mockJwkProvider;

  @InjectMocks
  public JwtProcessor jwtProcessor;

  // Generated using jwt.io's debugger tool.
  public String encodedTestToken = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImZvbyJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMiwiaXNzIjoiYXV0aDAifQ.eL7VDmh4h85bhTgDFEuK5jqMouv4b8Vf74aztL50xR6_08jtrMErLlWtgNO9eZcpiQ1mI9zfDDSxEsE_DfDM1FGszy23a1l4Wm9A_fLNakz4lJd6-6xppMuAIejZyEHv0jqBMh5v1AJx6dCQnn9noLVpD00ABl-qsaDsUhLJejdNPSlzQX8lh6O_Py4S8CIQgHj5S9y3WsRrIEhqi0dXAQHz6GZY5Aw1mJJjiKp6TEY5vlINYPoTUqLdZ8Y31vm1Ydmq0LABEAW0qYmOavID_-AJTEs48EvJAAcTPkcWMagaY7WeJDEBTqZrpv-Jr9vITz8uE6BGdGq6pZ6nHG8Dug";

  public String testKeyID = "foo";

  public String testPublicKey =
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAnzyis1ZjfNB0bBgKFMSv"
    + "vkTtwlvBsaJq7S5wA+kzeVOVpVWwkWdVha4s38XM/pa/yr47av7+z3VTmvDRyAHc"
    + "aT92whREFpLv9cj5lTeJSibyr/Mrm/YtjCZVWgaOYIhwrXwKLqPr/11inWsAkfIy"
    + "tvHWTxZYEcXLgAXFuUuaS3uF9gEiNQwzGTU1v0FqkqTBr4B8nW3HCN47XUu0t8Y0"
    + "e+lf4s4OxQawWD79J9/5d3Ry0vbV3Am1FtGJiJvOwRsIfVChDpYStTcHTCMqtvWb"
    + "V6L11BWkpzGXSW4Hv43qa+GSYOD2QU68Mb59oSk2OB+BtOLpJofmbGEGgvmwyCI9"
    + "MwIDAQAB";

  public String completelyDifferentPublicKey =
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAonSWc4DYbFG/ZSYDk8EH"
    + "YMdTmInDw8ZsfGLAXXgQdWVrrkHi8Cgthcn9epkcvk6sciQr+qJp8GvoVOVW5Kgl"
    + "z4C8c5eCa+iikVmhFYhb5ks9Jvjh3Pm4vbUYIJw75kK0hv7xl/dZkP7SAxJBDcz8"
    + "FuetFuGb8G+zoBTSAl/9mn/qg9+tpqHFy+lVXjgjh9XQZ+z4NcS5v+6wvwSBheYO"
    + "E2bBshKIy8wY4MpeB4ku3VH74UDCBPSx26bIP+TeyimOdWDOM9mKG1PYtKl3TreC"
    + "E3AVySPlfH1m5M660j9cCaqYA90fWTZIlaH0KIFbig9nOdbTrKF5UbVajvOTy6pv"
    + "TwIDAQAB";

  // Just for testing--please don't use this in production ;)
  public String testPrivateKey =
    "MIIEogIBAAKCAQEAnzyis1ZjfNB0bBgKFMSvvkTtwlvBsaJq7S5wA+kzeVOVpVWw"
    + "kWdVha4s38XM/pa/yr47av7+z3VTmvDRyAHcaT92whREFpLv9cj5lTeJSibyr/Mr"
    + "m/YtjCZVWgaOYIhwrXwKLqPr/11inWsAkfIytvHWTxZYEcXLgAXFuUuaS3uF9gEi"
    + "NQwzGTU1v0FqkqTBr4B8nW3HCN47XUu0t8Y0e+lf4s4OxQawWD79J9/5d3Ry0vbV"
    + "3Am1FtGJiJvOwRsIfVChDpYStTcHTCMqtvWbV6L11BWkpzGXSW4Hv43qa+GSYOD2"
    + "QU68Mb59oSk2OB+BtOLpJofmbGEGgvmwyCI9MwIDAQABAoIBACiARq2wkltjtcjs"
    + "kFvZ7w1JAORHbEufEO1Eu27zOIlqbgyAcAl7q+/1bip4Z/x1IVES84/yTaM8p0go"
    + "amMhvgry/mS8vNi1BN2SAZEnb/7xSxbflb70bX9RHLJqKnp5GZe2jexw+wyXlwaM"
    + "+bclUCrh9e1ltH7IvUrRrQnFJfh+is1fRon9Co9Li0GwoN0x0byrrngU8Ak3Y6D9"
    + "D8GjQA4Elm94ST3izJv8iCOLSDBmzsPsXfcCUZfmTfZ5DbUDMbMxRnSo3nQeoKGC"
    + "0Lj9FkWcfmLcpGlSXTO+Ww1L7EGq+PT3NtRae1FZPwjddQ1/4V905kyQFLamAA5Y"
    + "lSpE2wkCgYEAy1OPLQcZt4NQnQzPz2SBJqQN2P5u3vXl+zNVKP8w4eBv0vWuJJF+"
    + "hkGNnSxXQrTkvDOIUddSKOzHHgSg4nY6K02ecyT0PPm/UZvtRpWrnBjcEVtHEJNp"
    + "bU9pLD5iZ0J9sbzPU/LxPmuAP2Bs8JmTn6aFRspFrP7W0s1Nmk2jsm0CgYEAyH0X"
    + "+jpoqxj4efZfkUrg5GbSEhf+dZglf0tTOA5bVg8IYwtmNk/pniLG/zI7c+GlTc9B"
    + "BwfMr59EzBq/eFMI7+LgXaVUsM/sS4Ry+yeK6SJx/otIMWtDfqxsLD8CPMCRvecC"
    + "2Pip4uSgrl0MOebl9XKp57GoaUWRWRHqwV4Y6h8CgYAZhI4mh4qZtnhKjY4TKDjx"
    + "QYufXSdLAi9v3FxmvchDwOgn4L+PRVdMwDNms2bsL0m5uPn104EzM6w1vzz1zwKz"
    + "5pTpPI0OjgWN13Tq8+PKvm/4Ga2MjgOgPWQkslulO/oMcXbPwWC3hcRdr9tcQtn9"
    + "Imf9n2spL/6EDFId+Hp/7QKBgAqlWdiXsWckdE1Fn91/NGHsc8syKvjjk1onDcw0"
    + "NvVi5vcba9oGdElJX3e9mxqUKMrw7msJJv1MX8LWyMQC5L6YNYHDfbPF1q5L4i8j"
    + "8mRex97UVokJQRRA452V2vCO6S5ETgpnad36de3MUxHgCOX3qL382Qx9/THVmbma"
    + "3YfRAoGAUxL/Eu5yvMK8SAt/dJK6FedngcM3JEFNplmtLYVLWhkIlNRGDwkg3I5K"
    + "y18Ae9n7dHVueyslrb6weq7dTkYDi3iOYRW8HRkIQh06wEdbxt0shTzAJvvCQfrB"
    + "jg/3747WSsf/zBTcHihTRBdAv6OmdhV4/dD5YBfLAkLrd+mX7iE=";


  // This is the data inside our test token.

  // The 'sub' (subject) claim.
  public String testSub = "1234567890";
  // The 'name' claim.
  public String testName = "John Doe";
  // The 'admin' claim.
  public boolean testAdmin = true;
  // The 'iat' (issued-at-time) claim.
  public int testIat = 1516239022;

  private PublicKey publicKeyFromBase64String(String str) {
    byte[] publicBytes = Base64.getDecoder().decode(str);
    X509EncodedKeySpec keySpec = new X509EncodedKeySpec(publicBytes);
    KeyFactory keyFactory;
    try {
      keyFactory = KeyFactory.getInstance("RSA");
    } catch (NoSuchAlgorithmException e) {
      fail("Couldn't get the 'RSA' algorithm.");
      return null;
    }
    PublicKey publicKey;
    try {
      publicKey = keyFactory.generatePublic(keySpec);
    } catch (InvalidKeySpecException e) {
      fail("Couldn't read the public key from the string.");
      return null;
    }
    return publicKey;
  }

  @BeforeEach
  public void setupEach() throws IOException {
    MockitoAnnotations.initMocks(this);
  }

  /**
   * Tell all of the mocks to give us back good values (as if we
   * were passing them a valid token)
   */
  public void setUpGoodMocks() throws JwkException {
    when(mockJwtGetter.getTokenFromHeader(any()))
      .thenReturn(Optional.of(encodedTestToken));

    Jwk mockJwk = Mockito.mock(Jwk.class);

    when(mockJwkProvider.get(testKeyID)).thenReturn(mockJwk);
    when(mockJwk.getPublicKey()).thenReturn(publicKeyFromBase64String(testPublicKey));
  }

  public void setUpBadMocks() throws JwkException {
    when(mockJwtGetter.getTokenFromHeader(any()))
      .thenReturn(Optional.of(encodedTestToken));

    Jwk mockJwk = Mockito.mock(Jwk.class);

    when(mockJwkProvider.get(testKeyID)).thenReturn(mockJwk);
    when(mockJwk.getPublicKey()).thenReturn(publicKeyFromBase64String(completelyDifferentPublicKey));
  }


  /**
   * Tell all of the mocks to give us back bad values (as if we
   * didn't pass a token in the header)
   */
  public void setUpMocksWithMissingJwt () {
    when(mockJwtGetter.getTokenFromHeader(any()))
      .thenReturn(Optional.empty());
  }

  @Test
  public void jwtProcessorAcceptsGoodToken() {
    try {
      setUpGoodMocks();
    } catch (JwkException e) {
      fail("Wasn't able to set up a JWK mock");
    }

    Context ctx = ContextUtil.init(
      new MockHttpServletRequest(),
      new MockHttpServletResponse(),
      "api/notes");

    // This shouldn't throw.
    DecodedJWT token = jwtProcessor.verifyJwtFromHeader(ctx);

    assertEquals(
      token.getSubject(),
      testSub,
      "Decoded token has the wrong subject.");

    assertEquals(
      token.getClaim("name").asString(),
      testName,
      "Decoded token has the wrong value in the 'name' claim.");
  }

  @Test
  public void jwtProcessorRejectsBadToken() {
    try {
      setUpBadMocks();
    } catch (JwkException e) {
      fail("Wasn't able to set up a JWK mock");
    }

    Context ctx = ContextUtil.init(
      new MockHttpServletRequest(),
      new MockHttpServletResponse(),
      "api/notes");

    assertThrows(UnauthorizedResponse.class, () -> {
      DecodedJWT token = jwtProcessor.verifyJwtFromHeader(ctx);
    });
  }

  @Test
  public void jwtProcessorRejectsMissingToken() {
    setUpMocksWithMissingJwt();

    Context ctx = ContextUtil.init(
      new MockHttpServletRequest(),
      new MockHttpServletResponse(),
      "api/notes");

    assertThrows(UnauthorizedResponse.class, () -> {
      DecodedJWT token = jwtProcessor.verifyJwtFromHeader(ctx);
    });
  }
}
