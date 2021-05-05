<template>
  <el-main>
    <div>
      <Attestation />
    </div>
    <el-row>
      <el-col :span="16"> <FileUpload /></el-col>
    </el-row>
  </el-main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FileUpload from "@/components/FileUpload.vue";
import Attestation from "@/components/Attestation.vue";
import { mapActions } from "vuex";

export default defineComponent({
  name: "Home",
  components: {
    Attestation,
    FileUpload
  },
  async mounted() {
    await this.getAttestation();
  },
  methods: {
    ...mapActions(["requestAttestation"]),
    async getAttestation() {
      await this.requestAttestation();
    }
  }
});
</script>
