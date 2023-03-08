export interface AuthorData {
	author: {
		id: number
		fullname: string
		created_at: string
		updated_at: string
	}
}

export interface Painting {
	id: number
	name: string
	image_url: string
	link: string
	musuemId: number
	PaintingAuthor: AuthorData[]
	Musuem: {
		id: number
		name: string
		created_at: string
		updated_at: string
	}
}

export function fetchRandomPainting(limit: number): Promise<{ paintings: Painting[] }> {
	return new Promise((resolve, reject) => {
		fetch(`${__APP_ENV__.API_ADDRESS}/paintings/random/${limit}`)
			.then((response) => response.json())
			.then((data) => resolve(data))
			.catch((error) => reject(error))
	})
}
