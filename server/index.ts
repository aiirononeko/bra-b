import { Hono } from 'hono'

const app = new Hono()

app.use(async (c, next) => {
	await next()
	c.header('X-Powered-By', 'Remix and Hono')
})

export default app
