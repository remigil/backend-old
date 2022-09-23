const { default: axios } = require("axios");

module.exports = async (coordinate = []) => {
  let coordinateString = "";

  coordinate?.forEach((coordinateData, index) => {
    coordinateString +=
      coordinateData.latLng.lng + "," + coordinateData.latLng.lat;
    coordinateString += index != coordinate.length - 1 ? ";" : "";
  });

  let data = await axios({
    url:
      "https://router.project-osrm.org/route/v1/car/" +
      coordinateString +
      "?overview=simplified&geometries=geojson&alternatives=3&steps=true",
  });
  let directions = [];
  let getDataRoutes = data.data.routes[0].legs;
  getDataRoutes.forEach((leg) => {
    leg.steps.forEach((step, j) => {
      step.geometry.coordinates.forEach((intersection, k) => {
        directions.push({
          latitude: intersection[1],
          longitude: intersection[0],
        });
      });
    });
  });
  return {
    route: directions?.reverse(),
    estimasi: (data.data.routes[0].distance / 1000).toFixed(2) + " Km",
    estimasiWaktu: data?.data?.routes[0].duration
      ? (data?.data?.routes[0].duration / 60).toFixed(2) + " Menit"
      : "0 Menit",
  };
};
