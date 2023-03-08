<script setup lang="ts">
import { useRouter } from "vue-router"

const router = useRouter()
</script>

<template>
	<div class="container">
		<h1>Quizz peintres / peintures Paris Musées</h1>
		<button @click="() => router.push('/game/learn')">Mode apprentissage</button>
		<button @click="() => router.push('/game/normal')">Mode normal</button>
	</div>
</template>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 16px;
}

.container h1 {
	color: #fff;
}

.container button {
	width: 100%;
	max-width: 200px;
}
</style>
