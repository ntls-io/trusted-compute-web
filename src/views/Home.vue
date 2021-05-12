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
import { ElNotification } from "element-plus";
import { mapActions } from "vuex";

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
      try {
        await this.requestAttestation();
      } catch (e) {
        // TODO: Better error handling when the attestation call fails
        ElNotification({
          type: "error",
          message: "Server Unavailable",
          duration: 2500
        });
      }
    }
  }
});
</script>
