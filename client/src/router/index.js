import * as VueRouter from "vue-router";

const Home = () => import("../views/Home.vue");
const PageJeu = () => import("../views/PageJeu.vue");
const NotFoundPage = () => import("../views/NotFound.vue");

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes: [
    {
      path: "/",
      name: "Home",
      component: Home,
    },
    {
      path: "/game/:roomId",
      name: "PageJeu",
      component: PageJeu,
    },
    {
      path: "/notfound",
      name: "NotFound",
      component: NotFoundPage,
    },
    {
      path: "/:wrongPath(.*)",
      redirect: (to) => {
        return { name: "NotFound", params: { wrongPath: to.params.wrongPath } };
      },
    },
  ],
});

export default router;
