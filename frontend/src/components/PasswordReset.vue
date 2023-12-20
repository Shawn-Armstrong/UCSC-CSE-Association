<template>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="secondary" dark>
              <v-toolbar-title>Password Reset</v-toolbar-title>
            </v-toolbar>
            <v-card-text>
              <div v-if="message" align="center" :class="messageClass">
                {{ message }}
              </div>
              <v-text-field
                label="Email"
                prepend-icon="mdi-email"
                type="email"
                v-model="email"
                class="mt-3"
              ></v-text-field>
            </v-card-text>
            <v-card-actions>
              <v-btn text color="primary" @click="goBack">Back to Home</v-btn>
              <v-spacer></v-spacer>
              <v-btn color="primary" @click="submit">Send Reset Link</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import { ref, computed } from 'vue';
  import axios from 'axios';
  import { useRouter } from 'vue-router';
  
  const email = ref('');
  const message = ref('');
  const isSuccessMessage = ref(false);
  const router = useRouter();
  
  const goBack = () => {
    router.push('/');
  };
  
  const submit = async () => {
    message.value = '';
    isSuccessMessage.value = false;
    
    try {
      await axios.post('http://localhost:5000/reset-password', {
        email: email.value,
      });
      message.value = "If an account with that email exists, a password reset link has been sent.";
      isSuccessMessage.value = true;
    } catch (error) {
      message.value = error.response ? error.response.data : 'Error occurred while sending password reset email.';
      isSuccessMessage.value = false;
    }
  };
  
  const messageClass = computed(() => ({
    'text-success': isSuccessMessage.value,
    'text-error': !isSuccessMessage.value,
  }));
  </script>
  
  <style scoped>
  .text-success {
    color: green;
  }
  
  .text-error {
    color: red;
  }
  </style>
  