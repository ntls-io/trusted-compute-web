<template>
  <el-form label-width="auto" :model="form" ref="execForm">
    <el-form-item label="Token" prop="exec_token">
      <el-input
        v-model="form.exec_token"
        placeholder="Execution Token"
        :rows="4"
        type="textarea"
        autocomplete="off"
      ></el-input>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { defineComponent, reactive, toRefs } from "vue";

export default defineComponent({
  setup() {
    const state = reactive({
      form: {
        exec_token: null
      }
    });

    return { ...toRefs(state) };
  }
});
</script>
