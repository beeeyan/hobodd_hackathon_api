import app from './app'

const scheduled: ExportedHandlerScheduledHandler = async (event, env, ctx) => {
  // ctx.waitUntil()
  console.log('aaa')
}

export default {
  fetch: app.fetch,
  scheduled,
}