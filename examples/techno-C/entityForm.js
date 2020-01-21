import axios from 'axios';
import { Response } from '@saagie/sdk-extech';

export const getDatasets = async ({ custom }) => {
  try {
    const { data: datasets } = await axios.get(
      `${custom.connection.url}/datasets`
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
  } catch (error) {
    return Response.error('Can\'t retrieve datasets', { error })
  }
}