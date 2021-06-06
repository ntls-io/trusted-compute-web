<template>
  <el-form label-width="auto" :model="form" :rules="rules" ref="execForm">
    <el-form-item label="Token" prop="exec_token">
      <el-input
        v-model="form.exec_token"
        placeholder="Execution Token"
        :rows="4"
        type="textarea"
        autocomplete="off"
      ></el-input>
    </el-form-item>
    <el-form-item style="margin-top: 15px">
      <el-button
        type="primary"
        :disabled="!Boolean(form?.exec_token?.trim())"
        @click="onSubmit('execForm')"
      >
        Execute
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { ElForm } from "element-plus";
import { defineComponent, reactive, toRefs } from "vue";
import { mapActions } from "vuex";

export default defineComponent({
  setup() {
    const state = reactive({
      form: {
        exec_token: null
      },
      rules: {
        access_key: [
          {
            required: true,
            message: "Token is required",
            trigger: "change"
          }
        ]
      }
    });

    return { ...toRefs(state) };
  },
  methods: {
    ...mapActions(["executionRequest"]),
    onSubmit(formName: string) {
      (this.$refs[formName] as typeof ElForm).validate(
        async (valid: boolean) => {
          if (valid) {
            // Get the unproxied form data before encrypting, for clarity.
            // const data = Object.assign({}, this.form);
            //TODO: Encrypt the execution token with the exec_enclave's public key and a local ephemeral private key (use existing box functions)
            //TODO: Send the encrypted token + some execution parameters to /exec/request
            //TODO: Display the result from the execution (or poll an endpoint to display the status and then the result when ready)
          } else {
            console.log("error submit!!");
            return false;
          }
        }
      );
    }
  }
});
</script>
