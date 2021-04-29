import { jwtVerify, JWTVerifyGetKey } from "jose/jwt/verify";
import { createRemoteJWKSet } from "jose/jwks/remote";
import { JWTVerifyResult } from "jose/webcrypto/types";

const issuer = "https://sharedeus.eus.attest.azure.net";
const JWKS: JWTVerifyGetKey = createRemoteJWKSet(new URL(issuer));

export async function verifyToken(token: string): Promise<JWTVerifyResult> {
  const { payload, protectedHeader } = await jwtVerify(token, JWKS, {
    issuer
  });

  console.log(payload);
  console.log(protectedHeader);

  return { payload, protectedHeader };
}
