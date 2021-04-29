<template>
  <div class="no-gutter">
    <div class="row justify-content-center">
      <div class="col-auto">
        <button
          :disabled="
            state._file.state ||
            state._file.state === 'success' ||
            state._file.state === 'error'
          "
          @click="select"
          class="btn btn-success m-2"
        >
          Select File
        </button>
      </div>
    </div>
    <div class="row justify-content-center py-3">
      <div class="col-auto" v-if="state._file.state">
        <ul class="list-group">
          <li class="list-group-item">Name: {{ state._file.name }}</li>
          <li class="list-group-item">
            Size: {{ (state._file.size / 1024).toFixed(2) + "kb" }}
          </li>
          <li class="list-group-item">Type: {{ state._file.type }}</li>
          <li class="list-group-item">
            Extension: {{ state._file.extension }}
          </li>
        </ul>

        <button
          v-show="state._file.state === 'queue'"
          @click="
            state._file.clear();
            encryptionResult = undefined;
          "
          class="btn btn-danger m-2"
        >
          Remove File
        </button>

        <button
          v-show="state._file.state === 'queue'"
          @click="encryptFile(state._file)"
          class="btn btn-warning m-2"
        >
          Encrypt File
        </button>
      </div>
    </div>
    <div class="row justify-content-center py-3">
      <div class="col-auto" v-if="encryptionResult && state._file.state">
        <ul class="list-group">
          <li class="list-group-item text-break">
            <div class="fw-bold">Secret key</div>
            {{ encryptionResult.keyBase64 }}
          </li>
          <li class="list-group-item text-break">
            <div class="fw-bold">Nonce</div>
            {{ encryptionResult.nonceBase64 }}
          </li>
        </ul>

        <a
          class="btn btn-primary m-2 float-right"
          :href="encryptedFileURL"
          download
        >
          Save Encrypted File
        </a>
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
  reactive
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
    encryptionResult: undefined
  }),
  computed: {
    /** Allocate an object URL for encryptedFile. */
    encryptedFileURL(): string | undefined {
      return this.encryptionResult?.cipherBlob
        ? URL.createObjectURL(this.encryptionResult.cipherBlob)
        : undefined;
    }
  },
  watch: {
    /** Release old object URLs on change.  */
    encryptedFileURL(newURL: string, oldURL: string): void {
      if (oldURL) URL.revokeObjectURL(oldURL);
    }
  },
  setup() {
    const upload = useUpload();
    const state = reactive({
      _file: computed(() => {
        return upload.file("the-file");
      })
    });
    function select() {
      upload.select("the-file");
    }
    onMounted(() => {
      upload.on("the-file", {
        startOnSelect: false,
        maxSizePerFile: 1024 * 1024 * 3
      });
    });
    onBeforeUnmount(() => {
      upload.off("the-file");
    });
    return {
      state,
      select
    };
  },
  methods: {
    /** Encrypt the given file to encryptionResult. */
    async encryptFile(uploadFile: UploadFile) {
      this.encryptionResult = await encryptBlob(uploadFile.$file);
    }
  }
});
</script>
