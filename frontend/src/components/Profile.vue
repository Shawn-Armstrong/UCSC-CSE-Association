<template>
  <v-app>
    <v-card class="d-flex flex-column fill-height">
      <v-row no-gutters class="flex-grow-1">
        <v-col cols="auto">
          <v-navigation-drawer
            expand-on-hover
            rail
            app
            :permanent="isLargeScreen"
          >
            <v-list>
              <v-list-item
                prepend-avatar="https://media.licdn.com/dms/image/D5603AQF-aeeEcCdB4Q/profile-displayphoto-shrink_800_800/0/1689397436703?e=1710374400&v=beta&t=vLdb-0asDkF3xUj9PZcnk0eoAfFmzYVlfLuhVbCUgMA"
                :title="userProfile.username"
                :subtitle="userProfile.email"
              ></v-list-item>
            </v-list>

            <v-divider></v-divider>

            <v-list density="compact" nav>
              <v-list-item
                prepend-icon="mdi-folder"
                title="My Files"
                value="myfiles"
              ></v-list-item>
              <v-list-item
                prepend-icon="mdi-account-multiple"
                title="Shared with me"
                value="shared"
              ></v-list-item>
              <v-list-item
                prepend-icon="mdi-star"
                title="Starred"
                value="starred"
              ></v-list-item>
            </v-list>
          </v-navigation-drawer>
        </v-col>
        <v-col>
          <v-main class="d-flex align-center justify-center">

          </v-main>
        </v-col>
      </v-row>
    </v-card>
  </v-app>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useDisplay } from "vuetify";
import axios from "axios";
import { useRoute } from "vue-router"; 
const { width } = useDisplay();
const userProfile = ref({});
const isLargeScreen = computed(() => width.value >= 100);
const route = useRoute();

const showCard = ref(false); // Add this line to control the card visibility

onMounted(async () => {
  const userIdToView = route.params.uid || 'defaultUserId'; // Replace 'defaultUserId' with a sensible default or logic to handle cases where no user ID is provided.
  try {
    const response = await axios.get(`http://localhost:5000/profile?uid=${userIdToView}`);
    userProfile.value = response.data;
  } catch (error) {
    console.error("Error fetching profile:", error?.response?.data);
    // Handle error appropriately
  }
});
</script>

<style>
/* This CSS class ensures that the v-app element fills the full height of the viewport */
.fill-height {
  height: 100vh;
}
</style>
