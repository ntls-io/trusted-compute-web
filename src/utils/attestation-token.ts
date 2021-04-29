function getStr(x: unknown): string | never {
  if (typeof x === "string") {
    return x;
  } else {
    throw new Error("Failed to parse token");
  }
}

function getNum(x: unknown): number | never {
  if (typeof x === "number") {
    return x;
  } else {
    throw new Error("Failed to parse token");
  }
}

function getBool(x: unknown): boolean | never {
  if (typeof x === "boolean") {
    return x;
  } else {
    throw new Error("Failed to parse token");
  }
}

function getObj(x: unknown): Record<string, unknown> | never {
  if (typeof x === "object" && x) {
    return x as Record<string, unknown>;
  } else {
    throw new Error("Failed to parse token");
  }
}

export class AttestationToken {
  constructor(tok: Record<string, unknown>) {
    this.schemaVersion = getStr(tok["x-ms-ver"]);
    this.attestationType = getStr(tok["x-ms-attestation-type"]);
    this.policyHash = getStr(tok["x-ms-policy-hash"]);
    this.jti = getStr(tok["jti"]);
    this.iss = getStr(tok["iss"]);
    this.iat = new Date(getNum(tok["iat"]) * 1000);
    this.exp = new Date(getNum(tok["exp"]) * 1000);
    this.nbf = new Date(getNum(tok["nbf"]) * 1000);
    this.isDebuggable = getBool(tok["x-ms-sgx-is-debuggable"]);
    this.productId = getNum(tok["x-ms-sgx-product-id"]);
    this.mrsigner = getStr(tok["x-ms-sgx-mrsigner"]);
    this.mrenclave = getStr(tok["x-ms-sgx-mrenclave"]);
    this.svn = getNum(tok["x-ms-sgx-svn"]);
    this.enclaveHeldData = getStr(tok["x-ms-sgx-ehd"]);
    this.collateral = new AttestationCollateral(
      getObj(tok["x-ms-sgx-collateral"])
    );
  }

  // x-ms-ver: JWT schema version (expected to be "1.0")
  public readonly schemaVersion: string;

  // x-ms-attestation-type: String value representing attestation type
  public readonly attestationType: string;

  // x-ms-policy-hash: Hash of Azure Attestation evaluation policy computed
  // as BASE64URL(SHA256(UTF8(BASE64URL(UTF8(policy text)))))
  public readonly policyHash: string;

  // "jti" (JWT ID) Claim - Unique identifier for the JWT
  public readonly jti: string;

  // "iss" (Issuer) Claim - The principal that issued the JWT
  public readonly iss: string;

  // "iat" (Issued At) Claim - The time at which the JWT was issued at
  public readonly iat: Date;

  // "exp" (Expiration Time) Claim - Expiration time after which the JWT must not
  // be accepted for processing
  public readonly exp: Date;

  // "nbf" (Not Before) Claim - Not Before time before which the JWT must not
  // be accepted for processing
  public readonly nbf: Date;

  // x-ms-sgx-is-debuggable: A Boolean, which indicates whether or not the
  // enclave has debugging enabled or not
  public readonly isDebuggable: boolean;

  // x-ms-sgx-product-id: Product ID value of the SGX enclave
  public readonly productId: number;

  // x-ms-sgx-mrsigner: hex encoded value of the “mrsigner” field of the quote
  public readonly mrsigner: string;

  // x-ms-sgx-mrenclave: hex encoded value of the “mrenclave” field of the quote
  public readonly mrenclave: string;

  // x-ms-sgx-svn: security version number encoded in the quote
  public readonly svn: number;

  // x-ms-sgx-ehd: enclave held data formatted as BASE64URL(enclave held data)
  public readonly enclaveHeldData: string;

  // x-ms-sgx-collateral: JSON object describing the collateral used to perform attestation
  public readonly collateral: AttestationCollateral;
}

class AttestationCollateral {
  constructor(col: Record<string, unknown>) {
    this.qeIdCertHash = getStr(col["qeidcertshash"]);
    this.qeIdCrlHash = getStr(col["qeidcrlhash"]);
    this.qeIdHash = getStr(col["qeidhash"]);
    this.quoteHash = getStr(col["quotehash"]);
    this.TcbInfoCertHash = getStr(col["tcbinfocertshash"]);
    this.TcbInfoCrlHash = getStr(col["tcbinfocrlhash"]);
    this.TcbInfoHash = getStr(col["tcbinfohash"]);
  }
  // qeidcertshash: SHA256 value of Quoting Enclave (QE) Identity issuing certs
  public readonly qeIdCertHash: string;

  // qeidcrlhash: SHA256 value of QE Identity issuing certs CRL list
  public readonly qeIdCrlHash: string;

  // qeidhash: SHA256 value of the QE Identity collateral
  public readonly qeIdHash: string;

  // quotehash: SHA256 value of the evaluated quote
  public readonly quoteHash: string;

  // tcbinfocertshash: SHA256 value of the TCB Info issuing certs
  public readonly TcbInfoCertHash: string;

  // tcbinfocrlhash: SHA256 value of the TCB Info issuing certs CRL list
  public readonly TcbInfoCrlHash: string;

  // tcbinfohash: SHA256 value of the TCB Info collateral
  public readonly TcbInfoHash: string;
}
