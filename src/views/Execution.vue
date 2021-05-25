<template>
  <el-main>
    <el-row :gutter="10">
      <el-col :span="16">
        <JwtDisplay />
      </el-col>
      <el-col :span="8">
        <Attestation />
        <ExecRequest />
      </el-col>
    </el-row>
  </el-main>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import ExecRequest from "@/components/ExecRequest.vue";
import JwtDisplay from "@/components/JwtDisplay.vue";
import Attestation from "@/components/Attestation.vue";
import { useStore } from "vuex";
import { notifyErrors } from "@/utils/error-notification";

export default defineComponent({
  name: "Execution",
  components: {
    Attestation,
    ExecRequest,
    JwtDisplay
  },
  setup() {
    const store = useStore();

    async function getAttestation() {
      await notifyErrors(
        "Attestation failed",
        async () => await store.dispatch("requestAttestation")
      );
    }
    onMounted(async () => {
      await getAttestation();
    });
  }
});
</script>
