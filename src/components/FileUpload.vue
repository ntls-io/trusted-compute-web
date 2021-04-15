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
      @click="encryptFile(state._file)"
    >
      Encrypt
    </button>
  </div>
  <div v-if="encryptionResult">
    <div style="display: inline-block">
      <h1>Encrypted</h1>
      <div style="text-align: initial">
        <ul>
          <li>
            <a :href="encryptedFileURL" download>Encrypted file</a>
          </li>
          <li>
            Secret key:<input
              readonly
              size="48"
              :value="encryptionResult.keyBase64"
            />
          </li>
          <li>
            Nonce:
            <input readonly size="48" :value="encryptionResult.nonceBase64" />
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
} from "vue";
import { UploadFile, useUpload } from "@websanova/vue-upload";
import { encryptBlob } from "@/utils/cryptography";

export default defineComponent({
  data: (): {
    encryptionResult?: {
      cipherBlob: Blob;
      nonceBase64: string;
      keyBase64: string;
    };
  } => ({
    encryptionResult: undefined,
  }),
  computed: {
    /** Allocate an object URL for encryptedFile. */
    encryptedFileURL(): string | undefined {
      return this.encryptionResult?.cipherBlob
        ? URL.createObjectURL(this.encryptionResult.cipherBlob)
        : undefined;
    },
  },
  watch: {
    /** Release old object URLs on change.  */
    encryptedFileURL(newURL: string, oldURL: string): void {
      if (oldURL) URL.revokeObjectURL(oldURL);
    },
  },
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
        startOnSelect: false,
        maxSizePerFile: 1024 * 1024 * 3,
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
  methods: {
    /** Encrypt the given file to encryptionResult. */
    async encryptFile(uploadFile: UploadFile) {
      this.encryptionResult = await encryptBlob(uploadFile.$file);
    },
  },
});
</script>
