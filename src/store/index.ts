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
import {
  Request as UploadRequest,
  Response as UploadResponse
} from "@/models/data-upload";
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
    setDecryptedMsg(state, msg) {
      state.executionToken = msg;
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
      const enclavePubKey = getters.enclavePublicKey;
      if (!enclavePubKey) {
        return null;
      }
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
      request: UploadRequest
    ): Promise<void> {
      const res = await axios.post<UploadResponse>(
        "https://rtc-data.registree.io/data/uploads",
        request,
        { validateStatus: status => status === 200 }
      );
      const enclavePubKey = getters.enclavePublicKey;
      const ourSecretKey = state.ourSecretKey;

      if (!enclavePubKey || !ourSecretKey) {
        // TODO: Error Handling
        throw "error";
      }

      const { nonce, ciphertext } = res.data;

      const msg = decryptMessage(
        ciphertext,
        nonce,
        enclavePubKey,
        ourSecretKey
      );

      if (!msg) {
        // TODO: Error Handling
        throw "error";
      }

      await dispatch("parseUploadMessage", msg);
    },
    async postAccessForm(
      { commit, getters, state },
      request: UploadRequest
    ): Promise<void> {
      const res = await axios.post<UploadResponse>(
        "https://rtc-data.registree.io/auth/tokens",
        request,
        { validateStatus: status => status === 200 }
      );
      const enclavePubKey = getters.enclavePublicKey;
      const ourSecretKey = state.ourSecretKey;

      if (!enclavePubKey || !ourSecretKey) {
        // TODO: Error Handling
        throw "error";
      }

      const { nonce, ciphertext } = res.data;

      const msg = decryptMessage(
        ciphertext,
        nonce,
        enclavePubKey,
        ourSecretKey
      );

      if (!msg) {
        // TODO: Error Handling
        throw "error";
      }

      commit("setDecryptedMsg", msg);
    },
    async decryptResponse({ state, getters }, response: UploadResponse) {
      const enclavePubKey = getters.enclavePublicKey;
      if (!enclavePubKey || !state.ourSecretKey) {
        // TODO: Error Handling
        return "error";
      }
      return decryptMessage(
        response.ciphertext,
        response.nonce,
        enclavePubKey,
        state.ourSecretKey
      );
    },
    async parseUploadMessage({ commit }, message: Uint8Array) {
      console.log("parseUploadMessage:", message);
      const accessKey = btoa(message.slice(0, 24).toString());
      const uuid = message.slice(24);
      commit("saveUploadResult", { accessKey, uuid });
    },
    async requestExecutionToken({ commit, dispatch, getters }, data) {
      const enclavePubKey = getters.enclavePublicKey;
      if (!enclavePubKey) {
        return null;
      }
      const { ourData, messageData } = await encryptJson(
        data,
        enclavePubKey as Base64
      );

      commit("saveSecretKey", ourData.ourSecretKey);
      dispatch("postAccessForm", {
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
