/**
 * Cryptographic helpers.
 */
import nacl from "tweetnacl";
import util from "tweetnacl-util";

export type Base64 = string;

export interface MessageData {
  ourPublicKey: Base64;
  nonce: Base64;
  ciphertext: Base64;
}

export interface OurData {
  ourSecretKey: Base64;
}

export interface EncryptedMessage {
  readonly ourData: OurData;
  readonly messageData: MessageData;
}

/**
 * Encrypt some data with a new secret key.
 *
 * This is currently one-shot: the data should fit in memory.
 * For streaming encryption, we should look at nacl-stream-js or nacl-blob.
 *
 * @see https://github.com/dchest/nacl-stream-js
 * @see https://github.com/bcomnes/nacl-blob
 */
export async function encryptBytes(
  plaintext: Uint8Array,
  theirPublicKey: Base64
): Promise<EncryptedMessage> {
  const { ciphertext, nonce, ourPublicKey, ourSecretKey } = encryptBox(
    plaintext,
    util.decodeBase64(theirPublicKey)
  );
  console.log("encryptBytes ciphertext.length:", ciphertext.length);

  return {
    ourData: {
      ourSecretKey: util.encodeBase64(ourSecretKey)
    },
    messageData: {
      ourPublicKey: util.encodeBase64(ourPublicKey),
      nonce: util.encodeBase64(nonce),
      ciphertext: util.encodeBase64(ciphertext)
    }
  };
  // FIXME: For now, this is using Base64 here for all the key values,
  //        but this gets very inefficient for larger file uploads.
  //        We should change the strategy here in the future,
  //        such as using headers for the file upload metadata.
  //
  //   cipherBlob: new Blob([ciphertext.buffer], {
  //     type: "application/octet-stream"
  //   })
}

/**
 * Helper: Encrypt a Blob (File).
 *
 * @see encryptBytes
 */
export async function encryptBlob(
  plainBlob: Blob,
  theirPublicKey: Base64
): Promise<EncryptedMessage> {
  console.log("encryptBlob:", { plainBlob, theirPublicKey });
  const plaintext = new Uint8Array(await plainBlob.arrayBuffer());
  return encryptBytes(plaintext, theirPublicKey);
}

/**
 * Helper: Encrypt a JSON value.
 *
 * @see encryptBytes
 */
export async function encryptJson(
  value: unknown,
  theirPublicKey: Base64
): Promise<EncryptedMessage> {
  const valueString = JSON.stringify(value);
  console.log("encryptJson:", { value, valueString, theirPublicKey });
  const plaintext = new TextEncoder().encode(valueString);
  return encryptBytes(plaintext, theirPublicKey);
}

export function decryptMessage(
  ciphertext: Base64,
  nonce: Base64,
  theirPublicKey: Base64,
  ourSecretKey: Base64
): Uint8Array | null {
  return decryptBox(
    util.decodeBase64(ciphertext),
    util.decodeBase64(nonce),
    util.decodeBase64(theirPublicKey),
    util.decodeBase64(ourSecretKey)
  );
}

/**
 * Helper: Encrypt data to a NaCl box with a new local key pair.
 */
function encryptBox(
  plaintext: Uint8Array,
  theirPublicKey: Uint8Array
): {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  ourPublicKey: Uint8Array;
  ourSecretKey: Uint8Array;
} {
  const { publicKey: ourPublicKey, secretKey: ourSecretKey } =
    nacl.box.keyPair();
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const ciphertext = nacl.box(plaintext, nonce, theirPublicKey, ourSecretKey);
  return { ciphertext, nonce, ourPublicKey, ourSecretKey };
}

function decryptBox(
  ciphertext: Uint8Array,
  nonce: Uint8Array,
  theirPublicKey: Uint8Array,
  ourSecretKey: Uint8Array
): Uint8Array | null {
  const plaintext = nacl.box.open(
    ciphertext,
    nonce,
    theirPublicKey,
    ourSecretKey
  );
  return plaintext;
}
