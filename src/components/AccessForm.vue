<template>
  <el-form label-position="top" :model="form">
    <el-form-item label="Key">
      <el-input
        v-model="form.access_key"
        placeholder="Data access key"
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
        placeholder="SHA 256 hash of the binary that the data"
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
export default defineComponent({
  data() {
    return {
      form: {
        access_key: "",
        uuid: "",
        hash: "",
        nofu: 1
      }
    };
  },
  methods: {
    onSubmit() {
      console.log(this.form);
    }
  }
});
</script>

<style lang="scss" scoped>
.el-form-item {
  margin-bottom: 0;
}
</style>
