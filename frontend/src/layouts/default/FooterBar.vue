<template>
    <v-footer class="custom-footer">
      <div class="footer-content px-4 py-2 bg-primary text-center ma-0">
        {{ new Date().getFullYear() }} — <strong>UCSC, CSE</strong>
      </div>
    </v-footer>
  </template>
  
  <style scoped>
  .custom-footer {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    max-width: 100%;
    box-sizing: border-box;
    padding: 0;
    margin: 0;
  }
  .footer-content {
    width: 100%;
    max-width: 100%;
    padding: 0;
    margin: 0;
  }
  </style>
  
  <script>
  export default {
    data: () => ({
      icons: [
        'mdi-facebook',
        'mdi-twitter',
        'mdi-linkedin',
        'mdi-instagram',
      ],
    }),
  }
  </script>
  