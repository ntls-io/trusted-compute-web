<template>
  <div class="container-fluid my-3">
    <div class="row">
      <div class="col-sm-8">
        <div class="card">
          <div
            class="card-header d-flex justify-content-between align-items-center"
          >
            <span class="fw-bold">JWT Token</span>
            <span>
              <button class="btn btn-primary btn-sm mx-1" @click="fetchJWT()">
                Fetch
              </button>
              <button
                class="btn btn-primary btn-sm mx-1"
                @click="getAttestation($store.state.jwtToken)"
              >
                Validate
              </button>
            </span>
          </div>
          <div class="card-body">
            <div v-if="busy.fetchingToken" class="text-center">
              <div class="spinner-border text-center" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <p v-else class="card-text small">
              {{ $store.state.jwtToken }}
            </p>
          </div>
        </div>
      </div>
      <div class="col-sm-4">
        <div class="row">
          <div class="col-12" v-for="(key, i) in user_attestation" :key="i">
            <div class="card">
              <div class="card-header">
                <span class="fw-bold">{{ key }}</span>
              </div>
              <div class="card-body">
                <p class="card-text small">
                  {{ attestation[key] }}
                </p>
              </div>
            </div>
          </div>
        </div>
        <div>
          <FileUpload />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.card {
  margin-bottom: 15px;
}
</style>

<script lang="ts">
import { defineComponent } from "vue";
import FileUpload from "@/components/FileUpload.vue";
import { verifyToken } from "@/utils/jwt";

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
  mounted() {
    this.fetchJWT();
  },
  methods: {
    async fetchJWT() {
      this.busy.fetchingToken = true;
      await this.axios
        .get(process.env.VUE_APP_JWT_URL)
        .then(({ status, data }) => {
          if (status === 200) {
            this.$store.dispatch("saveToken", data);
            this.attestation = {};
          }
        })
        .finally(() => {
          this.busy.fetchingToken = false;
        });
    },
    async getAttestation(token: string) {
      await verifyToken(token).then(result => {
        this.attestation = result;
      });
    }
  }
});
</script>
