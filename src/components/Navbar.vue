<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGlobalStore } from '../stores/global';

const globalStore = useGlobalStore();
const router = useRouter();

const isLoggedIn = computed(() => Boolean(globalStore.user.token));

const { user } = useGlobalStore();

function logout() {
  localStorage.removeItem('token');
  globalStore.getUserDetails(null);
  router.push('/login');
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark shadow-sm">
    <div class="container">
      <router-link class="navbar-brand fw-bold" :to="{ name: 'Home' }" >Movies</router-link>
      
      <button 
        class="navbar-toggler" 
        type="button" 
        data-bs-toggle="collapse" 
        data-bs-target="#navbarNav"
      >
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link class="nav-link" :to="{ name: 'Home' }">Home</router-link>
          </li>
          <li class="nav-item" v-if="isLoggedIn">
            <router-link class="nav-link" :to="{ name: 'Movies' }">Movies</router-link>
          </li>
        </ul>

        <ul class="navbar-nav ms-auto align-items-lg-center">
          <li class="nav-item me-3 text-light small" v-if="user.email">
            {{ user.email }}
          </li>
          <li class="nav-item">
            <button class="btn btn-outline-light btn-sm" @click="logout">
            	Logout
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>