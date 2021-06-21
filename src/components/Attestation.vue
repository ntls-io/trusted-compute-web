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
import { computed, defineComponent } from "vue";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const user_attestation = ["mrsigner", "mrenclave"];
    const store = useStore();

    return {
      user_attestation,
      attestation: computed(() => store.state["attestationResult"])
    };
  }
});
</script>

<style lang="scss" scoped>
.el-col {
  margin-bottom: 10px;
}
</style>
