const { Client } = require("@googlemaps/google-maps-services-js");
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
