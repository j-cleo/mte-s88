<script setup>
import { useGlobalStore } from '../stores/global';

const globalStore = useGlobalStore();
</script>

<template>
  <div class="p-5 mb-4 bg-light rounded-3 border text-center">
    <div class="container-fluid py-5">
      <h1 class="display-5 fw-bold">Movie Time!</h1>
      <p class="col-md-8 fs-5 mx-auto text-muted">
        Watch movies in this page!
      </p>
      
      <div class="mt-4 d-flex justify-content-center gap-2">
        <router-link 
          :to="{ name: 'Movies' }" 
          class="btn btn-primary btn-lg"
        >
          Go to Movie Catalog
        </router-link>
      </div>
    </div>
  </div>
</template>