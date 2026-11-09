<script setup lang="ts">
import { toRefs, type PropType } from "vue";
import type { Feedback } from "@/models/feedback";
import FeedbackItem from "./FeedbackItem.vue";

const props = defineProps({
  feedback: {
    type: Array as PropType<Feedback[]>,
    default: () => [],
  },
});

const { feedback } = toRefs(props);
</script>

<template>
  <div class="columns-1 lg:columns-3 gap-8">
    <div v-for="feedbackItem in feedback" :key="feedbackItem.id" class="pb-8 break-inside-avoid">
      <FeedbackItem :feedback-item="feedbackItem" />
    </div>
  </div>
</template>
