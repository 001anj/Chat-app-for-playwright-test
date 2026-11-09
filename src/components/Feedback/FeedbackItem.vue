<script setup lang="ts">
import { toRefs, type PropType } from "vue";
import type { Feedback } from "@/models/feedback";

const props = defineProps({
  feedbackItem: Object as PropType<Feedback>,
});

const { feedbackItem } = toRefs(props);
</script>

<template>
  <div class="p-8 bg-white shadow rounded-md">
    <div class="flex items-center justify-center bg-gray-50 rounded-md p-4 shadow-inner">
      <div class="w-1/2 text-center">
        <img
          class="h-8 w-8 inline-block rounded-full"
          loading="lazy"
          :src="`https://avatars.dicebear.com/api/initials/${feedbackItem?.author?.username}.svg`"
          alt=""
        />
        <div class="text-xs mt-2 text-gray-600 line-clamp-1">{{ feedbackItem?.author?.username }}</div>
      </div>

      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        stroke-width="2"
      >
        <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
      </svg>

      <div class="w-1/2 text-center">
        <img
          class="h-8 w-8 inline-block rounded-full"
          loading="lazy"
          :src="`https://avatars.dicebear.com/api/initials/${feedbackItem?.receiver?.username}.svg`"
          alt=""
        />
        <div class="text-xs mt-2 text-gray-600 line-clamp-1">{{ feedbackItem?.receiver?.username }}</div>
      </div>
    </div>

    <div class="mt-8">
      <h3 class="font-bold text-sm" v-html="feedbackItem?.title" />

      <section class="prose-sm max-w-full mt-4" v-html="feedbackItem?.body" />
    </div>
  </div>
</template>
