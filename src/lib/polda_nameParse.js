exports.namePolda = (data) => {
  let polda_id = "";
  let polda_name = "";
  switch (data) {
    case "JATIM":
      polda_id = 18;
      polda_name = "Jawa Timur";
      break;

    case "LAMPUNG":
      polda_id = 6;
      polda_name = "Lampung";
      break;

    case "SULBAR":
      polda_id = 33;
      polda_name = "Sulawesi Barat";
      break;

    case "JABAR":
      polda_id = 11;
      polda_name = "Jawa Barat";
      break;

    case "SULSEL":
      polda_id = 13;
      polda_name = "Sulawesi Selatan";
      break;

    case "JATENG":
      polda_id = 23;
      polda_name = "Jawa Tengah";
      break;

    case "BALI":
      polda_id = 26;
      polda_name = "Bali";
      break;

    case "BANTEN":
      polda_id = 2;
      polda_name = "Banten";
      break;

    case "BENGKULU":
      polda_id = 17;
      polda_name = "Bengkulu";
      break;

    case "DIY":
      polda_id = 5;
      polda_name = "DIY";
      break;

    case "GORONTALO":
      polda_id = 9;
      polda_name = "Gorontalo";
      break;

    case "JAMBI":
      polda_id = 4;
      polda_name = "Jambi";
      break;

    case "KALBAR":
      polda_id = 24;
      polda_name = "Kalimantan Barat";
      break;

    case "KALSEL":
      polda_id = 12;
      polda_name = "Kalimantan Selatan";
      break;

    case "KALTARA":
      polda_id = 20;
      polda_name = "Kalimantan Utara";
      break;

    case "KALTENG":
      polda_id = 34;
      polda_name = "Kalimantan Tengah";
      break;

    case "KALTIM":
      polda_id = 19;
      polda_name = "Kalimantan Timur";
      break;

    case "KEPRI":
      polda_id = 8;
      polda_name = "Kepulauan Riau";
      break;

    case "MALUKU":
      polda_id = 14;
      polda_name = "Maluku";
      break;

    case "MALUT":
      polda_id = 7;
      polda_name = "Maluku Utara";
      break;

    case "METRO JAYA":
      polda_id = 35;
      polda_name = "Metro Jaya";
      break;

    case "NTB":
      polda_id = 31;
      polda_name = "Nusa Tenggara Barat";
      break;

    case "NTT":
      polda_id = 25;
      polda_name = "Nusa Tenggara Timur";
      break;

    case "PAPUA":
      polda_id = 28;
      polda_name = "Papua";
      break;

    case "PAPUA BARAT":
      polda_id = 22;
      polda_name = "Papua Barat";
      break;

    case "RIAU":
      polda_id = 16;
      polda_name = "Riau";
      break;

    case "SULTENG":
      polda_id = 3;
      polda_name = "Sulawesi Tengah";
      break;

    case "SULTRA":
      polda_id = 30;
      polda_name = "Sulawesi Tenggara";
      break;

    case "SULUT":
      polda_id = 32;
      polda_name = "Sulawesi Utara";
      break;

    case "SUMBAR":
      polda_id = 27;
      polda_name = "Sumatera Barat";
      break;

    case "SUMSEL":
      polda_id = 10;
      polda_name = "Sumatera Selatan";
      break;

    case "ACEH":
      polda_id = 21;
      polda_name = "Aceh";
      break;

    case "SUMUT":
      polda_id = 15;
      polda_name = "Sumatera Utara";
      break;

    case "BABEL":
      polda_id = 29;
      polda_name = "Bangka Belitung";
      break;

    default:
      break;
  }

  return { polda_id, polda_name };
};
