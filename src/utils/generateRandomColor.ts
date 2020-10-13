// no use in production
export const generateRandomColor = (base) =>
  Array(6)
    .fill(0)
    .reduce((acc, _) => acc + base[Math.floor(Math.random() * base.length)], "#");
