module.exports = (n) => {
  let Kategori = {
    1: {
      type: "Tindakan Kriminal",
      code: "K",
    },
    2: {
      type: "Kecelakaan",
      code: "L",
    },
    3: {
      type: "Tindakan Kriminal",
      code: "K",
    },
    4: {
      type: "Kemacetan",
      code: "Kemacetan",
    },
    5: {
      type: "Bencana Alam",
      code: "B",
    },
  };

  return Kategori[n].code;
};
