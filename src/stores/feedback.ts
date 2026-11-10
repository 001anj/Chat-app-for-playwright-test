import { defineStore } from "pinia";
import { api } from "@/util/api";
import type { Feedback } from "@/models/feedback";

export const useFeedbackStore = defineStore({
  id: "feedback",
  state: () => ({
    feedback: [] as Feedback[],
  }),
  actions: {
    async fetchAll() {
      try {
        const response = await api.get("/feedback");
        this.feedback = response?.data ?? [];
      } catch {
        this.feedback = [];
      }
    },
  },
});
