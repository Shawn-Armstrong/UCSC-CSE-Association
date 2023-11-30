<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Email Verification</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <p v-if="message">{{ message }}</p>
            <v-progress-circular
              v-else
              indeterminate
              color="primary"
            ></v-progress-circular>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="goToHome">Home</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const message = ref("");

onMounted(() => {
  const token = route.query.token;
  if (token) {
    verifyEmail(token);
  } else {
    message.value = "Invalid verification request.";
  }
});

async function verifyEmail(token) {
  try {
    const response = await axios.get(
      `http://localhost:5000/verify-email?token=${token}`
    );
    message.value = "Email successfully verified!";
  } catch (error) {
    message.value = "Verification failed. The link may be expired or invalid.";
  }
}

const goToHome = () => {
  router.push('/');
};
</script>

<style scoped>
/* Add any additional scoped styles here */
</style>
