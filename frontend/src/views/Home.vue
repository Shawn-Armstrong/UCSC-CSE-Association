<template>
  <v-container fluid>
    <v-row
      justify="center"
      align="center"
      class="mx-8 my-0"
      style="height: calc(100vh - 64px - 64px)"
    >
      <v-col cols="12" class="pa-0 d-flex flex-column justify-space-between">
        <v-img
          contain
          max-height="100px"
          max-width="auto"
          src="../assets/ucsc_logo.png"
          class="mb-4"
        ></v-img>

        <video-background
          :src="introVideo"
          :style="{ height: videoHeight }"
        ></video-background>
        <h1 class="text-center my-2" style="color: #003c6c">
          Computer Science and Engineering Mentoring
        </h1>

        <v-row class="my-5" justify="center">
          <v-btn
            color="#1b77d2"
            class="text-white mx-10 mt-2 mb-12 pa-3"
            prepend-icon="mdi-login"
            elevation="12"
            raised
            :size="windowWidth <= 450 ? 'x-small' : 'large'"
            @click="navigateToLogin"
          >
             Login
          </v-btn>
          <v-btn
            color="#1b77d2"
            class="text-white mx-10 mt-2 mb-12 py-3 px-3"
            prepend-icon="mdi-account-plus-outline"
            elevation="12"
            raised
            :size="windowWidth <= 450 ? 'x-small' : 'large'"
            @click="navigateToRegister"
          >
             Register
          </v-btn>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from "vue-router";
import introVideo from "@/assets/intro.mp4";
import VideoBackground from "vue-responsive-video-background-player";

const router = useRouter();

const navigateToLogin = () => {
  router.push("/login");
};

const navigateToRegister = () => {
  router.push("/register");
};

const windowWidth = ref(window.innerWidth);

// Computed property for dynamic video height
const videoHeight = computed(() => {
  if (windowWidth.value <= 480) {
    return '30vh'; // Height for mobile devices
  } else if (windowWidth.value <= 768) {
    return '40vh'; // Height for large mobile devices/small tablets
  } else if (windowWidth.value <= 1024) {
    return '45vh'; // Height for tablets
  } else if (windowWidth.value <= 1200) {
    return '50vh'; // Height for laptops/small screens
  } else {
    return '45vh'; // Height for desktops/large screens
  }
});

// Listen to resize events
window.addEventListener('resize', () => {
  windowWidth.value = window.innerWidth;
});

</script>

<style></style>
