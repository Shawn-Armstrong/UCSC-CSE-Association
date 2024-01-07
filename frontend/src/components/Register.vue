<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col class="mb-10" cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Register</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <div v-if="message" align="center" :class="messageClass">
              {{ message }}
            </div>
            <v-text-field
              label="Username"
              prepend-icon="mdi-account"
              type="text"
              v-model="username"
              class="mt-3"
            ></v-text-field>
            <v-text-field
              label="Email"
              prepend-icon="mdi-email"
              type="email"
              v-model="email"
            ></v-text-field>
            <v-text-field
              label="Password"
              prepend-icon="mdi-lock"
              type="password"
              v-model="password"
            ></v-text-field>
            <v-text-field
              label="Confirm Password"
              prepend-icon="mdi-lock-check"
              type="password"
              v-model="confirmPassword"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary" @click="goBack">Back to Home</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="submit">Register</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>

    <v-overlay :model-value="overlay" class="align-center justify-center">
      <v-progress-circular
        color="primary"
        indeterminate
        size="64"
      ></v-progress-circular>
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref, computed } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const username = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref(""); // New ref for the password confirmation
const message = ref("");
const isSuccessMessage = ref(false);
const router = useRouter();
const overlay = ref(false);

const goBack = () => {
  router.push("/");
};

const submit = async () => {
  if (password.value !== confirmPassword.value) {
    message.value = "Passwords do not match.";
    isSuccessMessage.value = false;
    return;
  }

  message.value = ""; // Reset the message before the new submission
  isSuccessMessage.value = false;

  try {
    overlay.value = true;
    const response = await axios.post("http://localhost:5000/register", {
      username: username.value,
      email: email.value,
      password: password.value,
    }).then((response) => {
      overlay.value = false;
    })
    message.value = "Registration successful. Redirecting to login...";
    isSuccessMessage.value = true;

    // Wait for 3 seconds before redirecting
    setTimeout(() => {
      router.push("/login");
    }, 1500);
  } catch (error) {
    if (error.response) {
      // Extracting the message from the response
      message.value =
        error.response.data.message || "Registration failed. Please try again.";
    } else {
      message.value = "An error occurred while sending the request.";
    }
    isSuccessMessage.value = false;
  }
};

// Compute the class for message based on success or failure
const messageClass = computed(() => {
  return {
    "text-success": isSuccessMessage.value,
    "text-error": !isSuccessMessage.value,
  };
});
</script>

<style scoped>
.text-success {
  color: green;
}

.text-error {
  color: red;
}
</style>
