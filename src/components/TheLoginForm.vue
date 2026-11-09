<script setup lang="ts">
import { ref } from "vue";
import { api } from "@/util/api";
import { useAuthStore } from "@/stores/auth";
import { useRouter } from "vue-router";
import BaseButton from "./BaseButton.vue";

const router = useRouter();
const authStore = useAuthStore();

let isLoading = ref(false);
let hasError = ref(false);

let form = ref({
  username: "",
  password: "",
});

async function onSubmit() {
  isLoading.value = true;
  hasError.value = false;

  try {
    const response = await api.post("/auth/sign-in", form.value);

    await authStore.init(response.data?.accessToken);

    if (authStore.isLoggedIn) router.push({ name: "feedback" });
  } catch {
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
}
</script>

<template>
  <form class="space-y-6" data-test-id="login" @submit.prevent="onSubmit">
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>

    <div>
      <label for="username" class="block text-sm font-medium text-gray-700"> Username </label>
      <div class="mt-1">
        <input
          id="username"
          name="username"
          type="text"
          autocomplete="username"
          required
          class="w-full border-gray-300 rounded-md"
          v-model="form.username"
        />
      </div>
    </div>

    <div>
      <label for="password" class="block text-sm font-medium text-gray-700"> Password </label>
      <div class="mt-1">
        <input
          id="password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          class="w-full border-gray-300 rounded-md"
          v-model="form.password"
        />
      </div>
    </div>

    <div v-if="hasError" class="text-red-400 text-center text-sm">Wrong username or password</div>

    <div>
      <BaseButton class="w-full" type="submit" :is-loading="isLoading"> Sign in </BaseButton>
    </div>
  </form>
</template>
