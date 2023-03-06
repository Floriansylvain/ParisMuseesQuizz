import { initServer } from "../app.js"
import request from "supertest"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcrypt"

const prisma = new PrismaClient()
const app = initServer()
let jwtCookie: string | undefined

const testUsers = [
	{
		email: "a@a.com",
		password: "aaaaaaaaaa",
	},
	{
		email: "b@b.com",
		password: "bbbbbbbbbb",
	},
]

beforeAll(async () => {
	await prisma.user.create({
		data: {
			email: testUsers[0].email,
			password: await bcrypt.hash(testUsers[0].password, 10),
			name: "",
		},
	})
})

afterAll(async () => {
	for (const user of testUsers) {
		await prisma.user.delete({ where: { email: user.email } })
	}
})

describe("GET /v1", () => {
	it("returns status code 200 and api version message", async () => {
		const res = await request(app).get("/v1")

		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty("message")
	})
})

describe("POST /v1/session/register", () => {
	it("returns status code 200 and a success message", async () => {
		const res = await request(app)
			.post("/v1/session/register")
			.set("Content-Type", "application/json")
			.send(JSON.stringify(testUsers[1]))

		expect(res.statusCode).toEqual(200)
		expect(res.body).toHaveProperty("message")
	})

	it("returns status code 400 and an error message", async () => {
		const res = await request(app)
			.post("/v1/session/register")
			.set("Content-Type", "application/json")
			.send(JSON.stringify(testUsers[0]))

		expect(res.statusCode).toEqual(400)
		expect(res.body).toHaveProperty("message")
	})
})

describe("POST /v1/session/login", () => {
	it("returns status code 200 and set httpOnly jwt token cookie", async () => {
		const res = await request(app)
			.post("/v1/session/login")
			.set("Content-Type", "application/json")
			.send(JSON.stringify(testUsers[0]))

		const jwtRegEx = /^jwt=.*Path=\/.*HttpOnly.*Secure.*SameSite=Strict.*$/
		jwtCookie = res
			.get("Set-Cookie")
			?.filter((cookie) => cookie.match(jwtRegEx))[0]

		expect(res.statusCode).toEqual(200)
		expect(jwtCookie).not.toBe(undefined)
	})

	it("returns status code 400 and credentials error message", async () => {
		const res = await request(app)
			.post("/v1/session/login")
			.set("Content-Type", "application/json")
			.send(
				JSON.stringify({
					email: "rip bozo",
					password: "rip bozo",
				})
			)

		expect(res.statusCode).toEqual(400)
		expect(res.body).toHaveProperty("message")
	})
})
