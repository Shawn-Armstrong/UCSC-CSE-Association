<template>
  <v-app>
    <nav-bar />
      <default-view />
    <footer-bar />
  </v-app>
</template>

<script setup>
  import NavBar from './NavBar.vue';
  import DefaultView from './View.vue';
  import FooterBar from './FooterBar.vue';
</script>

<style>
/* Define the fade transition */
</style>
