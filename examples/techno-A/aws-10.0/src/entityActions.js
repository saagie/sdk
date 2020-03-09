const axios = require('axios')
const { Response } = require('@saagie/sdk')

exports.start = async ({ name, custom }) => {
  try {
    await axios.get(
      `${custom.endpoint.url}/datasets/${custom.dataset.id}/projects/${custom.project.id}/processes/${custom.process.id}/run`
    )

    return Response.success()
  }

  catch (error) {
    return Response.error(`Fail to start job "${name}"`, { error })
  }
}

exports.stop = async ({ name, custom }) => {
  try {
    await axios.get(
      `${custom.endpoint.url}/datasets/${custom.dataset.id}/projects/${custom.project.id}/processes/${custom.process.id}/stop`
    )

    return Response.success()
  }

  catch (error) {
    return Response.error(`Fail to stop job "${name}"`, { error })
  }
}

exports.getStatus = async ({ custom }) => {

}

exports.getLogs = async ({ custom }) => {

}
