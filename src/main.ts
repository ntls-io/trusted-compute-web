import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
// axios
import axios from "./plugins/axios.js";

createApp(App).use(router).use(axios).mount("#app");
