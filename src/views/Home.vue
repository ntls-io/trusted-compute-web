<template>
  <el-main>
    <el-row :gutter="10">
      <el-col :span="16">
        <JwtDisplay />
      </el-col>
      <el-col :span="8">
        <Attestation />
        <FileUpload />
      </el-col>
    </el-row>
  </el-main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FileUpload from "@/components/FileUpload.vue";
import JwtDisplay from "@/components/JwtDisplay.vue";
import Attestation from "@/components/Attestation.vue";
import { mapActions } from "vuex";
import { notifyErrors } from "@/utils/error-notification";

export default defineComponent({
  name: "Home",
  components: {
    Attestation,
    FileUpload,
    JwtDisplay
  },
  async mounted() {
    await this.getAttestation();
  },
  methods: {
    ...mapActions(["requestAttestation"]),
    async getAttestation() {
      // TODO: Better error handling when the attestation call fails
      await notifyErrors(
        "Attestation failed",
        async () => await this.requestAttestation()
      );
    }
  }
});
</script>
