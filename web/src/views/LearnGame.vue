<script setup lang="ts">
import { onMounted, Ref, ref } from "vue"
import { useRouter } from "vue-router"
import { fetchRandomPainting, Painting } from "../utils/apiFetch"

const router = useRouter()

const gameProgression = ref(1)
const gameProgressionMax = 9

const paintings: Ref<Painting[]> = ref([])

async function initGame(): Promise<void> {
	paintings.value = (await fetchRandomPainting(gameProgressionMax)).paintings
	console.log(paintings.value)
}

function nextGame(): void {
	gameProgression.value += 1
}

async function resetGame(): Promise<void> {
	await initGame()
	gameProgression.value = 1
}

onMounted(async () => {
	await initGame()
})
</script>

<template>
	<div class="container">
		<template v-if="gameProgression <= gameProgressionMax">
			<p>Apprentissage ({{ gameProgression }}/{{ gameProgressionMax }})</p>
			<h2>Qui a peint cette oeuvre ?</h2>

			<img :src="paintings[gameProgression - 1]?.image_url" alt="" />
			<div class="description">
				<p>Cette oeuvre a été peinte par</p>
				<p class="author">
					{{ paintings[gameProgression - 1]?.PaintingAuthor[0].author.fullname }}
				</p>
				<p>{{ paintings[gameProgression - 1]?.name }}</p>
				<p class="museum">{{ paintings[gameProgression - 1]?.Musuem.name }}</p>
			</div>

			<div class="quizz-footer">
				<button type="button" @click="nextGame">suivant</button>
			</div>
		</template>

		<div class="game-over" v-else>
			<p>Vous avez terminé une série de {{ gameProgressionMax }} peintres / peintures !</p>
			<button type="button" @click="resetGame">recommencer</button>
			<button type="button" @click="() => router.push('/')">accueil</button>
		</div>
	</div>
</template>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	gap: 16px;

	margin: auto;

	width: 100%;
	max-width: 350px;
}

.container > p,
.container > h2 {
	margin: 0;
	color: #fff;
}

.container > p {
	align-self: center;
	padding: 8px;
	border-bottom: solid 1px var(--color-secondary);
}

.quizz-footer {
	display: flex;
	justify-content: space-between;
	align-items: center;
}

.game-over {
	display: flex;
	flex-direction: column;
	gap: 16px;
	justify-content: center;
	align-items: center;

	color: #fff;
}

.description {
	display: flex;
	flex-direction: column;
	gap: 8px;
	justify-content: center;
	align-items: center;

	padding: 16px;
	backdrop-filter: blur(10px);

	text-align: center;
}

.description p {
	margin: 0;
}

.museum {
	color: var(--color-secondary);
}

.author {
	padding: 6px 8px;
	background-color: var(--color-tertiary);
}
</style>
