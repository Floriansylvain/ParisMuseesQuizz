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

const emits = defineEmits(["win", "lose"])
const props = defineProps<{ disabled: boolean }>()

const paintings: Ref<Painting[]> = ref([])
const winningPainting: Ref<Painting> = ref({} as Painting)

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
		emits("win")
	} else {
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
				@click="() => authorClickHandler(painting.PaintingAuthor[0].author.id)"
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
