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

    <button
      v-show="state._file.state === 'queue'"
      @click="encryptFile(state?._file)"
    >
      Encrypt
    </button>
  </div>
</template>

<script lang="ts">
import { onMounted, onBeforeUnmount, computed, reactive } from "vue";
import { useUpload } from "@websanova/vue-upload/src/v3.js";
import { encrypt } from "../utils/cryptography";

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
    async function encryptFile(fileList) {
      const file = await fileList.$file.text();
      const encrypted = encrypt(file, "Secret Passphrase");
      console.log(encrypted);
    }
    onMounted(() => {
      upload.on("the-file", {
        accept: "image/*", //TODO: update with correct mimes type
        startOnSelect: false,
        maxSizePerFile: 1024 * 1024 * 3,
        extensions: ["jpg", "jpeg", "png"],
      });
    });
    onBeforeUnmount(() => {
      upload.off("the-file");
    });
    return {
      state,
      select,
      encryptFile,
    };
  },
};
</script>
