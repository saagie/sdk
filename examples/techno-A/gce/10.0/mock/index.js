import jsonServer from 'json-server'
import mockData from './data.json'
import mockRoutes from './routes.json'

export const createApp = ({
  initialData = mockData,
  routes = mockRoutes,
} = {}) => {
  const app = jsonServer.create()

  app.use(jsonServer.defaults())
  app.use(jsonServer.rewriter(routes))
  app.use(jsonServer.router(initialData))

  return app
}

export default createApp();
