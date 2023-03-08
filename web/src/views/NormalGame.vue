<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"
import Quizz from "../components/Quizz.vue"

const router = useRouter()

const gameMessageContainer = ref<HTMLElement>()
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
	gameMessageContainer.value?.classList.add("game-message-win")
}

function loseHandler(): void {
	gameMessage.value = "Mauvaise réponse"
	gameMessageContainer.value?.classList.add("game-message-lose")
}

function resetGameMessageClasses(): void {
	gameMessageContainer.value?.classList.remove("game-message-win")
	gameMessageContainer.value?.classList.remove("game-message-lose")
}

function nextGame(): void {
	if (!gameShouldGoNext.value) return
	gameShouldGoNext.value = false

	resetGameMessageClasses()
	gameMessage.value = "choisissez une réponse"
	gameProgression.value += 1
}

function resetGame(): void {
	resetGameMessageClasses()
	gameMessage.value = "choisissez une réponse"
	gameProgression.value = 1
	gameScore.value = 0
}
</script>

<template>
	<div class="container">
		<template v-if="gameProgression <= gameProgressionMax">
			<p>Quiz ({{ gameProgression }}/{{ gameProgressionMax }})</p>
			<h2>Qui a peint cette oeuvre ?</h2>

			<Quizz
				@win="() => gameHandler(winHandler)"
				@lose="() => gameHandler(loseHandler)"
				:key="gameProgression"
				:disabled="gameShouldGoNext"
			></Quizz>
			<div class="quizz-footer">
				<p ref="gameMessageContainer" class="game-message">{{ gameMessage }}</p>
				<button type="button" @click="nextGame" :disabled="!gameShouldGoNext">
					suivant
				</button>
			</div>
		</template>

		<div class="game-over" v-else>
			<p>Vous avez {{ gameScore }}/{{ gameProgressionMax }} bonnes réponses !</p>
			<button type="button" @click="resetGame">rejouer</button>
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

.game-message {
	color: #848484;
}

.game-over {
	display: flex;
	flex-direction: column;
	gap: 16px;
	justify-content: center;
	align-items: center;

	color: #fff;
}

.game-message-win {
	color: var(--color-success);
}

.game-message-lose {
	color: var(--color-fail);
}
</style>
