import { PrismaClient } from '@prisma/client';
import { randomItem } from './util';
import { fetchPokeList, fetchPokeUser } from './api';
import type { ServiceData } from './api';

const prisma = new PrismaClient();

export const handler = async () => {
  // 修改数据, 保持数据库活跃状态
  await prisma.cache.deleteMany();
  await prisma.cache.create({
    data: {
      note: new Date().toISOString(),
    },
  });

  const dbResult = await prisma.user.findMany({
    where: {
      hotChatToken: {
        not: null,
      },
    },
    include: {
      pokingList: {
        include: {
          poker: {
            select: {
              name: true,
              hotChatId: true,
            },
          },
        },
      },
    },
  });

  const nameList: (string | null)[] = [];
  const taskList: Promise<ServiceData>[] = [];
  const pokeList = await fetchPokeList({
    id: dbResult[0].hotChatId.toString(),
    token: dbResult[0].hotChatToken + '',
  });
  if (pokeList.code != 'A00000') {
    return JSON.stringify(pokeList, undefined, 2);
  }
  dbResult.forEach((user) => {
    const { hotChatToken } = user;
    if (hotChatToken) {
      user.pokingList.forEach(({ poker }) => {
        const pokeItem = randomItem(pokeList.data.pokes, 1);
        taskList.push(
          ...[
            fetchPokeUser({
              token: hotChatToken,
              id: poker.hotChatId.toString(),
              item: pokeList.data.pokes[0].pokeId,
            }),
            fetchPokeUser({
              token: hotChatToken,
              id: poker.hotChatId.toString(),
              item: pokeItem.pokeId,
            }),
          ]
        );
        nameList.push(
          ...[
            poker.name + ':' + pokeList.data.pokes[0].content,
            poker.name + ':' + pokeItem.content,
          ]
        );
      });
    }
  });
  const resultList = await Promise.all(taskList);
  return JSON.stringify(
    resultList.map(({ code }, i) => ({ code, name: nameList[i] })),
    undefined,
    2
  );
};

export const aliyunHandler = async (
  event: unknown,
  context: unknown,
  callback: (err: unknown, data: unknown) => void
) => {
  callback(null, await handler());
};
