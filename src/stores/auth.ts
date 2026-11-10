import { defineStore } from "pinia";
import { api } from "@/util/api";

const TOKEN_NAME = "accessToken";

export const useAuthStore = defineStore({
  id: "auth",
  state: () => ({
    currentUser: {
      id: undefined,
      username: undefined,
    },
  }),
  getters: {
    isLoggedIn: (state) => Boolean(state.currentUser.id),
  },
  actions: {
    async init(token = "") {
      if (this.isLoggedIn) return;

      if (!token) {
        token = localStorage.getItem(TOKEN_NAME) ?? "";
      }

      if (!token) return;

      try {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        const response = await api.get("/auth/me");

        if (!response.data?.id) {
          throw new Error("Something went wrong");
        }

        this.currentUser = response.data;

        localStorage.setItem(TOKEN_NAME, token);
      } catch {
        // Reset state without navigating: init() runs inside the router's beforeEach
        // guard, which pushing a navigation from here would race against.
        localStorage.removeItem(TOKEN_NAME);
        delete api.defaults.headers.common["Authorization"];
        this.currentUser = {
          id: undefined,
          username: undefined,
        };
      }
    },

    logout() {
      try {
        localStorage.removeItem(TOKEN_NAME);
        delete api.defaults.headers.common["Authorization"];
        this.currentUser = {
          id: undefined,
          username: undefined,
        };

        this.$router.push({ name: "sign-in" });
      } catch {
        // ignore
      }
    },
  },
});
