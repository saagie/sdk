const jsonServer = require('json-server')
const mockData = require('./data.json')
const mockRoutes = require('./routes.json')

const createApp = ({
  initialData = mockData,
  routes = mockRoutes,
} = {}) => {
  const app = jsonServer.create()

  app.use(jsonServer.defaults())
  app.use(jsonServer.rewriter(routes))
  app.use(jsonServer.router(initialData))

  return app
}

module.exports = createApp;
