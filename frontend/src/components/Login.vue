<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Login</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <div v-if="verificationError" align="center" class="error-message">
              {{ verificationError }}
              <br />
              <v-btn
                color="green"
                @click="resendVerificationEmail"
                size="small"
                class="mt-2 mb-3"
                density="compact"
              >
                Resend Verification Email
              </v-btn>
            </div>
            <div v-if="message" align="center" class="mb-3">
              {{ message }}
            </div>
            <v-text-field
              label="Email"
              prepend-icon="mdi-account"
              type="email"
              v-model="email"
            ></v-text-field>
            <v-text-field
              label="Password"
              prepend-icon="mdi-lock"
              type="password"
              v-model="password"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn text color="primary" @click="goBack">Back to Home</v-btn>
            <v-spacer></v-spacer>
            <v-btn color="primary" @click="submit">Login</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const verificationError = ref(""); // This will display the verification error
const message = ref(""); // This will display the result message after resending email
const router = useRouter();

const goBack = () => {
  router.push("/");
};

const submit = async () => {
  // Clear both the verification error and the message
  verificationError.value = "";
  message.value = "";

  try {
    const response = await axios.post("http://localhost:5000/login", {
      email: email.value,
      password: password.value,
    });
    localStorage.setItem("token", response.data.token);
    router.push("/profile");
  } catch (error) {
    if (error.response && error.response.status === 403) {
      verificationError.value = error.response.data;
    } else {
      // Use a general error message for all other login errors
      verificationError.value = "Login failed. Please try again.";
    }
  }
};

const resendVerificationEmail = async () => {
  // Clear previous messages
  verificationError.value = "";
  message.value = "";

  try {
    const response = await axios.post(
      "http://localhost:5000/resend-verification",
      {
        email: email.value,
      }
    );
    // Handle the possibility that the response may not directly contain a message
    message.value =
      response.data.message || "Verification email resent successfully.";
  } catch (error) {
    if (error.response) {
      // Handle response error messages
      message.value =
        error.response.data || "Failed to resend verification email.";
    } else {
      // Handle network or other axios errors
      message.value = "An error occurred while sending the request.";
    }
  }
};
</script>

<style scoped></style>
