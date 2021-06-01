/**
 * Types for dealing with sealed API calls.
 */

export interface SealedRequest {
  readonly metadata: Metadata;
  // Base64 encoded Uint8Array
  readonly payload: string;
}

export interface Metadata {
  // Base64 encoded Uint8Array
  readonly uploader_pub_key: string;
  // Base64 encoded Uint8Array
  readonly nonce: string;
}

export interface SealedResponse {
  // Base64 encoded Uint8Array
  readonly ciphertext: string;
  // Base64 encoded Uint8Array
  readonly nonce: string;
}
