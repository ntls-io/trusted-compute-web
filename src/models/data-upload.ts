export interface Request {
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

export interface Response {
  // Base64 encoded Uint8Array
  readonly ciphertext: string;
  // Base64 encoded Uint8Array
  readonly nonce: string;
}
