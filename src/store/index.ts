import { checkDefined } from "@/utils/checks";
import { createLogger, createStore } from "vuex";
import {
  encryptBlob,
  Base64,
  decryptMessage,
  encryptJson
} from "@/utils/cryptography";
import { verifyToken } from "@/utils/jwt";
import { AttestationToken } from "@/utils/attestation-token";
import base64url from "base64url";
import { SealedRequest, SealedResponse } from "@/models/sealed-calls";
import axios from "axios";

export interface State {
  jwtToken: string | null;
  ourSecretKey: Base64 | null;
  attestationResult: AttestationToken | null;
  uploadResult: { accessKey: string; uuid: Uint8Array } | null;
  executionToken: Uint8Array | null;
}

// TODO: add typescript typings for Vuex
// See: https://next.vuex.vuejs.org/guide/typescript-support.html#typing-store-property-in-vue-component
export default createStore<State>({
  plugins: process.env.NODE_ENV !== "production" ? [createLogger()] : [],
  state: {
    jwtToken: null,
    ourSecretKey: null,
    attestationResult: null,
    uploadResult: null,
    executionToken: null
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
    saveSecretKey(state, secretKey: Base64) {
      state.ourSecretKey = secretKey;
    },
    saveUploadResult(
      state,
      uploadResult: { accessKey: string; uuid: Uint8Array }
    ) {
      state.uploadResult = uploadResult;
    },
    // XXX: The execution token will probably be a JWT value later,
    //      but for now, just save it as raw bytes.
    setExecutionToken(state: State, executionToken: Uint8Array): void {
      state.executionToken = executionToken;
    }
  },
  actions: {
    async requestAttestation({ commit }) {
      const token = await fetchAttestationToken();
      const attestationResult = verifyToken(token);
      commit("saveToken", token);
      commit("saveAttestationResult", attestationResult);
    },
    saveToken({ commit }, token) {
      commit("saveToken", token);
    },
    async encryptAndUploadFile({ commit, dispatch, getters }, message: File) {
      const enclavePubKey: string = checkDefined(getters.enclavePublicKey);
      const { ourData, messageData } = await encryptBlob(
        message,
        enclavePubKey as Base64
      );
      commit("saveSecretKey", ourData.ourSecretKey);
      dispatch("uploadFile", {
        metadata: {
          nonce: messageData.nonce,
          uploader_pub_key: messageData.ourPublicKey
        },
        payload: messageData.ciphertext
      });
    },
    async uploadFile(
      { dispatch, getters, state },
      request: SealedRequest
    ): Promise<void> {
      const res = await axios.post<SealedResponse>(
        "https://rtc-data.registree.io/data/uploads",
        request,
        { validateStatus: status => status === 200 }
      );
      const enclavePubKey: string = checkDefined(getters.enclavePublicKey);
      const ourSecretKey: Base64 = checkDefined(state.ourSecretKey);

      const { nonce, ciphertext } = res.data;

      const msg: Uint8Array = checkDefined(
        decryptMessage(ciphertext, nonce, enclavePubKey, ourSecretKey)
      );

      await dispatch("parseUploadMessage", msg);
    },
    async postAccessForm(
      { commit, getters, state },
      request: SealedRequest
    ): Promise<void> {
      const res = await axios.post<SealedResponse>(
        "https://rtc-data.registree.io/auth/tokens",
        request,
        { validateStatus: status => status === 200 }
      );
      const enclavePubKey: string = checkDefined(getters.enclavePublicKey);
      const ourSecretKey: Base64 = checkDefined(state.ourSecretKey);

      const { nonce, ciphertext } = res.data;

      const msg: Uint8Array = checkDefined(
        decryptMessage(ciphertext, nonce, enclavePubKey, ourSecretKey)
      );

      commit("setExecutionToken", msg);
    },
    async parseUploadMessage({ commit }, message: Uint8Array) {
      console.log("parseUploadMessage:", message);
      const accessKey = btoa(message.slice(0, 24).toString());
      const uuid = message.slice(24);
      commit("saveUploadResult", { accessKey, uuid });
    },

    /**
     * Submit an execution token request.
     *
     * @see #actions#postAccessForm
     * @see #mutations#setExecutionToken
     */
    async requestExecutionToken(
      { commit, dispatch, getters },
      executionTokenRequest
    ): Promise<void> {
      const enclavePubKey: string = checkDefined(getters.enclavePublicKey);
      const { ourData, messageData } = await encryptJson(
        executionTokenRequest,
        enclavePubKey as Base64
      );

      commit("saveSecretKey", ourData.ourSecretKey);
      await dispatch("postAccessForm", {
        metadata: {
          nonce: messageData.nonce,
          uploader_pub_key: messageData.ourPublicKey
        },
        payload: messageData.ciphertext
      });
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
async function fetchAttestationToken(): Promise<string> {
  const url =
    process.env.VUE_APP_JWT_URL ?? "https://rtc-data.registree.io/data/attest";

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
