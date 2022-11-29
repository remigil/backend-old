const IDMonths = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const IDDays = (data) => {
  let days = "";
  let polda_name = "";
  switch (data) {
    case "Monday":
      days = "Senin";
      break;

    case "Tuesday":
      days = "Selasa";
      break;

    case "Wednesday":
      days = "Rabu";
      break;

    case "Thursday":
      days = "Kamis";
      break;

    case "Friday":
      days = "Jumat";
      break;

    case "Saturday":
      days = "Sabtu";
      break;

    case "Sunday":
      days = "Minggu";
      break;

    default:
      break;
  }

  return days;
};

module.exports = { IDMonths, IDDays };
