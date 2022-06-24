import fetch from 'node-fetch';

export type ServiceData<T = unknown> = {
  code: string;
  data: T;
  msg: string;
};

const API_BASE_URL = process.env['API_BASE_URL']!;

export const fetchPokeList = async ({
  id,
  token,
}: {
  id: string | number;
  token: string;
}): Promise<
  ServiceData<{
    tagCount: number;
    thumbCount: number;
    pokes: {
      available: boolean;
      content: string;
      count: number;
      pokeId: number;
      pokeType: string;
      poked: boolean;
    }[];
  }>
> => {
  return (
    await fetch(
      `${API_BASE_URL}/account/v2/public/user/poke/${id}/list`,
      {
        headers: {
          'x-client': 'web',
          'x-hotchat-auth-token': token,
        },
      }
    )
  ).json();
};

export async function fetchPokeUser({
  token,
  id,
  item = 1,
}: {
  token: string;
  id: number | string;
  item?: number | string;
}): Promise<ServiceData<{ msg: string }>> {
  return (
    await fetch(
      `${API_BASE_URL}/account/v2/public/user/poke/${id}/item/${item}`,
      {
        headers: {
          'x-client': 'web',
          'x-hotchat-auth-token': token,
        },
        method: 'POST',
      }
    )
  ).json();
}
