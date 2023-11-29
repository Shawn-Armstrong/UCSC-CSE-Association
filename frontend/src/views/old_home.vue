<template>
  <v-container>
    <v-row justify="center">
      <v-btn class="mx-12" color="primary" dark v-if="!showLogin && !showRegister" @click="showLoginComponent">Login</v-btn>
      <v-btn class="mx-12" color="primary" dark v-if="!showLogin && !showRegister" @click="showRegisterComponent">Register</v-btn>
    </v-row>

    <v-row v-if="showLogin || showRegister">
      <v-btn class="mx-12" color="primary" dark @click="backToSelection">Back</v-btn>
    </v-row>

    <Login v-if="showLogin" />
    <Register v-if="showRegister" />
  </v-container>
</template>

<script setup>
import { ref } from 'vue';
import Login from '@/components/Login.vue';
import Register from '@/components/Register.vue';

const showLogin = ref(false);
const showRegister = ref(false);

const showLoginComponent = () => {
  showLogin.value = true;
  showRegister.value = false;
};

const showRegisterComponent = () => {
  showLogin.value = false;
  showRegister.value = true;
};

const backToSelection = () => {
  showLogin.value = false;
  showRegister.value = false;
};
</script>

<style>
/* Add any additional styling you want here */
</style>
