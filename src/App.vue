<script>
  import { onBeforeMount } from 'vue';
  import { useGlobalStore } from "./stores/global";
  import Navbar from './components/Navbar.vue'; 

  export default {
    components: {
      Navbar
    },
    setup(){

      const { getUserDetails } = useGlobalStore();

      onBeforeMount(()=>getUserDetails(localStorage.getItem("token")))
    }
  }
</script>

<template>
  <Navbar v-if="!$route.meta.hideNavbar"/>
  <div class="container">
    <router-view />
  </div>
</template>

<style scoped>
</style>