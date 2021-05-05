<template>
  <el-main>
    <el-row :gutter="10">
      <el-col :span="16">
        <JwtDisplay />
      </el-col>
      <el-col :span="8">
        <Attestation />
      </el-col>
    </el-row>
  </el-main>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import JwtDisplay from "@/components/JwtDisplay.vue";
import Attestation from "@/components/Attestation.vue";
import { mapActions } from "vuex";

export default defineComponent({
  name: "Data Access",
  components: {
    Attestation,
    JwtDisplay
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
