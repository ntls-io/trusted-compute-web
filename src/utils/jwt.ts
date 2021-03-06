// Cannot use endpoint since it does not allow any origin
// Source: https://sharedeus.eus.attest.azure.net/certs
//
// See Azure Community Space discussion:
// https://techcommunity.microsoft.com/t5/azure/no-cors-headers-for-jwk-certs-for-azure-attestation/m-p/2277818
//
import certs from "./certs.json";
import { b64utohex, RSAKey, X509 } from "jsrsasign";
import { KJUR } from "jsrsasign";
import { AttestationToken } from "./attestation-token";

const ISSUER = "https://sharedeus.eus.attest.azure.net";

// We should make the function async since we will need it once the
// we add the network call to get the certs
export function verifyToken(token: string): AttestationToken {
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
    const payloadObj = KJUR.jws.JWS.readSafeJSONString(atob(payload));
    if (payloadObj) {
      return new AttestationToken(payloadObj as Record<string, unknown>);
    } else {
      throw new Error("Unsafe attestation payload");
    }
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
