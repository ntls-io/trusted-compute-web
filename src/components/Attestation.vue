<template>
  <el-row :gutter="15">
    <el-col v-for="(key, i) in user_attestation" :key="i">
      <el-card>
        <template #header>
          <span>{{ key }}</span>
        </template>
        <div v-if="Boolean(attestation)" class="text-break text-small">
          {{ attestation[key] }}
        </div>
      </el-card>
    </el-col>
  </el-row>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { mapState } from "vuex";

export default defineComponent({
  data() {
    return {
      user_attestation: ["mrsigner", "mrenclave"]
    };
  },
  computed: {
    ...mapState({
      attestation: "attestationResult"
    })
  }
});
</script>

<style lang="scss" scoped>
.el-col {
  margin-bottom: 10px;
}
</style>
