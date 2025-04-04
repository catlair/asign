import { Hono } from 'hono'
import caiyun from './caiyun'
import test from './test'
import user from './user'

const app = new Hono()
  .get('/', (c) => {
    return c.text('Hello Hono!')
  })
  .get('/hello', (c) => {
    return c.json({ message: 'Hello Hono!' })
  })
  .post('/hello', (c) => {
    return c.json({ message: 'post Hello Hono!' })
  })
  .route('/user', user)
  .route('/test', test)
  .route('/caiyun', caiyun)

export default app
