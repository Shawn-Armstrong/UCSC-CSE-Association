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
          <v-card-actions>
            <v-btn color="primary" @click="logout">Logout</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from 'vue-router';

const userProfile = ref({});
const router = useRouter();

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
    // Redirect to login page if there's an error (e.g., token is invalid)
    router.push('/');
  }
});

const logout = () => {
  // Clear authentication token or other relevant data
  localStorage.removeItem('token');

  // Redirect to the login page
  router.push('/');
};
</script>
