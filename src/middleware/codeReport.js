module.exports = (n, params = "code") => {
  let Kategori = {
    1: {
      type: "Tindakan Kriminal",
      code: "K",
    },
    2: {
      type: "Kecelakaan Lalu Lintas",
      code: "L",
    },
    // 3: {
    //   type: "Tindakan Kriminal",
    //   code: "K",
    // },
    4: {
      type: "Kemacetan",
      code: "Kemacetan",
    },
    3: {
      type: "Bencana Alam",
      code: "B",
    },
    5: {
      type: "Pengaturan",
      code: "TUR",
    },
    6: {
      type: "Pengawalan",
      code: "WAL",
    },
    999: {
      type: "Lainnya",
      code: "LN",
    },
  };

  return Kategori[n][params];
};
