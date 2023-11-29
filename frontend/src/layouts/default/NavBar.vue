<template>
    <v-app-bar class="pa-0" app color=primary dark hide-on-scroll></v-app-bar>
</template>

<script setup>
    import { defineProps } from 'vue'
    const props = defineProps({
        title: {
            type: String,
            default: 'Default Title'
        }
    })
</script>