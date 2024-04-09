import fastify from 'fastify'

const app = fastify()

app.get('/', () => {
  return 'hello word new 2'
})

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log('HTTP Server Running')
  })
