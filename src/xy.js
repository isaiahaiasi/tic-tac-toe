const CreateXY = (function XY(x, y) {
  const xy = { x, y };
  Object.freeze(xy);
  return xy;
});

export { CreateXY };