<script setup lang="ts">
import FeedbackItemList from "../components/Feedback/FeedbackItemList.vue";
import { useFeedbackStore } from "@/stores/feedback";
import { onMounted, ref } from "vue";
import { useFullscreen } from "@vueuse/core";
import IconLoading from "@/components/Icons/IconLoading.vue";
import IconFullscreen from "../components/Icons/IconFullscreen.vue";
import TheFeedbackCreateForm from "@/components/Feedback/TheFeedbackCreateForm.vue";
import {
  Dialog,
  DialogOverlay,
  DialogTitle,
  DialogDescription,
  TransitionRoot,
  TransitionChild,
} from "@headlessui/vue";

const feedbackStore = useFeedbackStore();

const isLoading = ref(true);
const isCreateModalOpen = ref(false);

const fullscreenToggle = ref(null);
const { toggle, isFullscreen } = useFullscreen(fullscreenToggle);

async function fetchData() {
  isLoading.value = true;

  await feedbackStore.fetchAll();

  isLoading.value = false;
}

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div data-test-id="feedback-wall-page">
    <div class="flex justify-between items-center mb-8 pb-8 border-b border-gray-100">
      <h1 class="text-2xl">Feedback Wall</h1>

      <div class="flex items-center justify-center space-x-4">
        <a href="#" title="Toggle Fullscreen" @click.prevent="toggle">
          <IconFullscreen />
        </a>

        <button
          type="button"
          class="flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          @click="isCreateModalOpen = true"
        >
          Create New
        </button>
      </div>
    </div>

    <!-- content -->

    <div v-if="isLoading" class="text-center text-gray-400">
      <IconLoading />
    </div>

    <div v-else-if="!feedbackStore.feedback.length" class="text-center text-gray-400">
      Be the first to give feedback!
    </div>

    <div v-else ref="fullscreenToggle" :class="{ 'bg-gray-50 p-4 overflow-auto': isFullscreen }">
      <FeedbackItemList :feedback="feedbackStore.feedback" />
    </div>

    <!-- modal -->
    <TransitionRoot appear :show="isCreateModalOpen" as="template">
      <Dialog as="div" @close="isCreateModalOpen = false">
        <div class="fixed inset-0 z-10 overflow-y-auto">
          <div class="min-h-screen px-4 text-center">
            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0"
              enter-to="opacity-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100"
              leave-to="opacity-0"
            >
              <DialogOverlay class="fixed inset-0 bg-black opacity-30" />
            </TransitionChild>

            <span class="inline-block h-screen align-middle" aria-hidden="true"> &#8203; </span>

            <TransitionChild
              as="template"
              enter="duration-300 ease-out"
              enter-from="opacity-0 scale-95"
              enter-to="opacity-100 scale-100"
              leave="duration-200 ease-in"
              leave-from="opacity-100 scale-100"
              leave-to="opacity-0 scale-95"
            >
              <div
                class="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl"
              >
                <DialogTitle as="h3" class="text-lg font-medium leading-6 text-gray-900"> Create Feedback </DialogTitle>

                <DialogDescription> Give your peers some feedback </DialogDescription>

                <hr class="mt-4" />

                <div class="mt-4">
                  <TheFeedbackCreateForm @submit="isCreateModalOpen = false" />
                </div>
              </div>
            </TransitionChild>
          </div>
        </div>

        <TheFeedbackCreateForm />
      </Dialog>
    </TransitionRoot>
  </div>
</template>
