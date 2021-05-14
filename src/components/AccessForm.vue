<template>
  <el-form label-width="auto" :model="form" :rules="rules" ref="accessForm">
    <el-form-item label="Key" prop="access_key">
      <el-input
        v-model="form.access_key"
        placeholder="Data access key"
        type="password"
        autocomplete="off"
      ></el-input>
    </el-form-item>
    <el-form-item label="UUID" prop="uuid">
      <el-input
        v-model="form.uuid"
        placeholder="Data UUID / Identifier"
        autocomplete="off"
      ></el-input>
    </el-form-item>
    <el-form-item label="Hash" prop="hash">
      <el-input
        v-model="form.hash"
        placeholder="SHA-256 of the binary to authorise"
        autocomplete="off"
      ></el-input>
    </el-form-item>
    <el-form-item label="Number of uses">
      <el-input-number
        v-model.number="form.nofu"
        :min="1"
        :max="100"
      ></el-input-number>
    </el-form-item>
    <el-form-item style="margin-top: 15px">
      <el-button
        type="primary"
        :loading="loading"
        @click="onSubmit('accessForm')"
      >
        Create
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { decryptMessage, encryptJson, MessageData } from "@/utils/cryptography";
import elForm from "element-plus/lib/el-form";
import { notifyErrors } from "@/utils/error-notification";

export default defineComponent({
  data() {
    return {
      form: {
        access_key: null,
        uuid: null,
        hash: null,
        nofu: 1
      },
      rules: {
        access_key: [
          {
            required: true,
            message: "Access key is required",
            trigger: "change"
          }
        ],
        uuid: [
          {
            required: true,
            message: "UUID is required",
            trigger: "change"
          }
        ],
        hash: [
          {
            required: true,
            message: "Hash is required",
            trigger: "change"
          }
        ]
      },
      loading: false
    };
  },
  computed: {
    serverPublicKey() {
      return this.$store.getters.enclavePublicKey;
    },
    ourSecretKey() {
      return this.$store.getters.ourSecretKey;
    }
  },
  methods: {
    onSubmit(formName: string) {
      (this.$refs[formName] as typeof elForm).validate(
        async (valid: boolean) => {
          if (valid) {
            this.loading = true;
            // Get the unproxied form data before encrypting, for clarity.
            const data = Object.assign({}, this.form);
            const { messageData } = await encryptJson(
              data,
              this.serverPublicKey
            );
            if (messageData) {
              await this.postEncryptedBox(messageData);
            }
          } else {
            console.log("error submit!!");
            return false;
          }
        }
      );
    },
    async postEncryptedBox(messageData: MessageData) {
      const payload = {
        metadata: {
          nonce: messageData.nonce,
          uploader_pub_key: messageData.ourPublicKey
        },
        payload: messageData.ciphertext
      };
      await this.axios
        .post("https://rtc-data.registree.io/auth/tokens", payload)
        .then(async result => {
          console.log(result);
          if (result.status === 200) {
            const { execution_token, nonce } = result.data;
            await notifyErrors("decryptMessage failed", async () =>
              decryptMessage(
                execution_token,
                nonce,
                this.serverPublicKey,
                this.ourSecretKey
              )
            );
          }
        })
        .catch(error => {
          console.log(`post resul ${error}`);
        })
        .finally(() => {
          this.loading = false;
        });
    }
  }
});
</script>
