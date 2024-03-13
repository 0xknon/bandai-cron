export const getISODate = () => {
  return new Date().toISOString().split("T")[0];
};
