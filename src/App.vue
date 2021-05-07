<template>
  <el-menu :router="true" mode="horizontal">
    <el-menu-item index="/">Home</el-menu-item>
    <el-menu-item index="/data-access">Data Access</el-menu-item>
  </el-menu>
  <router-view />
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.text-break {
  overflow-wrap: break-word;
}
.text-small {
  font-size: small;
}
</style>
