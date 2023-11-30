<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Register</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <v-text-field
              label="Username"
              prepend-icon="mdi-account"
              type="text"
              v-model="username"
            ></v-text-field>
            <v-text-field
              label="Email"
              prepend-icon="mdi-email"
              type="email"
              v-model="email"
            ></v-text-field>
            <v-text-field
              label="Password"
              prepend-icon="mdi-lock"
              type="password"
              v-model="password"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary" @click="goBack">Back to Home</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="secondary" @click="submit">Register</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const username = ref('');
const email = ref('');
const password = ref('');
const router = useRouter();

const goBack = () => {
  router.push('/');
};

const submit = async () => {
  try {
    const response = await axios.post('http://localhost:5000/register', {
      username: username.value,
      email: email.value,
      password: password.value
    });
    console.log('Registration successful:', response.data);
    // Navigate to a different route if necessary, or show a success message
  } catch (error) {
    console.error('Registration failed:', error.response.data);
    // Handle the registration error (e.g., show an error message)
  }
};
</script>

<style scoped>
/* Scoped styles for Register.vue */
</style>
