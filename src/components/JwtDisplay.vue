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
import { defineComponent } from "vue";
import useClipboard from "vue-clipboard3";
import { ElNotification } from "element-plus";
import { mapActions, mapState } from "vuex";

export default defineComponent({
  data() {
    return {
      busy: { fetchingToken: false }
    };
  },
  setup() {
    const { toClipboard } = useClipboard();

    const copy = async (token: string) => {
      try {
        await toClipboard(token);
        console.log("Copied to clipboard");
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

    return { copy };
  },
  computed: {
    ...mapState(["jwtToken", "isBusy"])
  },
  methods: {
    ...mapActions(["requestAttestation"]),
    async getAttestation() {
      await this.requestAttestation();
    }
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
