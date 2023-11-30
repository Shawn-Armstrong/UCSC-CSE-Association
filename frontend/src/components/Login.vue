<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <div align="center" v-if="verificationError" class="error-message">{{ verificationError }}</div>
            <v-text-field
              label="Email"
              prepend-icon="mdi-account"
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
            <v-btn color="primary" @click="submit">Login</v-btn>
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

const email = ref('');
const password = ref('');
const verificationError = ref('');
const router = useRouter();

const goBack = () => {
  router.push('/');
};

const submit = async () => {
  try {
    const response = await axios.post('http://localhost:5000/login', {
      email: email.value,
      password: password.value,
    });
    console.log('Login successful:', response.data);
    localStorage.setItem('token', response.data.token);
    router.push('/profile');
  } catch (error) {
    console.error('Login failed:', error.response.data);
    // Check for verification error
    if (error.response && error.response.status === 403) {
      verificationError.value = error.response.data;
    }
  }
};
</script>

<style scoped>
.error-message {
  color: red;
  margin-bottom: 15px;
}
</style>
