import { checkDefined } from "@/utils/checks";
import { createLogger, createStore } from "vuex";
import {
  encryptBlob,
  Base64,
  decryptMessage,
  EncryptedMessage,
  encryptJson
} from "@/utils/cryptography";
import { verifyToken } from "@/utils/jwt";
import { AttestationToken } from "@/utils/attestation-token";
import base64url from "base64url";
import { SealedRequest, SealedResponse } from "@/models/sealed-calls";
import axios from "axios";

interface UploadResult {
  accessKey: string;
  uuid: Uint8Array;
}

export interface State {
  jwtToken: string | null;
  attestationResult: AttestationToken | null;
  uploadResult: UploadResult | null;
  executionToken: Uint8Array | null;
  isBusy: { fetchingToken: boolean | null | string };
}

// TODO: add typescript typings for Vuex
// See: https://next.vuex.vuejs.org/guide/typescript-support.html#typing-store-property-in-vue-component
export default createStore<State>({
  plugins: process.env.NODE_ENV !== "production" ? [createLogger()] : [],
  state: {
    jwtToken: null,
    attestationResult: null,
    uploadResult: null,
    executionToken: null,
    isBusy: { fetchingToken: null }
  },
  getters: {
    enclavePublicKey(state) {
      const token = state.attestationResult;
      if (token == null) {
        return null;
      }
      return base64url.toBase64(token.enclaveHeldData);
    }
  },
  mutations: {
    saveToken(state, token) {
      state.jwtToken = token;
    },
    saveAttestationResult(state, attestationResult) {
      state.attestationResult = attestationResult;
    },
    saveUploadResult(state, uploadResult: UploadResult) {
      state.uploadResult = uploadResult;
    },
    // XXX: The execution token will probably be a JWT value later,
    //      but for now, just save it as raw bytes.
    setExecutionToken(state: State, executionToken: Uint8Array): void {
      state.executionToken = executionToken;
    },
    setBusy(
      state,
      payload: { state: "fetchingToken"; value: null | boolean | string }
    ) {
      state.isBusy[payload.state] = payload.value;
    }
  },
  actions: {
    async requestAttestation({ commit }, path?: string) {
      commit("setBusy", { state: "fetchingToken", value: true });
      const token = await fetchAttestationToken(path);
      const attestationResult = verifyToken(token);
      commit("saveToken", token);
      commit("saveAttestationResult", attestationResult);
      commit("setBusy", { state: "fetchingToken", value: false });
    },
    saveToken({ commit }, token) {
      commit("saveToken", token);
    },

    /**
     * Upload a data file, and save the resulting UUID and access token.
     */
    async encryptAndUploadFile(context, message: File): Promise<void> {
      const uploadResult = parseUploadResponse(
        await sealedPost(
          "https://rtc-data.registree.io/data/uploads",
          message,
          checkDefined(context.getters.enclavePublicKey),
          encryptBlob
        )
      );
      context.commit("saveUploadResult", uploadResult);
    },

    /**
     * Submit an execution token request.
     */
    async requestExecutionToken(context, executionTokenRequest): Promise<void> {
      const executionToken = await sealedPost(
        "https://rtc-data.registree.io/data/uploads",
        executionTokenRequest,
        checkDefined(context.getters.enclavePublicKey),
        encryptJson
      );
      context.commit("setExecutionToken", executionToken);
    },
    async executionRequest(): Promise<void> {
      //TODO: Encrypt the execution token
    }
  },
  modules: {}
});

/**
 * Helper: Fetch the attestation JWT.
 *
 * In non-production mode (`NODE_ENV !== "production"`), if the request fails,
 * log the error and fall back to the local token for testing.
 */
async function fetchAttestationToken(path?: string): Promise<string> {
  const url = process.env.VUE_APP_RTC_DATA + (path ?? "data/attest");

  if (process.env.NODE_ENV === "production") {
    const res = await axios.get<string>(url);
    return res.data;
  } else {
    try {
      // Use a short timeout for interactive development
      const timeout = 4_000;
      const res = await axios.get<string>(url, { timeout });
      return res.data;
    } catch (e) {
      console.error(
        [
          `fetchAttestationToken: failed to fetch ${url}`,
          `Falling back to local token for testing, with NODE_ENV=${process.env.NODE_ENV}`,
          "Cause:"
        ].join("\n"),
        e
      );
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const tokenFile = require("./token.json");
      return tokenFile.token;
    }
  }
}

/**
 * Helper: Post a sealed request, and unseal the response.
 *
 * @param url - The endpoint URL to post to
 * @param value - The unsealed value to seal and post
 * @param enclavePubKey - The remote enclave's public key
 * @param encrypt - Function to encrypt (seal) the value with
 * @returns - The unsealed response bytes
 */
async function sealedPost<T>(
  url: string,
  value: T,
  enclavePubKey: Base64,
  encrypt: (value: T, theirPublicKey: Base64) => Promise<EncryptedMessage>
): Promise<Uint8Array> {
  // Seal:
  const {
    ourData: { ourSecretKey: ephemeralSecretKey },
    messageData
  }: EncryptedMessage = await encrypt(value, enclavePubKey);
  const requestBody: SealedRequest = {
    metadata: {
      nonce: messageData.nonce,
      uploader_pub_key: messageData.ourPublicKey
    },
    payload: messageData.ciphertext
  };

  // Post:
  const axiosResponse = await axios.post<SealedResponse>(url, requestBody, {
    validateStatus: status => status === 200
  });
  const responseBody: SealedResponse = axiosResponse.data;

  // Unseal:
  const { nonce, ciphertext } = responseBody;
  return checkDefined(
    decryptMessage(ciphertext, nonce, enclavePubKey, ephemeralSecretKey)
  );
}

/**
 * Helper: Parse raw data upload result to a data access key and UUID.
 */
function parseUploadResponse(bytes: Uint8Array): UploadResult {
  return {
    accessKey: btoa(bytes.slice(0, 24).toString()),
    uuid: bytes.slice(24)
  };
}
