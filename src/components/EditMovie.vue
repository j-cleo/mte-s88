<script setup>
import { reactive, ref, watch } from 'vue';
import { Notyf } from 'notyf';
import api from '../api';

const props = defineProps({
  movie: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(['movie-updated']);
const notyf = new Notyf();
const closeBtn = ref(null);
const submitting = ref(false);

const form = reactive({
  title: '',
  director: '',
  year: '',
  description: '',
  genre: '',
});

watch(
  () => props.movie,
  (newMovie) => {
    if (newMovie) {
      form.title = newMovie.title || '';
      form.director = newMovie.director || '';
      form.year = newMovie.year || '';
      form.description = newMovie.description || '';
      form.genre = newMovie.genre || '';
    }
  },
  { immediate: true }
);

async function handleUpdateMovie() {
  const movieId = props.movie?._id || props.movie?.id;
  if (!movieId) return;

  submitting.value = true;
  try {
    await api.patch(`/movies/updateMovie/${movieId}`, {
      title: form.title,
      director: form.director,
      year: Number(form.year),
      description: form.description,
      genre: form.genre,
    });

    notyf.success('Movie updated successfully!');
    emit('movie-updated');
    closeBtn.value?.click();
  } catch (err) {
    notyf.error(err.response?.data?.message || 'Failed to update movie.');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="modal fade" id="editMovieModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
      <div class="modal-content">
        <form @submit.prevent="handleUpdateMovie">
          <div class="modal-header">
            <h5 class="modal-title">Edit Movie</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" ref="closeBtn"></button>
          </div>

          <div class="modal-body">
            <div class="row g-3">
              <div class="col-md-8">
                <label class="form-label">Title</label>
                <input
                  v-model.trim="form.title"
                  type="text"
                  class="form-control"
                  required
                />
              </div>

              <div class="col-md-4">
                <label class="form-label">Release Year</label>
                <input
                  v-model.number="form.year"
                  type="number"
                  class="form-control"
                  min="1888"
                  max="2100"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Director</label>
                <input
                  v-model.trim="form.director"
                  type="text"
                  class="form-control"
                  required
                />
              </div>

              <div class="col-md-6">
                <label class="form-label">Genre</label>
                <input
                  v-model.trim="form.genre"
                  type="text"
                  class="form-control"
                  required
                />
              </div>

              <div class="col-12">
                <label class="form-label">Description</label>
                <textarea
                  v-model.trim="form.description"
                  class="form-control"
                  rows="3"
                  required
                ></textarea>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
            <button type="submit" class="btn btn-primary" :disabled="submitting">
              <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
              {{ submitting ? 'Updating...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>