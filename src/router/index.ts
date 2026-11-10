import { createRouter, createWebHistory } from "vue-router";
import SignInView from "../views/SignInView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "sign-in",
      meta: {
        requiresAuth: false,
        guestOnly: true,
      },
      component: SignInView,
    },
    {
      path: "/feedback",
      name: "feedback",
      component: () => import("../views/FeedbackWall.vue"),
    },
    {
      path: "/:pathMatch(.*)*",
      redirect: { name: "sign-in" },
    },
  ],
});

export default router;
