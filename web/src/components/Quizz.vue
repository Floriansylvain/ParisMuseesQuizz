<script setup lang="ts">
import { onMounted, Ref, ref } from "vue"
import { AuthorData, fetchRandomPainting, Painting } from "../utils/apiFetch"

const emits = defineEmits(["win", "lose"])
const props = defineProps<{ disabled: boolean }>()

const paintings: Ref<Painting[]> = ref([])
const winningPainting: Ref<Painting> = ref({} as Painting)

async function initPaintings(): Promise<void> {
	const fetchedData = await fetchRandomPainting(4)
	paintings.value = fetchedData.paintings
}

function setWinningPainting(): void {
	const randomIndex = Math.floor(Math.random() * paintings.value.length)
	winningPainting.value = paintings.value[randomIndex]
}

function setElementClassById(id: string, cssClass: string): void {
	document.getElementById(id)?.classList.add(cssClass)
}

function authorClickHandler(authorData: AuthorData): void {
	if (authorData.author.fullname === winningPainting.value.PaintingAuthor[0].author.fullname) {
		setElementClassById(authorData.author.fullname, "button-success")
		emits("win")
	} else {
		setElementClassById(authorData.author.fullname, "button-fail")
		setElementClassById(
			winningPainting.value.PaintingAuthor[0].author.fullname,
			"button-neutral"
		)
		emits("lose")
	}
}

async function initGame(): Promise<void> {
	await initPaintings()
	setWinningPainting()
}

onMounted(async () => {
	await initGame()
})
</script>

<template>
	<div class="container">
		<img :src="winningPainting?.image_url" />
		<div class="choices">
			<button
				v-for="painting of paintings"
				@click="() => authorClickHandler({ author: painting.PaintingAuthor[0].author })"
				:id="painting.PaintingAuthor[0].author.fullname"
				type="button"
				:disabled="disabled"
			>
				{{ painting.PaintingAuthor[0].author.fullname }}
			</button>
		</div>
	</div>
</template>

<style scoped>
.container {
	display: flex;
	flex-direction: column;
	gap: 16px;
	justify-content: center;
	align-items: center;

	width: 100%;
}

.container img {
	max-width: 100%;
	max-height: 400px;
}

.choices {
	display: grid;
	grid-template: repeat(2, 1fr) / repeat(2, 1fr);
	grid-gap: 8px;
	width: 100%;
}
</style>
