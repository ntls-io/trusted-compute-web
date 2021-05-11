<template>
  <el-form label-width="auto" :model="form">
    <el-form-item label="Key">
      <el-input
        v-model="form.access_key"
        placeholder="Data access key"
        type="password"
        required
      ></el-input>
    </el-form-item>
    <el-form-item label="UUID">
      <el-input
        v-model="form.uuid"
        placeholder="Data UUID / Identifier"
        required
      ></el-input>
    </el-form-item>
    <el-form-item label="Hash">
      <el-input
        v-model="form.hash"
        placeholder="SHA-256 of the binary to authorise"
        required
      ></el-input>
    </el-form-item>
    <el-form-item label="Number of uses">
      <el-input-number
        v-model="form.nofu"
        :min="1"
        :max="100"
      ></el-input-number>
    </el-form-item>
    <el-form-item style="margin-top: 15px">
      <el-button type="primary" @click="onSubmit">Create</el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { encryptBlob } from "@/utils/cryptography";

export default defineComponent({
  data() {
    return {
      form: {
        access_key: null,
        uuid: null,
        hash: null,
        nofu: 1
      }
    };
  },
  methods: {
    onSubmit() {
      const encodedForm = new TextEncoder().encode(JSON.stringify(this.form));
      const enclavePublicKey = this.$store.getters.enclavePublicKey;
      encryptBlob(encodedForm, enclavePublicKey);
    }
  }
});
</script>
