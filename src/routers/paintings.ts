import { PrismaClient, PaintingAuthor, Painting, Author } from "@prisma/client"
import express, { RequestHandler } from "express"
import { z } from "zod"
import { getPaintingQuery } from "../utils/queries.js"

import fs from "fs"

interface GraphQlPainting {
	data: {
		nodeQuery: {
			entities: {
				entityUuid: string
				title: string
				absolutePath: string
				fieldOeuvreAuteurs: {
					entity: {
						fieldAuteurAuteur: {
							entity: {
								name: string
							}
						}
					}
				}[]
				fieldVisuels: {
					entity: {
						publicUrl: string
					}
				}[]
				fieldMusee: {
					entity: {
						name: string
					}
				}
			}[]
		}
	}
}

interface ParsedPainting {
	image_url: string
	name: string
	link: string
	musuem: string
	author: string
}

const paintingsRouter = express.Router()
const prisma = new PrismaClient()

const paintingParamsParser = z
	.object({
		uuid: z.string(),
	})
	.required()

const randomParser = z
	.object({
		limit: z.coerce.number().min(1).max(10),
	})
	.required()

function parseGraphQlPainting(painting: GraphQlPainting): ParsedPainting {
	const graphQlPainting = painting.data.nodeQuery.entities[0]
	return {
		image_url: graphQlPainting.fieldVisuels[0].entity.publicUrl,
		name: graphQlPainting.title,
		link: graphQlPainting.absolutePath,
		musuem: graphQlPainting.fieldMusee.entity.name,
		author: graphQlPainting.fieldOeuvreAuteurs[0].entity.fieldAuteurAuteur.entity.name,
	}
}

function fetchPainting(uuid: string): Promise<GraphQlPainting> {
	return new Promise((resolve, reject) => {
		fetch("https://apicollections.parismusees.paris.fr/graphql", {
			method: "POST",
			headers: {
				"auth-token": process.env.PARISMUSEES_SECRET as string,
			},
			body: JSON.stringify({ query: getPaintingQuery(uuid) }),
		})
			.then((res) => res.json())
			.then((data) => resolve(data))
			.catch((err) => reject(err))
	})
}

async function getRandomPaintings(limit: number): Promise<(Painting | null)[]> {
	const paintingsUUIDs = JSON.parse(fs.readFileSync("src/assets/paintingsUUID.json", "utf8"))
	const randomUUIDs = paintingsUUIDs.paintings.sort(() => Math.random() - 0.5).slice(0, limit)

	const paintings = []
	for (const uuid of randomUUIDs) {
		const fetchedPainting = await fetchPainting(uuid)
		const parsedPainting = parseGraphQlPainting(fetchedPainting)

		const painting = await getPainting(undefined, parsedPainting.name)
		if (!painting) {
			const createdPaintingAuthor = await createPainting(parsedPainting)
			paintings.push(await getPainting(createdPaintingAuthor.painting_id, undefined))
			continue
		}

		await updatePaintingIfNeeded(painting, parsedPainting)
		paintings.push(await getPainting(undefined, parsedPainting.name))
	}

	return paintings
}

async function createPainting(painting: ParsedPainting): Promise<PaintingAuthor> {
	return await prisma.paintingAuthor.create({
		data: {
			painting: {
				create: {
					image_url: painting.image_url,
					name: painting.name,
					link: painting.link,
					Musuem: {
						connectOrCreate: {
							where: {
								name: painting.musuem,
							},
							create: {
								name: painting.musuem,
							},
						},
					},
				},
			},
			author: {
				connectOrCreate: {
					where: {
						fullname: painting.author,
					},
					create: {
						fullname: painting.author,
					},
				},
			},
		},
	})
}

async function getPainting(id?: number, name?: string): Promise<Painting | null> {
	if (!id && !name) return null

	return await prisma.painting.findUnique({
		where: id ? { id } : { name },
		include: { PaintingAuthor: { select: { author: true } } },
	})
}

async function getPaintingAuthors(paintingId: number): Promise<(Author | null)[]> {
	const paintingAuthors = (
		await prisma.painting.findUnique({
			where: { id: paintingId },
			include: { PaintingAuthor: true },
		})
	)?.PaintingAuthor

	if (!paintingAuthors) return []

	const authors = []

	for (const paintingAuthor of paintingAuthors) {
		const author = await prisma.author.findUnique({
			where: { id: paintingAuthor.author_id },
		})
		authors.push(author)
	}

	return authors
}

async function updatePainting(id: number, painting: ParsedPainting): Promise<Painting> {
	return await prisma.painting.update({
		where: {
			id: id,
		},
		data: {
			image_url: painting.image_url,
			name: painting.name,
			link: painting.link,
			Musuem: {
				connectOrCreate: {
					where: {
						name: painting.musuem,
					},
					create: {
						name: painting.musuem,
					},
				},
			},
		},
	})
}

async function updatePaintingIfNeeded(
	painting: Painting,
	parsedPainting: ParsedPainting
): Promise<void> {
	const paintingMusuem = (
		await prisma.painting.findUnique({
			where: {
				id: painting.id,
			},
			select: {
				Musuem: true,
			},
		})
	)?.Musuem
	const paintingAuthors = await getPaintingAuthors(painting.id)

	if (
		painting.image_url !== parsedPainting.image_url ||
		painting.name !== parsedPainting.name ||
		painting.link !== parsedPainting.link ||
		paintingMusuem?.name !== parsedPainting.musuem ||
		paintingAuthors?.[0]?.fullname !== parsedPainting.author
	) {
		updatePainting(painting.id, parsedPainting)
	}
}

const paintingRouterGet: RequestHandler = async (req, res) => {
	const parsedPaintingParams = paintingParamsParser.safeParse(req.params)
	if (!parsedPaintingParams.success) {
		res.status(400).send({ message: "Please provide valid painting UUID." })
		return
	}

	const fetchedPainting = await fetchPainting(parsedPaintingParams.data.uuid)
	const parsedPainting = parseGraphQlPainting(fetchedPainting)

	const painting = await getPainting(undefined, parsedPainting.name)
	if (!painting) {
		const createdPaintingAuthor = await createPainting(parsedPainting)
		res.send({ painting: await getPainting(createdPaintingAuthor.painting_id, undefined) })
		return
	}

	await updatePaintingIfNeeded(painting, parsedPainting)

	res.send({ painting: await getPainting(undefined, parsedPainting.name) })
	return
}

const paintingRouterGetRandoms: RequestHandler = async (req, res) => {
	const parsedPainting = randomParser.safeParse(req.params)
	if (!parsedPainting.success) {
		res.status(400).send({
			message: "Please provide valid paintings limit.",
			issues: parsedPainting.error.issues,
		})
		return
	}

	res.send({
		paintings: await getRandomPaintings(parsedPainting.data.limit),
	})
}

paintingsRouter.get("/:uuid", paintingRouterGet)
paintingsRouter.get("/random/:limit", paintingRouterGetRandoms)

export default paintingsRouter
