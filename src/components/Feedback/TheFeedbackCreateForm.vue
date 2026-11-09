<script setup lang="ts">
import { ref, onBeforeMount, computed, type Ref } from "vue";
import { api } from "@/util/api";
import { useAuthStore } from "@/stores/auth";
import { useFeedbackStore } from "@/stores/feedback";
import type { User } from "@/models/user";
import type { Feedback } from "@/models/feedback";
import BaseButton from "../BaseButton.vue";

const authStore = useAuthStore();
const feedbackStore = useFeedbackStore();

const emit = defineEmits(["submit"]);

let isLoading = ref(false);
let hasError = ref(false);

let form = ref({
  title: "",
  body: "",
  receiverId: "" as number | string,
});

// form
async function onSubmit() {
  isLoading.value = true;
  hasError.value = false;

  try {
    const response = await api.post("/feedback", form.value);
    const feedbackItem: Feedback = response.data;

    if (!feedbackItem) return;

    feedbackStore.$patch((state) => {
      state.feedback.unshift(feedbackItem);
    });

    emit("submit");
  } catch {
    hasError.value = true;
  } finally {
    isLoading.value = false;
  }
}

// user select
const talents: Ref<User[]> = ref([]);
const talentsFiltered = computed(() => {
  return talents.value.filter?.((talent) => talent.id !== authStore.currentUser.id);
});

async function getAllUsers() {
  try {
    const response = await api.get("/auth/users");

    talents.value = response.data ?? [];
  } catch {
    // ignore
  }
}

onBeforeMount(() => {
  getAllUsers();
});
</script>

<template>
  <form class="space-y-6" data-test-id="login" @submit.prevent="onSubmit">
    <div>
      <label for="title" class="block text-sm font-medium text-gray-700"> Title </label>
      <div class="mt-1">
        <input
          id="title"
          name="title"
          type="text"
          autocomplete="off"
          required
          class="w-full border-gray-300 rounded-md"
          v-model="form.title"
        />
      </div>
    </div>

    <div>
      <label for="body" class="block text-sm font-medium text-gray-700"> Comment </label>
      <div class="mt-1">
        <textarea
          id="body"
          name="body"
          autocomplete="off"
          required
          class="w-full border-gray-300 rounded-md"
          v-model="form.body"
        />
      </div>
    </div>

    <hr class="my-4" />

    <div>
      <select class="w-full rounded-md border-gray-300" required v-model="form.receiverId">
        <option value="" disabled>Select the receiver</option>
        <option v-for="talent in talents" :key="talent.id" :value="talent.id" :selected="form.receiverId === talent.id">
          {{ talent.username }}
        </option>
      </select>
    </div>

    <hr class="my-4" />

    <div v-if="hasError" class="text-red-400 text-center text-sm mb-4">Please make sure that all fields are filled</div>

    <div>
      <BaseButton class="w-full" type="submit" :is-loading="isLoading"> Submit </BaseButton>
    </div>
  </form>
</template>
