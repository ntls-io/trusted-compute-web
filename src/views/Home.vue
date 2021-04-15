<template>
  <div class="home">
    <FileUpload />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import FileUpload from "@/components/FileUpload.vue"; // @ is an alias to /src

export default defineComponent({
  name: "Home",
  components: {
    FileUpload,
  },
});
</script>
