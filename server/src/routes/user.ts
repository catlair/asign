import { Hono } from 'hono'

const app = new Hono()
  .get('/', (c) => c.text('List Users'))
  .post('/', (c) => c.text('Create User'))

export default app
