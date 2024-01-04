<template>
  <v-container fluid>
    <v-row
      justify="center"
      align="center"
      class="mx-3 my-0"
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
          :sources="[
            { src: 'src/assets/intro.mp4', res: 991, autoplay: true },
            { src: 'src/assets/intro.mp4', res: 575, autoplay: true },
          ]"
          style="max-height: 300px; height: 100vh"
        ></video-background>
        <h1 class="text-center my-2" style="color: #003c6c">
          Computer Science and Engineering Mentoring
        </h1>

        <v-row class="my-5" justify="center">
          <v-btn
            color="#1b77d2"
            class="text-white mx-10 mt-2 mb-12"
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
            class="text-white mx-10 mt-2 mb-12"
            prepend-icon="mdi-account-plus-outline"
            elevation="12"
            raised
            size="large"
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
</script>

<style></style>
