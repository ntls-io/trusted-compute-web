/**
 * Cryptographic helpers.
 */
import nacl from "tweetnacl";
import util from "tweetnacl-util";

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
  plainBlob: Blob
): Promise<{
  cipherBlob: Blob;
  keyBase64: string;
  nonceBase64: string;
}> {
  const plaintext = new Uint8Array(await plainBlob.arrayBuffer());
  const { ciphertext, key, nonce } = encryptSecretbox(plaintext);
  return {
    cipherBlob: new Blob([ciphertext.buffer], {
      type: "application/octet-stream"
    }),
    keyBase64: util.encodeBase64(key),
    nonceBase64: util.encodeBase64(nonce)
  };
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
