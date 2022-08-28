const { Client } = require("@googlemaps/google-maps-services-js");
const { default: axios } = require("axios");

const response = require("../lib/response");

const googleMapClient = new Client();
class GoogleAPIs {
  static directionAPI(req, res) {
    googleMapClient
      .directions({
        params: {
          key: process.env.GOOGLE_MAPS_API_KEY,
          origin: {
            latitude: req.body["latOrigin"],
            longitude: req.body["lngOrigin"],
          },
          destination: {
            latitude: req.body["latDestination"],
            longitude: req.body["lngDestination"],
          },
        },
      })
      .then((gres) => {
        return response(res, true, "Succeed", gres.data, 200);
      })
      .catch((err) => {
        return response(res, false, err.message, err, 500);
      });
  }
  static async directionAPICostumize(req, res) {
    const { coordinate } = req.query;
    if (!coordinate) {
      return response(res, false, "coordinate Tidak boleh kosong", [], 400);
    }
    let dataCoordinate = "";
    coordinate.forEach((coordinateData, index) => {
      dataCoordinate += coordinateData;
      dataCoordinate += index != coordinate.length - 1 ? ";" : "";
    });

    let data = await axios({
      url:
        "https://router.project-osrm.org/route/v1/car/" +
        dataCoordinate +
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

    return response(res, false, "Succ", directions, 200);
  }
  static async directionAPIfromOSRM(req, res) {
    try {
      let data = await axios({
        url: "https://router.project-osrm.org/route/v1/car/114.97874568698023,-8.296820638729233;115.01140823591524,-8.317828529069729;115.02462636118737,-8.319967139352391?overview=true&geometries=polyline&alternatives=true&steps=true",
      });

      return response(res, false, error.message, error, 500);
    } catch (error) {
      return response(res, false, error.message, error, 500);
    }
  }
  static reverseGeocodingAPI(req, res) {
    googleMapClient
      .reverseGeocode({
        params: {
          key: process.env.GOOGLE_MAPS_API_KEY,
          latlng: {
            latitude: req.body["lat"],
            longitude: req.body["lng"],
          },
          result_type: [
            "administrative_area_level_1",
            "administrative_area_level_2",
            "administrative_area_level_3",
            "administrative_area_level_4",
            "administrative_area_level_5",
            "administrative_area_level_6",
            "administrative_area_level_7",
          ],
        },
      })
      .then((resGeocode) => {
        const result = resGeocode.data.results,
          compondeCode = resGeocode.data.plus_code.compound_code;
        let data = null,
          txtAddress = null;
        if (result.length > 0 && result[0].address_components.length > 0) {
          data = {
            country: null,
            province: null,
            district: null,
            subdistrict: null,
            village: null,
            citizen_assosiation: null,
            neighborhood_association: null,
          };
          txtAddress = result[0].formatted_address;
          Object.keys(data).forEach((k, i) => {
            if (i < result[0].address_components.length) {
              data[k] =
                result[0].address_components[
                  result[0].address_components.length - (i + 1)
                ]?.long_name;
            }
          });
        }
        return response(
          res,
          true,
          txtAddress ?? compondeCode,
          data ?? resGeocode.data.results,
          200
        );
      })
      .catch((err) => response(res, false, err.message, err, 500));
  }
}

module.exports = GoogleAPIs;
