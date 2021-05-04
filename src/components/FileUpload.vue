<template>
  <div>
    <el-row>
      <el-col>
        <el-button
          size="small"
          type="primary"
          :disabled="
            Boolean(
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
          <el-descriptions-item label="Upload password">
            {{ uploadResult?.password }}
          </el-descriptions-item>
          <el-descriptions-item label="Upload uuid">
            {{ uploadResult?.uuid }}
          </el-descriptions-item>
        </el-descriptions>

        <span style="display: flex; justify-content: space-between">
          <el-button
            size="small"
            type="danger"
            v-show="state._file.state === 'queue'"
            @click="
              state._file.clear();
              encryptionResult = undefined;
            "
          >
            Remove File
          </el-button>

          <el-button
            size="small"
            type="success"
            v-show="state._file.state === 'queue'"
            @click="uploadFile(state._file)"
          >
            Encrypt and Upload File
          </el-button>
        </span>
      </el-col>
    </el-row>
    <el-row>
      <el-col v-if="encryptionResult && state._file.state">
        <el-descriptions direction="vertical" :column="1" border size="small">
          <el-descriptions-item label="Secret key">
            {{ encryptionResult.keyBase64 }}
          </el-descriptions-item>
          <el-descriptions-item label="Nonce">
            {{ encryptionResult.nonceBase64 }}
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
  reactive
} from "vue";
import { UploadFile, useUpload } from "@websanova/vue-upload";
import { mapActions, mapState } from "vuex";

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
    ...mapState(["uploadResult"]),
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
    ...mapActions(["encryptAndUploadFile"]),
    /** Encrypt the given file to encryptionResult. */
    async uploadFile(uploadFile: UploadFile) {
      await this.encryptAndUploadFile(uploadFile.$file);
    }
  }
});
</script>
