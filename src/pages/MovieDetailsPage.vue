<script setup>
import { onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { Notyf } from 'notyf';
import api from '../api';
import { useGlobalStore } from '../stores/global';
import EditMovie from '../components/EditMovie.vue';

const route = useRoute();
const router = useRouter();
const globalStore = useGlobalStore();
const notyf = new Notyf();

const movie = ref(null);
const loading = ref(true);
const deleting = ref(false);

const comments = ref([]);
const commentsLoading = ref(false);
const newComment = ref('');
const postingComment = ref(false);

function extractMovie(payload) {
  if (!payload) return null;
  if (payload.movie) return payload.movie;
  if (payload.data && !Array.isArray(payload.data)) return payload.data;
  return payload;
}

function extractComments(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.comments)) return payload.comments;
  if (Array.isArray(payload?.data)) return payload.data;
  return [];
}

function formatCommentText(item) {
  if (typeof item === 'string') return item;
  return item?.comment || item?.text || item?.body || '';
}

async function fetchMovieDetails() {
  const id = route.params.id;
  if (!id) return;

  loading.value = true;
  try {
    const { data } = await api.get(`/movies/getMovie/${id}`);
    movie.value = extractMovie(data);
  } catch (err) {
    notyf.error(err.response?.data?.message || 'Failed to load movie details.');
    movie.value = null;
  } finally {
    loading.value = false;
  }
}

async function fetchComments() {
  const id = route.params.id;
  if (!id) return;

  commentsLoading.value = true;
  try {
    const { data } = await api.get(`/movies/getComments/${id}`);
    comments.value = extractComments(data);
  } catch (err) {
    notyf.error(err.response?.data?.message || 'Failed to load comments.');
    comments.value = [];
  } finally {
    commentsLoading.value = false;
  }
}

async function handleAddComment() {
  const id = route.params.id;
  if (!id || !newComment.value) return;

  postingComment.value = true;
  try {
    await api.post(`/movies/addComment/${id}`, {
      comment: newComment.value,
    });
    newComment.value = '';
    notyf.success('Comment added!');
    await fetchComments();
  } catch (err) {
    notyf.error(err.response?.data?.message || 'Failed to add comment.');
  } finally {
    postingComment.value = false;
  }
}

async function handleDeleteMovie() {
  if (!globalStore.user.isAdmin) {
    notyf.error('Admin access required to delete movies.');
    return;
  }

  const id = route.params.id;
  if (!id) return;

  deleting.value = true;
  try {
    await api.delete(`/movies/deleteMovie/${id}`);
    notyf.success('Movie deleted.');
    router.push('/movies');
  } catch (err) {
    notyf.error(err.response?.data?.message || 'Failed to delete movie.');
  } finally {
    deleting.value = false;
  }
}

onMounted(() => {
  fetchMovieDetails();
  fetchComments();
});

watch(
  () => route.params.id,
  () => {
    fetchMovieDetails();
    fetchComments();
  }
);
</script>

<template>
  <div>
    <div class="mb-3">
      <router-link to="/movies" class="btn btn-sm btn-outline-secondary">
        <i class="bi bi-arrow-left me-1"></i> Back to Movies
      </router-link>
    </div>

    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status"></div>
    </div>

    <div v-else-if="!movie" class="text-center text-muted py-5">
      <p class="mb-0">Movie not found.</p>
    </div>

    <div v-else class="row g-4">
      <!-- Movie Details Card -->
      <div class="col-lg-7">
        <div class="card shadow-sm">
          <div class="card-body p-4">
            <div class="d-flex justify-content-between align-items-start gap-2 mb-2">
              <h2 class="card-title mb-0">{{ movie.title }}</h2>
              <span class="badge bg-secondary fs-6">{{ movie.year }}</span>
            </div>

            <div class="mb-3">
              <span class="badge bg-info-subtle text-info-emphasis border border-info-subtle">
                <i class="bi bi-tag me-1"></i>{{ movie.genre }}
              </span>
            </div>

            <p class="text-muted mb-3">
              <i class="bi bi-person-video2 me-1"></i>
              <strong>Director:</strong> {{ movie.director }}
            </p>

            <p class="card-text lh-lg">{{ movie.description }}</p>

            <template v-if="globalStore.user.isAdmin">
              <hr class="my-4" />

              <div class="d-flex flex-wrap gap-2">
                <button
                  type="button"
                  class="btn btn-outline-primary"
                  data-bs-toggle="modal"
                  data-bs-target="#editMovieModal"
                >
                  <i class="bi bi-pencil-square me-1"></i> Edit Movie
                </button>

                <button
                  type="button"
                  class="btn btn-outline-danger ms-auto"
                  :disabled="deleting"
                  @click="handleDeleteMovie"
                >
                  <span v-if="deleting" class="spinner-border spinner-border-sm me-1"></span>
                  <i v-else class="bi bi-trash me-1"></i>
                  {{ deleting ? 'Deleting...' : 'Delete Movie' }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- Comments Section -->
      <div class="col-lg-5">
        <div class="card shadow-sm">
          <div class="card-header bg-white py-3">
            <h5 class="mb-0">
              <i class="bi bi-chat-left-text me-2"></i>Comments ({{ comments.length }})
            </h5>
          </div>

          <div class="card-body">
            <form @submit.prevent="handleAddComment" class="mb-4">
              <label class="form-label small fw-semibold">Add a Comment</label>
              <div class="input-group">
                <input
                  v-model.trim="newComment"
                  type="text"
                  class="form-control"
                  placeholder="Write your thoughts..."
                  required
                />
                <button type="submit" class="btn btn-primary" :disabled="postingComment">
                  <span v-if="postingComment" class="spinner-border spinner-border-sm"></span>
                  <span v-else><i class="bi bi-send"></i></span>
                </button>
              </div>
            </form>

            <div v-if="commentsLoading" class="text-center py-3">
              <div class="spinner-border spinner-border-sm text-secondary" role="status"></div>
            </div>

            <div v-else-if="comments.length === 0" class="text-center text-muted py-3 small">
              No comments yet. Be the first to comment!
            </div>

            <ul v-else class="list-group list-group-flush">
              <li
                v-for="(item, idx) in comments"
                :key="item._id || item.id || idx"
                class="list-group-item px-0"
              >
                <p class="mb-1">{{ formatCommentText(item) }}</p>
                <small class="text-muted" v-if="item.userEmail || item.userId || item.createdAt">
                  {{ item.userEmail || item.userId || 'User' }}
                  <span v-if="item.createdAt">
                    • {{ new Date(item.createdAt).toLocaleDateString() }}
                  </span>
                </small>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <EditMovie
      v-if="globalStore.user.isAdmin"
      :movie="movie"
      @movie-updated="fetchMovieDetails"
    />
  </div>
</template>