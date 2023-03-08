import { createRouter, createWebHistory, RouteComponent } from "vue-router"
import HomeView from "../views/HomeView.vue"

const router = createRouter({
	history: createWebHistory(import.meta.env.BASE_URL),
	routes: [
		{
			path: "/",
			name: "home",
			component: HomeView,
		},
		{
			path: "/game/normal",
			name: "gameNormal",
			component: () => import("../views/NormalGame.vue"),
		},
		{
			path: "/game/learn",
			name: "gameLearn",
			component: () => import("../views/LearnGame.vue"),
		},
	],
})

export default router
