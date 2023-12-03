<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card class="elevation-12">
          <v-toolbar color="secondary" dark>
            <v-toolbar-title>Set New Password</v-toolbar-title>
          </v-toolbar>
          <v-card-text>
            <div v-if="message" align="center" :class="messageClass">
              {{ message }}
            </div>
            <v-text-field
              label="New Password"
              prepend-icon="mdi-lock"
              type="password"
              v-model="newPassword"
              class="mt-3"
            ></v-text-field>
            <v-text-field
              label="Confirm New Password"
              prepend-icon="mdi-lock-check"
              type="password"
              v-model="confirmPassword"
            ></v-text-field>
          </v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="submit">Set New Password</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const newPassword = ref('');
const confirmPassword = ref('');
const message = ref('');
const isSuccessMessage = ref(false);
const router = useRouter();
const token = router.currentRoute.value.query.token; // Get the token from the URL

const submit = async () => {
  if (newPassword.value !== confirmPassword.value) {
    message.value = "Passwords do not match.";
    isSuccessMessage.value = false;
    return;
  }

  try {
    await axios.post('http://localhost:5000/reset-password/confirm', {
      token: token,
      newPassword: newPassword.value
    });
    message.value = "Your password has been reset successfully.";
    isSuccessMessage.value = true;
    router.push('/login'); // Redirect to login page after successful password reset
  } catch (error) {
    message.value = error.response ? error.response.data : 'Error occurred while setting new password.';
    isSuccessMessage.value = false;
  }
};

const messageClass = computed(() => ({
  'text-success': isSuccessMessage.value,
  'text-error': !isSuccessMessage.value,
}));
</script>

<style scoped>
.text-success {
  color: green;
}

.text-error {
  color: red;
}
</style>
