const getRandomRange = (min, max, fixed) => (Math.random() * (max - min) + min).toFixed(fixed) * 1;

export default getRandomRange;
