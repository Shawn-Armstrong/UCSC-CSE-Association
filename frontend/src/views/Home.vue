<template>
  <v-container class="mt-12">
    <v-img
      contain
      max-height="100px"
      max-width="auto"
      src="../assets/ucsc_logo.png"
      class="my-10"
    ></v-img>

    <video-background
      :src="introVideo"
      style="max-height: 300px; height: 100vh"
    ></video-background>

    <h1 class="text-center my-2" style="color: #003c6c">
      Computer Science and Engineering Mentoring
    </h1>

    <v-row class="my-5" justify="center">
      <v-btn
        color="#1b77d2"
        class="text-white mx-10"
        prepend-icon="mdi-login"
        elevation="12"
        raised
        size="large"
        @click="navigateToLogin"
      >
        Login
      </v-btn>
      <v-btn
        color="#1b77d2"
        class="text-white mx-10"
        prepend-icon="mdi-account-plus-outline"
        elevation="12"
        raised
        size="large"
        @click="navigateToRegister"
      >
        Register
      </v-btn>
    </v-row>
  </v-container>
</template>

<script setup>
import { useRouter } from 'vue-router';
import introVideo from '@/assets/intro.mp4';
import VideoBackground from 'vue-responsive-video-background-player';

const router = useRouter();

const navigateToLogin = () => {
  router.push('/login');
};

const navigateToRegister = () => {
  router.push('/register');
};
</script>

<style>
/* Add any additional styling you want here */
</style>
