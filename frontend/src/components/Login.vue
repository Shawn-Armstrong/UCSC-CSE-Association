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
                density="compact"
                class="mt-1 mb-3"
              >
                Resend Verification Email
              </v-btn>
            </div>
            <div
              v-if="message"
              align="center"
              :class="{'text-success': isSuccessMessage, 'text-error': !isSuccessMessage}"
              class="mb-3 message"
            >
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
            <div v-if="email && email.length > 0" class="text-right">
              <v-btn text density="compact" size="small" color="primary" @click="resetPassword">Forgot Password?</v-btn>
            </div>
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
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const email = ref('');
const password = ref('');
const verificationError = ref('');
const message = ref('');
const isSuccessMessage = ref(false);
const router = useRouter();

const goBack = () => {
  router.push('/');
};

const submit = async () => {
  verificationError.value = '';
  message.value = '';
  isSuccessMessage.value = false;

  // Check if email and password are not empty before attempting to log in
  if (!email.value || !password.value) {
    message.value = 'Please enter both email and password.';
    return;
  }

  try {
    const response = await axios.post('http://localhost:5000/login', {
      email: email.value,
      password: password.value,
    });
    localStorage.setItem('token', response.data.token);
    router.push('/profile');
  } catch (error) {
    // Specific status code check for verification error
    if (error.response && error.response.status === 403 && error.response.data === 'Account verification required') {
      verificationError.value = error.response.data;
    } else {
      // For all other errors, don't show the verification error message or button
      message.value = 'Login failed. Please try again.';
      isSuccessMessage.value = false;
    }
  }
};


const resendVerificationEmail = async () => {
  verificationError.value = '';
  message.value = '';
  isSuccessMessage.value = false;

  try {
    const response = await axios.post('http://localhost:5000/resend-verification', {
      email: email.value,
    });
    message.value = response.data.message || "Verification email resent successfully.";
    isSuccessMessage.value = true;
  } catch (error) {
    message.value = error.response ? error.response.data : "Error occurred while resending verification email.";
    isSuccessMessage.value = false;
  }
};

const resetPassword = () => {
  router.push('/password-reset'); // Make sure this route matches your actual route for resetting password
};
</script>

<style scoped>
.error-message {
  color: red;
  text-align: center;
}
.text-right {
  text-align: right;
}
.text-success {
  color: green;
}
.text-error {
  color: red;
}
</style>
