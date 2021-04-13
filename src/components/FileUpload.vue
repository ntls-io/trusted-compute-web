<template>
  <div class="text-center">
    <div class="mb-2">
      <button
        v-show="
          !state._file.state ||
          state._file.state === 'success' ||
          state._file.state === 'error'
        "
        @click="select"
      >
        Select File
      </button>

      <button
        v-show="state._file.state === 'queue'"
        @click="state._file.clear()"
      >
        Remove File
      </button>
    </div>

    <div v-show="state._file.state">
      {{ state._file.name }} - {{ state._file.state }}
    </div>
  </div>
</template>

<script>
import { onMounted, onBeforeUnmount, computed, reactive } from "vue";
import { useUpload } from "@websanova/vue-upload/src/v3.js";

export default {
  setup() {
    const upload = useUpload();
    const state = reactive({
      _file: computed(() => {
        return upload.file("the-file");
      }),
    });
    function select() {
      upload.select("the-file");
    }
    onMounted(() => {
      upload.on("the-file", {
        accept: "text/csv",
        startOnSelect: false,
        maxSizePerFile: 1024 * 1024 * 3,
        extensions: ["csv"],
        onSelect: (files) => {
          console.log("onSelect");
          console.log(files);
        },
      });
    });
    onBeforeUnmount(() => {
      upload.off("the-file");
    });
    return {
      state,
      select,
    };
  },
};
</script>
