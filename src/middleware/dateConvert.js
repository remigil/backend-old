module.exports = (n) => {
  let Bulan = {
    01: {
      month: "Januari",
    },
    02: {
      month: "Februari",
    },
    03: {
      month: "Maret",
    },
    04: {
      month: "April",
    },
    05: {
      month: "Mei",
    },
    06: {
      month: "Juni",
    },
    07: {
      month: "Juli",
    },
    08: {
      month: "Agustus",
    },
    09: {
      month: "September",
    },
    10: {
      month: "Oktober",
    },
    11: {
      month: "November",
    },
    12: {
      month: "Desember",
    },
  };

  return Bulan[n].month;
};
