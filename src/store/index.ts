import { createLogger, createStore } from "vuex";
import tokenFile from "./token.json";
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
  uploadResult: { password: string; uuid: Uint8Array } | null;
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
      uploadResult: { password: string; uuid: Uint8Array }
    ) {
      state.uploadResult = uploadResult;
    }
  },
  actions: {
    async requestAttestation({ commit }) {
      // await this.axios
      //   .get(
      //     process.env.VUE_APP_JWT_URL ??
      //     "https://rtc-data.registree.io/data/attest"
      //   )
      //   .then(({ status, data }) => {
      //     if (status === 200) {
      //       this.$store.dispatch("saveToken", data);
      //       this.attestation = {};
      //     }
      //   })
      // TODO: get token from endpoint
      const attestationResult = verifyToken(tokenFile.token);
      commit("saveToken", tokenFile.token);
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
      console.warn("TODO: dispatch messageData to uploadFile:", messageData);
      dispatch("fakeUploadFile", {
        metadata: { nonce: "asdf", uploader_pub_key: "slkasdlsdff" },
        payload: "asd;fl;dslfsfl"
      });
    },
    async fakeUploadFile({ dispatch }, request: UploadRequest) {
      console.warn("fakeUploadFile request:", request);
      const msg = Array(24 + 16).fill(12);
      await dispatch("parseUploadMessage", msg);
    },
    async uploadFile({ dispatch }, request: UploadRequest) {
      const res = await axios.post<UploadResponse>("example.com", request);
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
        return "error";
      }
      await dispatch("parseUploadMessage", msg);
    },
    async parseUploadMessage({ commit }, message: Uint8Array) {
      console.log("parseUploadMessage:", message);
      const password = btoa(message.slice(0, 24).toString());
      const uuid = message.slice(24);
      commit("saveUploadResult", { password, uuid });
    }
  },
  modules: {}
});
