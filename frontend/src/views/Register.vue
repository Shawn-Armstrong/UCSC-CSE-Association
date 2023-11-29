<template>
    <v-container fill-height>
      <!-- Use a flex container to center content vertically and add a top margin -->
      <v-row justify="center" align="center" class="mt-12">
        <v-col cols="12" sm="8" md="6" lg="4">
          <!-- Your register component with additional top margin if needed -->
          <Register />
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script setup>
  import Register from '@/components/Register.vue';
  </script>
  