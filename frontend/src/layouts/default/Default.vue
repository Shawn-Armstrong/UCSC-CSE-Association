<template>
  <v-app>
    <NavBar />
    <router-view v-slot="{ Component, route }">
      <transition
        :enter-active-class="route.meta.enterClass"
        :leave-active-class="route.meta.leaveClass"
        mode="out-in"
      >
        <component :key="$route.path" :is="Component" />
      </transition>
    </router-view>
    <FooterBar />
  </v-app>
</template>

<script setup>
import "animate.css";
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
