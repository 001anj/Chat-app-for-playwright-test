import { createApp, markRaw } from "vue";
import { createPinia } from "pinia";
import { useAuthStore } from "@/stores/auth";

import type { Router } from "vue-router";

declare module "pinia" {
  export interface PiniaCustomProperties {
    $router: Router;
  }
}

import App from "./App.vue";
import router from "./router";
import "./index.css";

const app = createApp(App);
const pinia = createPinia();

pinia.use(({ store }) => {
  store.$router = markRaw(router);
});

app.use(pinia);
app.use(router);

router.beforeEach(async (to) => {
  const auth = useAuthStore();
  if (!to.meta.guestOnly) await auth.init();

  if (to.meta.requiresAuth !== false && !auth.isLoggedIn) return "/";
  if (to.meta.guestOnly && auth.isLoggedIn) return "/feedback";
});

app.mount("#app");
