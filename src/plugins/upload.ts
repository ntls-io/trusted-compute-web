import { createUpload } from "@websanova/vue-upload";
import driverHttpAxios from "@websanova/vue-upload/src/drivers/http/axios";
import { App } from "vue";

export default (app: App): void => {
  app.use(
    createUpload({
      plugins: {
        http: app.axios,
      },
      drivers: {
        http: driverHttpAxios,
      },
      options: {},
    })
  );
};
