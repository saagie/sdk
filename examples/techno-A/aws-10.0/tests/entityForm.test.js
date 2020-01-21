const { createMockServer } = require('@saagie/sdk-extech')
const { getDatasets, getProjects } = require('../src/entityForm')
const createApp = require('../apiMock')
const apiDataEmpty = require('../apiMock/data.empty.json')

const mockPort = 8080;
const mockUrl = `http://localhost:${mockPort}/api`;

describe('getDatasets', () => {
  it('should returns options if there are datasets', async () => {
    const server = await createMockServer(createApp(), { port: mockPort })

    const { status, data } = await getDatasets({
      custom: {
        endpoint: {
          url: mockUrl,
        },
      },
    })

    expect(status).toBe('SUCCESS')
    expect(data).toHaveLength(2)
    expect(data[0]).toHaveProperty('id')
    expect(data[0]).toHaveProperty('label')

    await server.stop()
  })

  it('should returns EMPTY status if no datasets available', async () => {
    const server = await createMockServer(
      createApp({ initialData: apiDataEmpty }),
      { port: mockPort }
    )

    const { status } = await getDatasets({
      custom: {
        endpoint: {
          url: mockUrl,
        },
      },
    })

    expect(status).toBe('EMPTY')

    await server.stop()
  })


  it('should returns ERROR status if something went wrong', async () => {
    const { status } = await getDatasets({})

    expect(status).toBe('ERROR')
  })
})

describe('getProjects', () => {
  it('should returns options if there are projects', async () => {
    const server = await createMockServer(createApp(), { port: mockPort })

    const { status, data } = await getProjects({
      custom: {
        endpoint: {
          url: mockUrl,
        },
        dataset: {
          id: '1',
        },
      },
    })

    expect(status).toBe('SUCCESS')
    expect(data).toHaveLength(2)

    await server.stop()
  })

  it('should returns EMPTY status if no projects available', async () => {
    const server = await createMockServer(
      createApp({ initialData: apiDataEmpty }),
      { port: mockPort }
    )

    const { status } = await getProjects({
      custom: {
        endpoint: {
          url: mockUrl,
        },
        dataset: {
          id: '1',
        },
      },
    })

    expect(status).toBe('EMPTY')

    await server.stop()
  })

  it('should returns ERROR status if something went wrong', async () => {
    const { status } = await getProjects({})

    expect(status).toBe('ERROR')
  })

})