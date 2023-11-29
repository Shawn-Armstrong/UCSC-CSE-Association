<template>
  <router-view v-slot="{ Component }">
    <transition name="fade" mode="out-in">
      <component :key="$route.path" :is="Component"/>
    </transition>
  </router-view>
</template>

<script setup>
//
</script>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 1s ease-in-out; /* Increased the duration to 1 second and used ease-in-out for a smoother transition */
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
