import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import axios from "./plugins/axios";
import upload from "./plugins/upload";

createApp(App).use(router).use(axios).use(upload).mount("#app");
