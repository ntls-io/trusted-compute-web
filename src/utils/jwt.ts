// Cannot use endpoint since it does not allow any origin
// Source: https://sharedeus.eus.attest.azure.net/certs
// TODO: File an issue or figure out what we are doing wrong
import certs from "./certs.json";
import { KEYUTIL, b64utohex, RSAKey, X509 } from "jsrsasign";
import { KJUR } from "jsrsasign";

const ISSUER = "https://sharedeus.eus.attest.azure.net";

// Keeping the function async since we will need it once the
// we add the network call to get the certs
export async function verifyToken(token: string): Promise<any> {
  const [header, payload] = token.split(".");

  const headObj = KJUR.jws.JWS.readSafeJSONString(atob(header));

  if (headObj == null) {
    throw new Error("Invalid Token");
  }

  const key = getVerifyKey((headObj as { kid: string }).kid);

  const isValid = KJUR.jws.JWS.verifyJWT(token, key, {
    iss: [ISSUER],
    alg: ["RS256"],
    gracePeriod: 20 * 20 * 20 * 100 * 100
  });

  if (isValid) {
    return KJUR.jws.JWS.readSafeJSONString(atob(payload));
  } else {
    throw new Error("Verification for JWT token failed");
  }
}

const getVerifyKey = (kid: string) => {
  const candidate = certs.keys.find(jwk => jwk.kid === kid);
  if (!candidate) {
    throw new Error("Signing Key not found for JWT token");
  }

  const x509 = new X509();
  candidate.x5c.forEach(cert => x509.readCertHex(b64utohex(cert)));

  return x509.getPublicKey() as RSAKey;
};

