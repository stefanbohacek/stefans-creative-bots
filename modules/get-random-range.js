export default (min, max, fixed) => (Math.random() * (max - min) + min).toFixed(fixed || 2) * 1;
