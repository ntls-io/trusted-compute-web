<template>
  <div class="home">
    <FileUpload />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from "vue";
import { useStore } from "vuex";
import FileUpload from "@/components/FileUpload.vue";
import { verifyToken } from "@/utils/jwt";

export default defineComponent({
  name: "Home",
  components: {
    FileUpload
  },
  setup() {
    const store = useStore();
    onMounted(() => {
      const token = store.state.jwtToken;

      console.log(verifyToken(token));
    });
  }
});
</script>
