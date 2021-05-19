<template>
  <div>
    <el-row>
      <el-col>
        <el-button
          size="small"
          type="primary"
          v-if="
            !Boolean(
              state._file.state ||
                state._file.state === 'success' ||
                state._file.state === 'error'
            )
          "
          @click="select"
        >
          Select File
        </el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col v-if="state._file.state">
        <el-descriptions
          title="Selected file"
          direction="horizontal"
          :column="1"
          border
          size="small"
        >
          <el-descriptions-item label="Name">
            {{ state._file.name }}
          </el-descriptions-item>
          <el-descriptions-item label="Size">
            {{ (state._file.size / 1024).toFixed(2) + "kb" }}
          </el-descriptions-item>
          <el-descriptions-item label="Type">
            {{ state._file.type }}
          </el-descriptions-item>
          <el-descriptions-item label="Extension">
            {{ state._file.extension }}
          </el-descriptions-item>
          <el-descriptions-item label="Upload access key">
            {{ uploadResult?.accessKey }}
          </el-descriptions-item>
          <el-descriptions-item label="Upload uuid">
            {{ uploadResult?.uuid }}
          </el-descriptions-item>
        </el-descriptions>

        <span style="display: flex; justify-content: space-between">
          <el-button
            size="small"
            type="danger"
            v-if="state._file.state === 'queue'"
            @click="
              state._file.clear();
              state.encryptionResult = undefined;
            "
          >
            Remove File
          </el-button>

          <el-button
            size="small"
            type="success"
            v-if="state._file.state === 'queue'"
            @click="uploadFile()"
          >
            Encrypt and Upload File
          </el-button>
        </span>
      </el-col>
    </el-row>
    <el-row>
      <el-col v-if="state.encryptionResult && state._file.state">
        <el-descriptions direction="vertical" :column="1" border size="small">
          <el-descriptions-item label="Secret key">
            {{ state.encryptionResult.keyBase64 }}
          </el-descriptions-item>
          <el-descriptions-item label="Nonce">
            {{ state.encryptionResult.nonceBase64 }}
          </el-descriptions-item>
        </el-descriptions>

        <a
          class="btn btn-primary m-2 float-right"
          :href="encryptedFileURL"
          download
        >
          Save Encrypted File
        </a>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onBeforeUnmount,
  onMounted,
  reactive,
  watch
} from "vue";
import { useUpload } from "@websanova/vue-upload";
import { useStore } from "vuex";

interface EncryptionResult {
  cipherBlob: Blob;
  nonceBase64: string;
  keyBase64: string;
}

export default defineComponent({
  setup() {
    const upload = useUpload();
    const state = reactive({
      encryptionResult: (undefined as unknown) as EncryptionResult,
      _file: computed(() => {
        return upload.file("the-file");
      })
    });
    const encryptedFileURL = computed(() => {
      return state.encryptionResult?.cipherBlob
        ? URL.createObjectURL(state.encryptionResult.cipherBlob)
        : undefined;
    });

    watch(encryptedFileURL, (_newURL, oldURL): void => {
      if (oldURL) URL.revokeObjectURL(oldURL);
    });

    function select() {
      upload.select("the-file");
    }

    const store = useStore();
    function uploadFile() {
      store.dispatch("encryptAndUploadFile", state._file.$file);
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
      select,
      uploadFile,
      encryptedFileURL,
      uploadResult: computed(() => store.state["uploadResult"])
    };
  }
});
</script>
