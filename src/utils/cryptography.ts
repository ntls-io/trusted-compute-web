/**
 * Cryptographic helpers.
 */
import nacl from "tweetnacl";
import util from "tweetnacl-util";

export type Base64 = string;

export interface EncryptedMessage {
  readonly ourData: {
    ourSecretKey: Base64;
  };
  readonly messageData: {
    ourPublicKey: Base64;
    nonce: Base64;
    ciphertext: Base64;
  };
}

/**
 * Encrypt a Blob (File) with a new secret key.
 *
 * This is currently one-shot: the Blob should fit in memory.
 * For streaming encryption, we should look at nacl-stream-js or nacl-blob.
 *
 * @see https://github.com/dchest/nacl-stream-js
 * @see https://github.com/bcomnes/nacl-blob
 */
export async function encryptBlob(
  plainBlob: Blob,
  enclavePublicKey: Base64
): Promise<EncryptedMessage> {
  const plaintext = new Uint8Array(await plainBlob.arrayBuffer());
  const { ciphertext, nonce, ourPublicKey, ourSecretKey } = encryptBox(
    plaintext,
    util.decodeBase64(enclavePublicKey)
  );

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

  ///** Not using blob return type for now since the metadata is passed alongside
  ///** the upload data as base46. We should change the strategy here
  ///** in the future
  //   cipherBlob: new Blob([ciphertext.buffer], {
  //     type: "application/octet-stream"
  //   }),
}

export function decryptMessage(
  ciphertext: Base64,
  nonce: Base64,
  enclavePubkey: Base64,
  ourSecretKey: Base64
): Uint8Array | null {
  return decryptBox(
    util.decodeBase64(ciphertext),
    util.decodeBase64(nonce),
    util.decodeBase64(enclavePubkey),
    util.decodeBase64(ourSecretKey)
  );
}

/**
 * Helper: Encrypt data using NaCl secretbox with a new secret key.
 */
function encryptSecretbox(
  plaintext: Uint8Array
): {
  ciphertext: Uint8Array;
  key: Uint8Array;
  nonce: Uint8Array;
} {
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength);
  const key = nacl.randomBytes(nacl.secretbox.keyLength);
  const ciphertext = nacl.secretbox(plaintext, nonce, key);
  return { ciphertext, key, nonce };
}

function encryptBox(
  plaintext: Uint8Array,
  enclavePubkey: Uint8Array
): {
  ciphertext: Uint8Array;
  nonce: Uint8Array;
  ourPublicKey: Uint8Array;
  ourSecretKey: Uint8Array;
} {
  const { publicKey, secretKey } = nacl.box.keyPair();
  const nonce = nacl.randomBytes(nacl.box.nonceLength);
  const ciphertext = nacl.box(plaintext, nonce, enclavePubkey, secretKey);

  return {
    ciphertext,
    nonce,
    ourPublicKey: publicKey,
    ourSecretKey: secretKey
  };
}

function decryptBox(
  ciphertext: Uint8Array,
  nonce: Uint8Array,
  enclavePubkey: Uint8Array,
  ourSecretKey: Uint8Array
): Uint8Array | null {
  const plaintext = nacl.box.open(
    ciphertext,
    nonce,
    enclavePubkey,
    ourSecretKey
  );
  return plaintext;
}
