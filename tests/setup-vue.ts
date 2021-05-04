import axios from "@/plugins/axios";
import upload from "@/plugins/upload";
import store from "@/store";
import { config } from "@vue/test-utils";
import ElementPlus from "element-plus";

// https://next.vue-test-utils.vuejs.org/api/#global
config.global.plugins = [ElementPlus, store, axios, upload];
