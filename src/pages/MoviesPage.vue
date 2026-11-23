<script setup>
import { computed, onMounted, ref } from 'vue';
import { Notyf } from 'notyf';
import api from '../api';
import { useGlobalStore } from '../stores/global';
import AddMovie from '../components/AddMovie.vue';

const globalStore = useGlobalStore();
const notyf = new Notyf();
const movies = ref([]);
const loading = ref(true);
const searchQuery = ref('');
const selectedGenre = ref('');

function extractMovies(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.movies)) return payload.movies;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

async function fetchMovies() {
  loading.value = true;
  try {
    const { data } = await api.get('/movies/getMovies');
    movies.value = extractMovies(data);
  } catch (err) {
    notyf.error(err.response?.data?.message || 'Failed to load movies.');
    movies.value = [];
  } finally {
    loading.value = false;
  }
}

const genres = computed(() => {
  const set = new Set(
    movies.value
      .map((m) => m.genre)
      .filter(Boolean)
  );
  return Array.from(set).sort();
});

const filteredMovies = computed(() => {
  return movies.value.filter((movie) => {
    const matchesGenre = !selectedGenre.value || movie.genre === selectedGenre.value;
    const q = searchQuery.value.toLowerCase();
    const matchesSearch =
      !q ||
      movie.title?.toLowerCase().includes(q) ||
      movie.director?.toLowerCase().includes(q);
    return matchesGenre && matchesSearch;
  });
});

onMounted(fetchMovies);
</script>

<template>
  <div>
    <div class="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
      <div>
        <h2 class="mb-0">Movies</h2>
        <small class="text-muted">Browse and explore the movie catalog</small>
      </div>
      <AddMovie v-if="globalStore.user.isAdmin" @movie-added="fetchMovies" />
    </div>

    <div class="row g-2 mb-4">
      <div class="col-md-8">
        <div class="input-group">
          <span class="input-group-text bg-white">
            <i class="bi bi-search"></i>
          </span>
          <input
            v-model.trim="searchQuery"
            type="text"
            class="form-control"
            placeholder="Search by title or director..."
          />
        </div>
      </div>
      <div class="col-md-4">
        <select v-model="selectedGenre" class="form-select">
          <option value="">All Genres</option>
          <option v-for="genre in genres" :key="genre" :value="genre">
            {{ genre }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="filteredMovies.length === 0" class="text-center text-muted py-5">
      <i class="bi bi-film fs-1 d-block mb-2"></i>
      <p class="mb-0">No movies found.</p>
    </div>

    <div v-else class="row g-4">
      <div
        class="col-md-6 col-lg-4"
        v-for="movie in filteredMovies"
        :key="movie._id || movie.id"
      >
        <div class="card h-100 shadow-sm">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <h5 class="card-title mb-0">{{ movie.title }}</h5>
              <span class="badge bg-secondary">{{ movie.year }}</span>
            </div>

            <div class="mb-2">
              <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                <i class="bi bi-tag me-1"></i>{{ movie.genre }}
              </span>
            </div>

            <p class="small text-muted mb-2">
              <i class="bi bi-person-video2 me-1"></i>
              <strong>Director:</strong> {{ movie.director }}
            </p>

            <p class="card-text text-secondary flex-grow-1">
              {{ movie.description }}
            </p>

            <div class="pt-3 mt-2 border-top d-flex justify-content-end">
              <router-link
                :to="`/movies/${movie._id || movie.id}`"
                class="btn btn-sm btn-outline-primary"
              >
                View Details <i class="bi bi-arrow-right ms-1"></i>
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>