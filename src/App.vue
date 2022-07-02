<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import login from "./view/login.vue";
export default {
  components: { login },
  name: "App",
};
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  padding: 0% auto;
  margin: 0 auto;
}
</style>
