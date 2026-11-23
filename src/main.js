import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import "notyf/notyf.min.css";
import './assets/main.css';

import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';

import HomePage from './pages/HomePage.vue';
import MoviesPage from './pages/MoviesPage.vue';
import MovieDetailsPage from './pages/MovieDetailsPage.vue';
import RegisterPage from './pages/RegisterPage.vue';
import LoginPage from './pages/LoginPage.vue';

import { createRouter, createWebHistory } from 'vue-router';
import { useGlobalStore } from './stores/global';

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomePage,
    meta: { hideNavbar: false, requiresAuth: true }
  },
  {
    path: "/login",
    name: "Login",
    component: LoginPage,
    meta: { hideNavbar: true, requiresGuest: true }
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterPage,
    meta: { hideNavbar: true, requiresGuest: true }
  },
  {
    path: "/movies",
    name: "Movies",
    component: MoviesPage,
    meta: { hideNavbar: false, requiresAuth: true }
  },
  {
  	path: "/movies/:id",
    name: "MovieDetails",
    component: MovieDetailsPage,
    meta: { hideNavbar: false, requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

router.beforeEach(async (to) => {
  const token = localStorage.getItem("token");
  const store = useGlobalStore();

  if (token && !store.user) {
    try {
      await store.getUserDetails(token);
    } catch (error) {
      store.logout();
      return { name: 'Login' };
    }
  }

  if (to.meta.requiresAuth && !token) {
    return { name: 'Login' };
  }

  if (to.meta.requiresGuest && token) {
    return { name: 'Home' };
  }

  if (to.meta.requiresAdmin && !store.user.isAdmin) {
    return { name: 'Home' }; 
  }
});

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.mount("#app");