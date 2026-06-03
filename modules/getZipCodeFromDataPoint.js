export default (datapoint) => {
  return (
    datapoint.postcode ||
    datapoint.zipcode ||
    datapoint.zip_code ||
    datapoint.zip_code_2 ||
    false
  );
};
