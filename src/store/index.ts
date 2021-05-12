import { createLogger, createStore } from "vuex";
import { encryptBlob, Base64, decryptMessage } from "@/utils/cryptography";
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
}

// TODO: add typescript typings for Vuex
// See: https://next.vuex.vuejs.org/guide/typescript-support.html#typing-store-property-in-vue-component
export default createStore<State>({
  plugins: process.env.NODE_ENV !== "production" ? [createLogger()] : [],
  state: {
    jwtToken: null,
    ourSecretKey: null,
    attestationResult: null,
    uploadResult: null
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
    }
  },
  actions: {
    async requestAttestation({ commit }) {
      const res = await axios
        .get(
          process.env.VUE_APP_JWT_URL ??
            "https://rtc-data.registree.io/data/attest"
        )
        .catch(err => {
          throw err;
        });
      // Use tokenFile.token for testing if the server is not up
      const attestationResult = verifyToken(res.data);
      commit("saveToken", res.data);
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
    async uploadFile({ dispatch }, request: UploadRequest) {
      const res = await axios.post<UploadResponse>(
        "https://rtc-data.registree.io/data/uploads",
        request
      );
      if (res.status !== 200) {
        return "error";
      }
      await dispatch("decryptUploadResponse", res.data);
    },
    async decryptUploadResponse(
      { state, dispatch, getters },
      response: UploadResponse
    ) {
      const enclavePubKey = getters.enclavePublicKey;
      if (!enclavePubKey || !state.ourSecretKey) {
        return "error";
      }
      const msg = decryptMessage(
        response.ciphertext,
        response.nonce,
        enclavePubKey,
        state.ourSecretKey
      );
      if (!msg) {
        // TODO: Error Handling
        return "error";
      }
      await dispatch("parseUploadMessage", msg);
    },
    async parseUploadMessage({ commit }, message: Uint8Array) {
      console.log("parseUploadMessage:", message);
      const accessKey = btoa(message.slice(0, 24).toString());
      const uuid = message.slice(24);
      commit("saveUploadResult", { accessKey, uuid });
    }
  },
  modules: {}
});
