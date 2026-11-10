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

router.beforeEach(async (to, from) => {
  const auth = useAuthStore();
  await auth.init();

  if (to.meta.requiresAuth !== false && !auth.isLoggedIn) return "/";

  if (to.meta.guestOnly && auth.isLoggedIn) {
    if (from.name === "feedback") {
      // The browser's back button already moved the address bar to this guest-only
      // route while the current route (internally) never left "feedback" - redirecting
      // back to "feedback" here is a same-route no-op for vue-router, which skips
      // re-syncing the URL, so fix it up directly instead of returning a redirect.
      window.history.replaceState(window.history.state, "", "/feedback");
      return false;
    }

    return "/feedback";
  }
});

app.mount("#app");
