const axios = require('axios')
const { Response } = require('@saagie/sdk')

exports.getDatasets = async ({ custom }) => {
  try {
    const { data: datasets } = await axios.get(
      `${custom.endpoint.url}/datasets`
    )

    if (!datasets || !datasets.length) {
      return Response.empty('No datasets availables')
    }

    return Response.success(
      datasets.map(({ name, id }) => ({
        id,
        label: name,
      })),
    )
  }

  catch (error) {
    return Response.error('Can\'t retrieve datasets', { error })
  }
}

exports.getProjects = async ({ custom }) => {
  try {
    const { data: projects } = await axios.get(
      `${ custom.endpoint.url}/datasets/${ custom.dataset.id}/projects`
    )

    if (!projects || !projects.length) {
      return Response.empty('No projects availables')
    }

    return Response.success(
      projects.map(({ name, id }) => ({
        id,
        label: name,
      })),
    )
  }

  catch (error) {
    return Response.error('Can\'t retrieve projects', { error })
  }
}

exports.getProcesses = async ({ custom }) => {
  try {
    const { data: processes } = await axios.get(
      `${custom.endpoint.url}/datasets/${custom.dataset.id}/projects/${custom.project.id}/processes`
    )

    if (!processes || !processes.length) {
      return Response.empty('No processes availables')
    }

    return Response.success(
      processes.map(({ name, id }) => ({
        id,
        label: name,
      }))
    )
  }

  catch (error) {
    return Response.error('Can\'t retrieve processes', { error })
  }
}
