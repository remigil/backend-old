module.exports = (n) => {
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
    999: {
      type: "Lainnya",
      code: "LN",
    },
  };

  return Kategori[n].code;
};
