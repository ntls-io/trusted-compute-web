<template>
  <el-card v-loading="isBusy.fetchingToken || Boolean(!jwtToken)">
    <template #header>
      <div class="card-header">
        <span>JWT Token</span>
        <span>
          <el-button size="small" @click="getAttestation()"> Fetch </el-button>
          <el-button
            size="small"
            type="primary"
            @click="copy(jwtToken)"
            :disabled="Boolean(!jwtToken)"
          >
            Copy
          </el-button>
        </span>
      </div>
    </template>
    <div class="text-break text-small">
      {{ jwtToken }}
    </div>
  </el-card>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from "vue";
import useClipboard from "vue-clipboard3";
import { ElNotification } from "element-plus";
import { useStore } from "vuex";

export default defineComponent({
  setup() {
    const { toClipboard } = useClipboard();
    const store = useStore();
    const isBusy = reactive({
      fetchingToken: false
    });

    const copy = async (token: string) => {
      try {
        await toClipboard(token);
        ElNotification({
          type: "success",
          message: "Copied to clipboard",
          duration: 2500
        });
      } catch (e) {
        ElNotification({
          type: "error",
          message: e
        });
      }
    };

    const getAttestation = async () => {
      isBusy.fetchingToken = true;
      await store.dispatch("requestAttestation");
      isBusy.fetchingToken = false;
    };

    return {
      isBusy,
      copy,
      getAttestation,
      jwtToken: computed(() => store.state["jwtToken"])
    };
  }
});
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
