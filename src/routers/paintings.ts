import { PrismaClient } from "@prisma/client"
import express, { RequestHandler } from "express"
import { z } from "zod"
import { getPaintingQuery } from "../utils/queries.js"

import fs from "fs"

const paintingsRouter = express.Router()
// const prisma = new PrismaClient()

const paintingParser = z
	.object({
		uuid: z.string(),
	})
	.required()

const randomParser = z
	.object({
		limit: z.coerce.number().max(10),
	})
	.required()

async function fetchPainting(uuid: string): Promise<unknown> {
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

async function getRandomPaintings(limit: number): Promise<unknown[]> {
	const paintingsUUIDs = JSON.parse(
		fs.readFileSync("src/assets/paintingsUUID.json", "utf8")
	)
	const randomUUIDs = paintingsUUIDs.paintings
		.sort(() => Math.random() - 0.5)
		.slice(0, limit)

	const paintings = []
	for (const uuid of randomUUIDs) {
		const painting = await fetchPainting(uuid)
		paintings.push(painting)
	}

	return paintings
}

const paintingRouterGet: RequestHandler = async (req, res) => {
	const parsedPainting = paintingParser.safeParse(req.params)
	if (!parsedPainting.success) {
		res.status(400).send({ message: "Please provide valid painting UUID." })
		return
	}

	const painting = await fetchPainting(parsedPainting.data.uuid)
	res.send({ painting })
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
