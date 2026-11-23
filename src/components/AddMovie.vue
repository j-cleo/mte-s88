<script setup>
import { reactive, ref } from 'vue';
import { Notyf } from 'notyf';
import api from '../api';

const emit = defineEmits(['movie-added']);
const notyf = new Notyf();
const closeBtn = ref(null);
const submitting = ref(false);

const form = reactive({
  title: '',
  director: '',
  year: new Date().getFullYear(),
  description: '',
  genre: '',
});

function resetForm() {
  form.title = '';
  form.director = '';
  form.year = new Date().getFullYear();
  form.description = '';
  form.genre = '';
}

async function handleAddMovie() {
  submitting.value = true;
  try {
    await api.post('/movies/addMovie', {
      title: form.title,
      director: form.director,
      year: Number(form.year),
      description: form.description,
      genre: form.genre,
    });

    notyf.success('Movie added successfully!');
    resetForm();
    emit('movie-added');
    closeBtn.value?.click();
  } catch (err) {
    notyf.error(err.response?.data?.message || 'Failed to add movie.');
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div>
    <button
      type="button"
      class="btn btn-primary"
      data-bs-toggle="modal"
      data-bs-target="#addMovieModal"
    >
      <i class="bi bi-plus-lg me-1"></i> Add Movie
    </button>

    <div class="modal fade" id="addMovieModal" tabindex="-1" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <form @submit.prevent="handleAddMovie">
            <div class="modal-header">
              <h5 class="modal-title">Add New Movie</h5>
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
                    placeholder="e.g., Sample: The Movie"
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
                    placeholder="2024"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Director</label>
                  <input
                    v-model.trim="form.director"
                    type="text"
                    class="form-control"
                    placeholder="e.g., Sample L. Jackson"
                    required
                  />
                </div>

                <div class="col-md-6">
                  <label class="form-label">Genre</label>
                  <input
                    v-model.trim="form.genre"
                    type="text"
                    class="form-control"
                    placeholder="e.g., Action, Drama"
                    required
                  />
                </div>

                <div class="col-12">
                  <label class="form-label">Description</label>
                  <textarea
                    v-model.trim="form.description"
                    class="form-control"
                    rows="3"
                    placeholder="Enter movie synopsis or description..."
                    required
                  ></textarea>
                </div>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button type="submit" class="btn btn-primary" :disabled="submitting">
                <span v-if="submitting" class="spinner-border spinner-border-sm me-1"></span>
                {{ submitting ? 'Saving...' : 'Save Movie' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>