<template>
  <el-form
    label-width="auto"
    :model="form"
    :rules="rules"
    :disabled="loading"
    ref="accessForm"
  >
    <pre>{{ form }}</pre>
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
        Request
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script lang="ts">
import { computed, defineComponent, reactive, ref, toRefs, watch } from "vue";
import elForm from "element-plus/lib/el-form";
import { ElMessageBox } from "element-plus";
import { useStore } from "vuex";
import { notifyErrors } from "@/utils/error-notification";
import util from "tweetnacl-util";

interface Form {
  access_key: string | null;
  uuid: string | null;
  hash: string | null;
  nofu: number;
}

export default defineComponent({
  setup() {
    const store = useStore();

    const state = {
      form: reactive({
        access_key: null,
        uuid: null,
        hash: null,
        nofu: 1
      }),
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
      loading: ref(false)
    };

    const executionToken = computed(() => store.state["executionToken"]);

    watch(executionToken, async (token: Uint8Array | null): Promise<void> => {
      if (token) {
        await ElMessageBox({
          title: "Please copy and save this execution token",
          message: util.encodeBase64(token),
          beforeClose: () => {
            store.commit("setExecutionToken", null);
          }
        });
      }
    });

    return {
      ...toRefs(state),
      requestExecutionToken: (_x: Form) =>
        store.dispatch("requestExecutionToken")
    };
  },
  methods: {
    onSubmit(formName: string) {
      (this.$refs[formName] as typeof elForm).validate(
        async (valid: boolean) => {
          if (valid) {
            this.loading = true;
            // Get the unproxied form data before encrypting, for clarity.
            const data = Object.assign({}, this.form);
            await notifyErrors("Execution token request failed", () => {
              return this.requestExecutionToken(data);
            });
            this.loading = false;
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
