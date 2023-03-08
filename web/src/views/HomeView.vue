<script setup lang="ts">
import { onMounted, Ref, ref } from "vue"
import Quizz from "../components/Quizz.vue"

const gameMessage = ref("choisissez une réponse")
const gameProgression = ref(1)
const gameProgressionMax = 10
const gameScore = ref(0)
const gameShouldGoNext = ref(false)

function gameHandler(callback: () => void): void {
	if (gameShouldGoNext.value) return
	gameShouldGoNext.value = true

	callback()
}

function winHandler(): void {
	gameMessage.value = "Bonne réponse !"
	gameScore.value += 1
}

function loseHandler(): void {
	gameMessage.value = "Mauvaise réponse"
}

function nextGame(): void {
	if (!gameShouldGoNext.value) return
	gameShouldGoNext.value = false

	gameMessage.value = "choisissez une réponse"
	gameProgression.value += 1
}

function resetGame(): void {
	gameMessage.value = "choisissez une réponse"
	gameProgression.value = 1
	gameScore.value = 0
}
</script>

<template>
	<div class="container">
		<template v-if="gameProgression < gameProgressionMax">
			<p>Quiz ({{ gameProgression }}/{{ gameProgressionMax }})</p>
			<h2>Qui a peint cette oeuvre ?</h2>

			<Quizz
				@win="() => gameHandler(winHandler)"
				@lose="() => gameHandler(loseHandler)"
				:key="gameProgression"
				:disabled="gameShouldGoNext"
			></Quizz>
			<div class="quizz-footer">
				<p>{{ gameMessage }}</p>
				<button type="button" @click="nextGame" :disabled="!gameShouldGoNext">
					suivant
				</button>
			</div>
		</template>

		<div class="game-over" v-else>
			<p>Vous avez {{ gameScore }}/{{ gameProgressionMax }} bonnes réponses !</p>
			<button type="button" @click="resetGame">rejouer</button>
		</div>
	</div>
</template>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	gap: 16px;

	width: 100%;
	max-width: 350px;
}

.container > p,
.container > h2 {
	margin: 0;
}

.container > p {
	text-align: center;
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
}
</style>
