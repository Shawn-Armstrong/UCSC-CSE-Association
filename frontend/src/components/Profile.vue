<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="6" lg="4">
        <v-card class="elevation-12">
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Profile</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <div><b>Username:</b> {{ userProfile.username }}</div>
            <div><b>Email:</b> {{ userProfile.email }}</div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";

const userProfile = ref({});

onMounted(async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("http://localhost:5000/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    userProfile.value = response.data;
  } catch (error) {
    console.error("Error fetching profile:", error.response.data);
    // Handle the error, e.g., redirect to login if the token is invalid
  }
});
</script>
