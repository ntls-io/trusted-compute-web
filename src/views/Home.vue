<template>
  <el-main>
    <el-row :gutter="10">
      <el-col :span="16">
        <el-card v-loading="busy.fetchingToken">
          <template #header>
            <div class="card-header">
              <span>JWT Token</span>
              <span>
                <el-button size="small" @click="getAttestation()">
                  Fetch
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  @click="copy($store.state.jwtToken)"
                  :disabled="Boolean(!$store.state.jwtToken)"
                >
                  Copy
                </el-button>
              </span>
            </div>
          </template>
          <div class="text-break text-small">
            {{ $store.state.jwtToken }}
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-row :gutter="15">
          <el-col v-for="(key, i) in user_attestation" :key="i">
            <el-card>
              <template #header>
                <span>{{ key }}</span>
              </template>
              <div class="text-break text-small">
                {{ attestation[key] }}
              </div>
            </el-card>
          </el-col>
        </el-row>
        <div>
          <FileUpload />
        </div>
      </el-col>
    </el-row>
  </el-main>
</template>

<style lang="scss" scoped>
.el-col {
  margin-bottom: 10px;
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import useClipboard from "vue-clipboard3";
import FileUpload from "@/components/FileUpload.vue";
import { ElNotification } from "element-plus";
import { mapActions, mapState } from "vuex";

export default defineComponent({
  name: "Home",
  components: {
    FileUpload
  },
  data() {
    return {
      attestation: {},
      user_attestation: ["mrsigner", "mrenclave"],
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
  async mounted() {
    await this.getAttestation();
  },
  computed: {
    ...mapState({
      attestationResult: "attestationResult",
      jwtToken: "jwtToken"
    })
  },
  methods: {
    ...mapActions(["requestAttestation"]),
    async getAttestation() {
      this.busy.fetchingToken = true;
      this.requestAttestation();
      this.attestation = this.attestationResult;
      console.log("Home.getAttestation result:", this.attestationResult);
      this.busy.fetchingToken = false;
    }
  }
});
</script>
