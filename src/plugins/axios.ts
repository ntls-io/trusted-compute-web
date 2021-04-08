import axios from "axios";
import { App } from "vue";
import VueAxios from "vue-axios";

export default (app: App): App => app.use(VueAxios, axios);
