<script setup lang="ts">
import { toRefs } from "vue";
import IconLoading from "@/components/Icons/IconLoading.vue";

const props = defineProps({
  isLoading: {
    type: Boolean,
    default: () => false,
  },
  isDisabled: {
    type: Boolean,
    default: () => false,
  },
  href: {
    type: String,
    default: () => "",
  },
});

const { isLoading } = toRefs(props);
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    class="flex justify-center line-clamp-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    :class="{ 'cursor-not-allowed opacity-75': isLoading || isDisabled }"
    :disabled="isLoading || isDisabled"
  >
    <slot />
    <IconLoading class="text-white" v-if="isLoading" />
  </component>
</template>
