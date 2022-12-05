export const delayTime = (ms, value) => {
  const result = new Promise((resolve) => setTimeout(resolve, ms, value));
  return result;
};
