<script setup lang="ts">
import { onMounted, Ref, ref } from "vue"

interface AuthorData {
	author: {
		id: number
		fullname: string
		created_at: string
		updated_at: string
	}
}

interface Painting {
	id: number
	name: string
	image_url: string
	link: string
	musuemId: number
	PaintingAuthor: AuthorData[]
}

const paintings: Ref<Painting[]> = ref([])
const winningPainting: Ref<Painting> = ref({} as Painting)
const gameMessage = ref("")

function fetchRandomPainting(): Promise<{ paintings: Painting[] }> {
	return new Promise((resolve, reject) => {
		fetch(`${__APP_ENV__.API_ADDRESS}/paintings/random/4`)
			.then((response) => response.json())
			.then((data) => resolve(data))
			.catch((error) => reject(error))
	})
}

async function initPaintings(): Promise<void> {
	const fetchedData = await fetchRandomPainting()
	paintings.value = fetchedData.paintings
}

function setWinningPainting(): void {
	const randomIndex = Math.floor(Math.random() * paintings.value.length)
	winningPainting.value = paintings.value[randomIndex]
}

function authorClickHandler(auhtorId: number): void {
	if (auhtorId === winningPainting.value.PaintingAuthor[0].author.id) {
		gameMessage.value = "Correct!"
	} else {
		gameMessage.value = "Wrong!"
	}
}

async function initGame(): Promise<void> {
	await initPaintings()
	setWinningPainting()
	gameMessage.value = "What is the author of this painting?"
}

onMounted(async () => {
	await initGame()
})
</script>

<template>
	<img :src="winningPainting?.image_url" />
	<button
		v-for="painting of paintings"
		@click="() => authorClickHandler(painting.PaintingAuthor[0].author.id)"
		type="button"
	>
		{{ painting.PaintingAuthor[0].author.fullname }}
	</button>
	<p>{{ gameMessage }}</p>
	<button type="button" @click="initGame">Next</button>
</template>

<style scoped>
img {
	width: 200px;
}
</style>
