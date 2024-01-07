<template>
  <div class="text-center">
    <v-btn
      append-icon="mdi-open-in-new"
      color="deep-purple-accent-4"
      @click="launchApplication"
    >
      Launch Application
    </v-btn>

    <v-overlay :model-value="overlay" class="align-center justify-center">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";

const overlay = ref(false);

const launchApplication = () => {
  overlay.value = true;
  axios
    .get("http://localhost:5000/hello")
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      overlay.value = false;
    });
};
</script>
