import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// axios
import axios from "./plugins/axios.js";
// upload
import upload from "./plugins/upload.js";

createApp(App).use(router).use(axios).use(upload).mount("#app");
