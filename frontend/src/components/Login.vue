<template>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark>
              <v-toolbar-title>Login</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
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
  import { useRouter } from 'vue-router'; // Import useRouter

  const email = ref('');
  const password = ref('');
  const router = useRouter(); // Use useRouter to get the router instance

  const submit = async () => {
    try {
      const response = await axios.post('http://localhost:5000/login', {
        email: email.value,
        password: password.value
      });
      console.log('Login successful:', response.data);

      // Save the token in local storage or in-memory
      localStorage.setItem('token', response.data.token);

      // Use router.push to navigate to the profile route
      router.push('/profile');
    } catch (error) {
      console.error('Login failed:', error.response.data);
    }
  };
</script>

  
  <style>
  /* Add any additional styling you want for your login component here */
  </style>
  