export const randomItem = <T = unknown>(list: T[], start = 0) => {
  return list[randomMiddle(start, list.length)];
};

const randomMiddle = (start = 0, end = 0) => {
  const i = end - start;
  if (i == 0) {
    return 0;
  }
  return (Math.round(i * 2 * Math.random()) % i) + start;
};
