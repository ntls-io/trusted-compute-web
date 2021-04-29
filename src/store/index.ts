import { createLogger, createStore } from "vuex";

export default createStore({
  plugins: process.env.NODE_ENV !== "production" ? [createLogger()] : [],
  state: {
    jwtToken: null
  },
  getters: {},
  mutations: {
    saveToken(state, token) {
      state.jwtToken = token;
    }
  },
  actions: {
    saveToken({ commit }, token) {
      commit("saveToken", token);
    }
  },
  modules: {}
});
