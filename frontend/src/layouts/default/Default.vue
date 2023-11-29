<template>
  <v-app>
      <NavBar />
      <transition name="fade" mode="out-in">
        <router-view v-slot="{ Component }">
          <component :key="$route.path" :is="Component" />
        </router-view>
      </transition>
      <FooterBar />
  </v-app>
</template>

<script setup>
import NavBar from "./NavBar.vue";
import FooterBar from "./FooterBar.vue";
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease-in-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
