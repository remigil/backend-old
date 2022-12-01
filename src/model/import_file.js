const Sequelize = require("sequelize");
const db = require("../config/database");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Polda = require("./polda");
const Model = Sequelize.Model;

/**
 * SECTION IMPORT LAPORAN HARIAN
 * [BEGIN]
 */

/**
 * Class ImportFile
 */
class ImportFile extends Model {}
ImportFile.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    jenis_satker: {
      type: Sequelize.INTEGER,
    },
    jenis_laporan: {
      type: Sequelize.INTEGER,
    },
    tanggal: {
      type: Sequelize.DATEONLY,
    },
    file_name: {
      type: Sequelize.STRING,
    },
    file_client_name: {
      type: Sequelize.STRING,
    },
    file_ext: {
      type: Sequelize.STRING,
    },
    file_type: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.INTEGER,
    },
    imported_by: {
      type: Sequelize.STRING,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "import_laporan_harian",
    modelName: "import_file",
    sequelize: db,
  }
);
(async () => {
  ImportFile.sync({ alter: false });
})();

/**
 * Class Dakgarlantas
 */
class Dakgarlantas extends Model {}
Dakgarlantas.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    // polres_id: {
    //   type: Sequelize.INTEGER,
    // },
    date: {
      type: Sequelize.DATEONLY,
    },
    capture_camera: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    statis: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    mobile: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    online: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    posko: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    preemtif: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    preventif: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    odol_227: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    odol_307: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "count_lakalanggar_polda_day",
    modelName: "count_lakalanggar_polda_day",
    sequelize: db,
  }
);
(async () => {
  Dakgarlantas.sync({ alter: false });
})();

/**
 * Class Polres
 */
class Polres extends Model {}
Polres.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    code_satpas: {
      type: Sequelize.STRING(5),
    },
    name_polres: {
      type: Sequelize.STRING(200),
    },
    address: {
      type: Sequelize.TEXT,
    },
    logo_polres: {
      type: Sequelize.TEXT,
    },
    phone_polres: {
      type: Sequelize.STRING(50),
    },
    image: {
      type: Sequelize.STRING(200),
    },
    hotline: {
      type: Sequelize.STRING(20),
    },
    latitude: {
      type: Sequelize.TEXT,
    },
    longitude: {
      type: Sequelize.TEXT,
    },

    open_time: {
      type: Sequelize.TIME,
    },
    close_time: {
      type: Sequelize.TIME,
    },

    ...StructureTimestamp,
  },
  {
    indexes: [{ fields: ["polda_id"] }],
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "polres",
    modelName: "polres",
    sequelize: db,
  }
);

Polres.hasOne(Polda, {
  foreignKey: "id",
  sourceKey: "polda_id",
});
(async () => {
  Polres.sync({ alter: false });
})();

/**
 * Class Konvensional
 */
class Konvensional extends Model {}
Konvensional.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    //  polres_id: {
    //    type: Sequelize.INTEGER,
    //  },
    date: {
      type: Sequelize.DATEONLY,
    },
    pelanggaran_berat: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    pelanggaran_sedang: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    pelanggaran_ringan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    teguran: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "count_garlantas_polda_day",
    modelName: "count_garlantas_polda_day",
    sequelize: db,
  }
);
(async () => {
  Konvensional.sync({ alter: false });
})();

/**
 * Class Lalu Lintas
 */
class Lalulintas extends Model {}
Lalulintas.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    // polres_id: {
    //   type: Sequelize.INTEGER,
    // },
    date: {
      type: Sequelize.DATEONLY,
    },
    meninggal_dunia: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    luka_berat: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    luka_ringan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    kerugian_material: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    insiden_kecelakaan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    total_korban: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "count_lakalantas_polda_day",
    modelName: "count_lakalantas_polda_day",
    sequelize: db,
  }
);
(async () => {
  Lalulintas.sync({ alter: false });
})();

/**
 * Class Turjagwali
 */
class Turjagwali extends Model {}
Turjagwali.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    // polres_id: {
    //   type: Sequelize.INTEGER,
    // },
    date: {
      type: Sequelize.DATEONLY,
    },
    pengaturan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    penjagaan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    pengawalan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    patroli: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "count_turjagwali_polda_day",
    modelName: "count_turjagwali_polda_day",
    sequelize: db,
  }
);

(async () => {
  Turjagwali.sync({ alter: false });
})();

/**
 * Dikmaslantas
 */
class Dikmaslantas extends Model {}
Dikmaslantas.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    //  polres_id: {
    //    type: Sequelize.INTEGER,
    //  },
    date: {
      type: Sequelize.DATEONLY,
    },
    media_cetak: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    media_elektronik: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    media_sosial: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    laka_langgar: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "count_dikmaslantas_polda_day",
    modelName: "count_dikmaslantas_polda_day",
    sequelize: db,
  }
);
(async () => {
  Dikmaslantas.sync({ alter: false });
})();

/**
 * Class Penyebaran
 */
class Penyebaran extends Model {}
Penyebaran.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    // polres_id: {
    //   type: Sequelize.INTEGER,
    // },
    date: {
      type: Sequelize.DATEONLY,
    },
    spanduk: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    leaflet: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    stiker: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    billboard: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    jemensosprek: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "count_penyebaran_polda_day",
    modelName: "count_penyebaran_polda_day",
    sequelize: db,
  }
);

(async () => {
  Penyebaran.sync({ alter: false });
})();

/**
 * Class SIM
 */
class Sim extends Model {}
Sim.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    // polres_id: {
    //   type: Sequelize.INTEGER,
    // },
    date: {
      type: Sequelize.DATEONLY,
    },
    baru: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "count_sim_polda_day",
    modelName: "count_sim_polda_day",
    sequelize: db,
  }
);

(async () => {
  Sim.sync({ alter: false });
})();

/**
 * Class BPKB
 */
class Bpkb extends Model {}
Bpkb.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    //  polres_id: {
    //    type: Sequelize.INTEGER,
    //  },
    date: {
      type: Sequelize.DATEONLY,
    },
    baru: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    rubentina: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "count_bpkb_polda_day",
    modelName: "count_bpkb_polda_day",
    sequelize: db,
  }
);

(async () => {
  Bpkb.sync({ alter: false });
})();

/**
 * Class Ranmor
 */
class Ranmor extends Model {}
Ranmor.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    // polres_id: {
    //   type: Sequelize.INTEGER,
    // },
    date: {
      type: Sequelize.DATEONLY,
    },
    mobil_penumpang: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    mobil_barang: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    mobil_bus: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ransus: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    sepeda_motor: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "count_ranmor_polda_day",
    modelName: "count_ranmor_polda_day",
    sequelize: db,
  }
);

(async () => {
  Ranmor.sync({ alter: false });
})();

/**
 * Class STNK
 */
class Stnk extends Model {}
Stnk.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    // polres_id: {
    //   type: Sequelize.INTEGER,
    // },
    date: {
      type: Sequelize.DATEONLY,
    },
    baru: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    perpanjangan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    rubentina: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "count_stnk_polda_day",
    modelName: "count_stnk_polda_day",
    sequelize: db,
  }
);

(async () => {
  Stnk.sync({ alter: false });
})();

/**
 * Class Polda
 */
class Poldaa extends Model {}
Poldaa.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    code_satpas: {
      type: Sequelize.STRING(5),
    },
    name_polda: {
      type: Sequelize.STRING(255),
    },
    address: {
      type: Sequelize.TEXT,
    },
    logo_polda: {
      type: Sequelize.TEXT,
    },
    phone_polda: {
      type: Sequelize.STRING(50),
    },
    image: {
      type: Sequelize.STRING(200),
    },
    hotline: {
      type: Sequelize.STRING(20),
    },
    website: {
      type: Sequelize.TEXT,
    },
    latitude: {
      type: Sequelize.TEXT,
    },
    longitude: {
      type: Sequelize.TEXT,
    },
    zoomview: {
      type: Sequelize.TEXT,
    },
    open_time: {
      type: Sequelize.TIME,
    },
    file_shp: {
      type: Sequelize.TEXT,
    },
    close_time: {
      type: Sequelize.TIME,
    },

    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "polda",
    modelName: "polda",
    sequelize: db,
  }
);
(async () => {
  Poldaa.sync({ alter: false });
})();

/**
 * [END]
 * SECTION IMPORT LAPORAN HARIAN
 */

/**
 * ===============================================================================================================================
 */

/**
 * SECTION IMPORT LAPORAN OPERASI KHUSUS
 * [BEGIN]
 */

/**
 * Class ImportFileOps
 */
class ImportFileOps extends Model {}
ImportFileOps.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    jenis_satker: {
      type: Sequelize.INTEGER,
    },
    jenis_laporan: {
      type: Sequelize.INTEGER,
    },
    tanggal: {
      type: Sequelize.DATEONLY,
    },
    file_name: {
      type: Sequelize.STRING,
    },
    file_client_name: {
      type: Sequelize.STRING,
    },
    file_ext: {
      type: Sequelize.STRING,
    },
    file_type: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.INTEGER,
    },
    imported_by: {
      type: Sequelize.STRING,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "import_laporan_operasi",
    modelName: "import_file",
    sequelize: db,
  }
);
(async () => {
  ImportFileOps.sync({ alter: false });
})();

/**
 * Class Langgarlantas
 */
class Langgarlantas extends Model {}
Langgarlantas.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    statis: {
      type: Sequelize.INTEGER,
    },
    mobile: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_berat: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_sedang: {
      type: Sequelize.INTEGER,
    },
    pelanggaran_ringan: {
      type: Sequelize.INTEGER,
    },
    teguran: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lg_langgarlantas",
    modelName: "operasi_lg_langgarlantas",
    sequelize: db,
  }
);

(async () => {
  Langgarlantas.sync({ alter: false });
})();

/**
 * Class Langgarmotor
 */
class Langgarmotor extends Model {}
Langgarmotor.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    tanpa_helm: {
      type: Sequelize.INTEGER,
    },
    lawan_arus: {
      type: Sequelize.INTEGER,
    },
    bermain_hp: {
      type: Sequelize.INTEGER,
    },
    pengaruh_alkohol: {
      type: Sequelize.INTEGER,
    },
    max_kecepatan: {
      type: Sequelize.INTEGER,
    },
    dibawah_umur: {
      type: Sequelize.INTEGER,
    },
    lain_lain: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lg_langgar_motor",
    modelName: "operasi_lg_langgar_motor",
    sequelize: db,
  }
);

(async () => {
  Langgarmotor.sync({ alter: false });
})();

/**
 * Class Langgarmobil
 */
class Langgarmobil extends Model {}
Langgarmobil.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    tanpa_sabuk: {
      type: Sequelize.INTEGER,
    },
    lawan_arus: {
      type: Sequelize.INTEGER,
    },
    bermain_hp: {
      type: Sequelize.INTEGER,
    },
    pengaruh_alkohol: {
      type: Sequelize.INTEGER,
    },
    max_kecepatan: {
      type: Sequelize.INTEGER,
    },
    dibawah_umur: {
      type: Sequelize.INTEGER,
    },
    lain_lain: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lg_langgar_mobil",
    modelName: "operasi_lg_langgar_mobil",
    sequelize: db,
  }
);

(async () => {
  Langgarmobil.sync({ alter: false });
})();

/**
 * Class Barangbukti
 */
class Barangbukti extends Model {}
Barangbukti.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    sim: {
      type: Sequelize.INTEGER,
    },
    stnk: {
      type: Sequelize.INTEGER,
    },
    kendaraan_bermotor: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lg_bukti",
    modelName: "operasi_lg_bukti",
    sequelize: db,
  }
);

(async () => {
  Barangbukti.sync({ alter: false });
})();

/**
 * Class Kendaraanterlibat
 */
class Kendaraanterlibat extends Model {}
Kendaraanterlibat.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    sepeda_motor: {
      type: Sequelize.INTEGER,
    },
    mobil_penumpang: {
      type: Sequelize.INTEGER,
    },
    bus: {
      type: Sequelize.INTEGER,
    },
    mobil_barang: {
      type: Sequelize.INTEGER,
    },
    ransus: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lg_kendaraan",
    modelName: "operasi_lg_kendaraan",
    sequelize: db,
  }
);

(async () => {
  Kendaraanterlibat.sync({ alter: false });
})();

/**
 * Class Profesipelaku
 */
class Profesipelaku extends Model {}
Profesipelaku.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    pns: {
      type: Sequelize.INTEGER,
    },
    karyawan: {
      type: Sequelize.INTEGER,
    },
    mahasiswa_pelajar: {
      type: Sequelize.INTEGER,
    },
    pengemudi: {
      type: Sequelize.INTEGER,
    },
    tni: {
      type: Sequelize.INTEGER,
    },
    polri: {
      type: Sequelize.INTEGER,
    },
    lain_lain: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lg_profesi",
    modelName: "operasi_lg_profesi",
    sequelize: db,
  }
);

(async () => {
  Profesipelaku.sync({ alter: false });
})();

/**
 * Class Usia
 */
class Usia extends Model {}
Usia.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    max_15: {
      type: Sequelize.INTEGER,
    },
    max_20: {
      type: Sequelize.INTEGER,
    },
    max_25: {
      type: Sequelize.INTEGER,
    },
    max_30: {
      type: Sequelize.INTEGER,
    },
    max_35: {
      type: Sequelize.INTEGER,
    },
    max_40: {
      type: Sequelize.INTEGER,
    },
    max_45: {
      type: Sequelize.INTEGER,
    },
    max_50: {
      type: Sequelize.INTEGER,
    },
    max_55: {
      type: Sequelize.INTEGER,
    },
    max_55: {
      type: Sequelize.INTEGER,
    },
    max_60: {
      type: Sequelize.INTEGER,
    },
    lain_lain: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lg_usia",
    modelName: "operasi_lg_usia",
    sequelize: db,
  }
);

(async () => {
  Usia.sync({ alter: false });
})();

/**
 * Class Simpelaku
 */
class Simpelaku extends Model {}
Simpelaku.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    sim_a: {
      type: Sequelize.INTEGER,
    },
    sim_a_umum: {
      type: Sequelize.INTEGER,
    },
    sim_b: {
      type: Sequelize.INTEGER,
    },
    sim_b_satu_umum: {
      type: Sequelize.INTEGER,
    },
    sim_b_dua_umum: {
      type: Sequelize.INTEGER,
    },
    sim_c: {
      type: Sequelize.INTEGER,
    },
    sim_d: {
      type: Sequelize.INTEGER,
    },
    sim_internasional: {
      type: Sequelize.INTEGER,
    },
    tanpa_sim: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lg_sim",
    modelName: "operasi_lg_sim",
    sequelize: db,
  }
);

(async () => {
  Simpelaku.sync({ alter: false });
})();

/**
 * Class Lokasikawasan
 */
class Lokasikawasan extends Model {}
Lokasikawasan.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    pemukiman: {
      type: Sequelize.INTEGER,
    },
    perbelanjaan: {
      type: Sequelize.INTEGER,
    },
    perkantoran: {
      type: Sequelize.INTEGER,
    },
    wisata: {
      type: Sequelize.INTEGER,
    },
    industri: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lg_lokasi_kawasan",
    modelName: "operasi_lg_lokasi_kawasan",
    sequelize: db,
  }
);

(async () => {
  Lokasikawasan.sync({ alter: false });
})();

/**
 * Class Statusjalan
 */
class Statusjalan extends Model {}
Statusjalan.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    nasional: {
      type: Sequelize.INTEGER,
    },
    provinsi: {
      type: Sequelize.INTEGER,
    },
    kab_kota: {
      type: Sequelize.INTEGER,
    },
    desa_lingkungan: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lg_lokasi_jalan",
    modelName: "operasi_lg_lokasi_jalan",
    sequelize: db,
  }
);

(async () => {
  Statusjalan.sync({ alter: false });
})();

/**
 * Class Dikmaslantasops
 */
class Dikmaslantasops extends Model {}
Dikmaslantasops.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    media_cetak: {
      type: Sequelize.INTEGER,
    },
    media_elektronik: {
      type: Sequelize.INTEGER,
    },
    media_sosial: {
      type: Sequelize.INTEGER,
    },
    laka_langgar: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lg_dikmaslantas",
    modelName: "operasi_lg_dikmaslantas",
    sequelize: db,
  }
);

(async () => {
  Dikmaslantasops.sync({ alter: false });
})();

/**
 * Class Giatlantas
 */
class Giatlantas extends Model {}
Giatlantas.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    pengaturan: {
      type: Sequelize.INTEGER,
    },
    penjagaan: {
      type: Sequelize.INTEGER,
    },
    pengawalan: {
      type: Sequelize.INTEGER,
    },
    patroli: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lg_giatlantas",
    modelName: "operasi_lg_giatlantas",
    sequelize: db,
  }
);

(async () => {
  Giatlantas.sync({ alter: false });
})();

/**
 * Class Lakalantas
 */
class Lakalantas extends Model {}
Lakalantas.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    meninggal_dunia: {
      type: Sequelize.INTEGER,
    },
    luka_berat: {
      type: Sequelize.INTEGER,
    },
    luka_ringan: {
      type: Sequelize.INTEGER,
    },
    kerugian_material: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lk_lakalantas",
    modelName: "operasi_lk_lakalantas",
    sequelize: db,
  }
);

(async () => {
  Lakalantas.sync({ alter: false });
})();

/**
 * Class Fungsijalan
 */
class Fungsijalan extends Model {}
Fungsijalan.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    arteri: {
      type: Sequelize.INTEGER,
    },
    kolektor: {
      type: Sequelize.INTEGER,
    },
    lokal: {
      type: Sequelize.INTEGER,
    },
    lingkungan: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lg_fungsi_jalan",
    modelName: "operasi_lg_fungsi_jalan",
    sequelize: db,
  }
);

(async () => {
  Fungsijalan.sync({ alter: false });
})();

/**
 * Class Pekerjaankorban
 */
class Pekerjaankorban extends Model {}
Pekerjaankorban.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    pns: {
      type: Sequelize.INTEGER,
    },
    karyawan: {
      type: Sequelize.INTEGER,
    },
    mahasiswa: {
      type: Sequelize.INTEGER,
    },
    pengemudi: {
      type: Sequelize.INTEGER,
    },
    tni: {
      type: Sequelize.INTEGER,
    },
    polri: {
      type: Sequelize.INTEGER,
    },
    lain_lain: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lk_pekerjaan_korban",
    modelName: "operasi_lk_pekerjaan_korban",
    sequelize: db,
  }
);

(async () => {
  Pekerjaankorban.sync({ alter: false });
})();

/**
 * Class Pekerjaanpelaku
 */
class Pekerjaanpelaku extends Model {}
Pekerjaanpelaku.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    pns: {
      type: Sequelize.INTEGER,
    },
    karyawan: {
      type: Sequelize.INTEGER,
    },
    mahasiswa: {
      type: Sequelize.INTEGER,
    },
    pengemudi: {
      type: Sequelize.INTEGER,
    },
    tni: {
      type: Sequelize.INTEGER,
    },
    polri: {
      type: Sequelize.INTEGER,
    },
    lain_lain: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lk_pekerjaan_pelaku",
    modelName: "operasi_lk_pekerjaan_pelaku",
    sequelize: db,
  }
);

(async () => {
  Pekerjaanpelaku.sync({ alter: false });
})();

/**
 * Class Pendidikankorban
 */
class Pendidikankorban extends Model {}
Pendidikankorban.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    sd: {
      type: Sequelize.INTEGER,
    },
    sltp: {
      type: Sequelize.INTEGER,
    },
    slta: {
      type: Sequelize.INTEGER,
    },
    d3: {
      type: Sequelize.INTEGER,
    },
    s1: {
      type: Sequelize.INTEGER,
    },
    s2: {
      type: Sequelize.INTEGER,
    },
    tidak_diketahui: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lk_pendidikan_korban",
    modelName: "operasi_lk_pendidikan_korban",
    sequelize: db,
  }
);

(async () => {
  Pendidikankorban.sync({ alter: false });
})();

/**
 * CLass Penyebaranops
 */
class Penyebaranops extends Model {}
Penyebaranops.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    stiker: {
      type: Sequelize.INTEGER,
    },
    billboard: {
      type: Sequelize.INTEGER,
    },
    leaflet: {
      type: Sequelize.INTEGER,
    },
    spanduk: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lg_penyebaran",
    modelName: "operasi_lg_penyebaran",
    sequelize: db,
  }
);

(async () => {
  Penyebaranops.sync({ alter: false });
})();

/**
 * Class Ranmorops
 */
class Ranmorops extends Model {}
Ranmorops.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    sepeda_motor: {
      type: Sequelize.INTEGER,
    },
    mobil_penumpang: {
      type: Sequelize.INTEGER,
    },
    bus: {
      type: Sequelize.INTEGER,
    },
    mobil_barang: {
      type: Sequelize.INTEGER,
    },
    ransus: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lk_ranmor",
    modelName: "operasi_lk_ranmor",
    sequelize: db,
  }
);

(async () => {
  Ranmorops.sync({ alter: false });
})();

/**
 * Class Usiakorban
 */
class Usiakorban extends Model {}
Usiakorban.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    max_4: {
      type: Sequelize.INTEGER,
    },
    max_9: {
      type: Sequelize.INTEGER,
    },
    max_14: {
      type: Sequelize.INTEGER,
    },
    max_19: {
      type: Sequelize.INTEGER,
    },
    max_24: {
      type: Sequelize.INTEGER,
    },
    max_34: {
      type: Sequelize.INTEGER,
    },
    max_39: {
      type: Sequelize.INTEGER,
    },
    max_44: {
      type: Sequelize.INTEGER,
    },
    max_49: {
      type: Sequelize.INTEGER,
    },
    max_54: {
      type: Sequelize.INTEGER,
    },
    max_49: {
      type: Sequelize.INTEGER,
    },
    max_54: {
      type: Sequelize.INTEGER,
    },
    max_59: {
      type: Sequelize.INTEGER,
    },
    lain_lain: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lk_usia_korban",
    modelName: "operasi_lk_usia_korban",
    sequelize: db,
  }
);

(async () => {
  Usiakorban.sync({ alter: false });
})();

/**
 * Class Usiapelaku
 */
class Usiapelaku extends Model {}
Usiapelaku.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    max_14: {
      type: Sequelize.INTEGER,
    },
    max_16: {
      type: Sequelize.INTEGER,
    },
    max_21: {
      type: Sequelize.INTEGER,
    },
    max_29: {
      type: Sequelize.INTEGER,
    },
    max_39: {
      type: Sequelize.INTEGER,
    },
    max_49: {
      type: Sequelize.INTEGER,
    },
    max_59: {
      type: Sequelize.INTEGER,
    },
    lain_lain: {
      type: Sequelize.INTEGER,
    },
    tidak_diketahui: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_lk_usia_pelaku",
    modelName: "operasi_lk_usia_pelaku",
    sequelize: db,
  }
);

(async () => {
  Usiapelaku.sync({ alter: false });
})();

/**
 * Class Turjagwaliops
 */
class Turjagwaliops extends Model {}
Turjagwaliops.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    operasi_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    pengaturan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    penjagaan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    pengawalan: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    patroli: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "operasi_turjagwali",
    modelName: "operasi_turjagwali",
    sequelize: db,
  }
);

(async () => {
  Turjagwaliops.sync({ alter: false });
})();
/**
 * [END]
 * SECTION IMPORT LAPORAN OPERASI KHUSUS
 */

/**
 * SECTION IMPORT LAPORAN NTMC
 * [BEGIN]
 */

/**
 * Class ImportFile
 */
class ImportFileNtmc extends Model {}
ImportFileNtmc.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    jenis_satker: {
      type: Sequelize.INTEGER,
    },
    jenis_laporan: {
      type: Sequelize.INTEGER,
    },
    tanggal: {
      type: Sequelize.DATEONLY,
    },
    file_name: {
      type: Sequelize.STRING,
    },
    file_client_name: {
      type: Sequelize.STRING,
    },
    file_ext: {
      type: Sequelize.STRING,
    },
    file_type: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.INTEGER,
    },
    imported_by: {
      type: Sequelize.STRING,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "import_laporan_ntmc",
    modelName: "import_file",
    sequelize: db,
  }
);
(async () => {
  ImportFileNtmc.sync({ alter: false });
})();

/**
 * Class Programtv
 */
class Programtv extends Model {}
Programtv.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    program: {
      type: Sequelize.INTEGER,
    },
    live_report: {
      type: Sequelize.INTEGER,
    },
    live_program: {
      type: Sequelize.INTEGER,
    },
    tapping: {
      type: Sequelize.INTEGER,
    },
    vlog_cctv: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "ntmc_onair_mediatv",
    modelName: "ntmc_onair_mediatv",
    sequelize: db,
  }
);

(async () => {
  Programtv.sync({ alter: false });
})();

/**
 * Class Programonline
 */
class Programonline extends Model {}
Programonline.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    web_ntmc: {
      type: Sequelize.INTEGER,
    },
    web_korlantas: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "ntmc_onair_mediaonline",
    modelName: "ntmc_onair_mediaonline",
    sequelize: db,
  }
);

(async () => {
  Programonline.sync({ alter: false });
})();

/**
 * Class Programmedsos
 */
class Programmedsos extends Model {}
Programmedsos.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    facebook: {
      type: Sequelize.INTEGER,
    },
    instagram: {
      type: Sequelize.INTEGER,
    },
    twitter: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "ntmc_onair_mediasosial",
    modelName: "ntmc_onair_mediasosial",
    sequelize: db,
  }
);

(async () => {
  Programmedsos.sync({ alter: false });
})();

/**
 * Class Offairprogram
 */
class Offairprogram extends Model {}
Offairprogram.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    sosialisasi: {
      type: Sequelize.INTEGER,
    },
    timtam: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "ntmc_offair_program",
    modelName: "ntmc_offair_program",
    sequelize: db,
  }
);

(async () => {
  Offairprogram.sync({ alter: false });
})();

/**
 * Class Mediatv
 */
class Mediatv extends Model {}
Mediatv.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    media_tv: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "ntmc_dok_mediatv",
    modelName: "ntmc_dok_mediatv",
    sequelize: db,
  }
);

(async () => {
  Mediatv.sync({ alter: false });
})();

/**
 * Class Medsos
 */
class Medsos extends Model {}
Medsos.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    positif_korlantas: {
      type: Sequelize.INTEGER,
    },
    negatif_korlantas: {
      type: Sequelize.INTEGER,
    },
    lakalantas: {
      type: Sequelize.INTEGER,
    },
    positif_polri: {
      type: Sequelize.INTEGER,
    },
    negatif_polri: {
      type: Sequelize.INTEGER,
    },
    liputan: {
      type: Sequelize.INTEGER,
    },
    kategori: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "ntmc_dok_medsos",
    modelName: "ntmc_dok_medsos",
    sequelize: db,
  }
);

(async () => {
  Medsos.sync({ alter: false });
})();

/**
 * Class Sosial
 */
class Sosial extends Model {}
Sosial.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    facebook: {
      type: Sequelize.INTEGER,
    },
    twitter: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "ntmc_aktivitas_medsos",
    modelName: "ntmc_aktivitas_medsos",
    sequelize: db,
  }
);

(async () => {
  Sosial.sync({ alter: false });
})();

/**
 * Class Radio
 */
class Radio extends Model {}
Radio.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    gen_fm: {
      type: Sequelize.INTEGER,
    },
    jak_fm: {
      type: Sequelize.INTEGER,
    },
    most_fm: {
      type: Sequelize.INTEGER,
    },
    kiss_fm: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "ntmc_aktivitas_radio",
    modelName: "ntmc_aktivitas_radio",
    sequelize: db,
  }
);

(async () => {
  Radio.sync({ alter: false });
})();

/**
 * Class Pengaduan
 */
class Pengaduan extends Model {}
Pengaduan.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    radio_pjr: {
      type: Sequelize.INTEGER,
    },
    sms_9119: {
      type: Sequelize.INTEGER,
    },
    wa_center: {
      type: Sequelize.INTEGER,
    },
    call_center: {
      type: Sequelize.INTEGER,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "ntmc_aktivitas_pengaduan",
    modelName: "ntmc_aktivitas_pengaduan",
    sequelize: db,
  }
);

(async () => {
  Pengaduan.sync({ alter: false });
})();
/**
 * [END]
 * SECTION IMPORT LAPORAN NTMC
 */

/**
 * SECTION IMPORT LAPORAN MASYARAKAT
 * [BEGIN]
 */

/**
 * Class ImportFileMasyarakat
 */
class ImportFileMasyarakat extends Model {}
ImportFileMasyarakat.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    jenis_satker: {
      type: Sequelize.INTEGER,
    },
    jenis_laporan: {
      type: Sequelize.INTEGER,
    },
    tanggal: {
      type: Sequelize.DATEONLY,
    },
    file_name: {
      type: Sequelize.STRING,
    },
    file_client_name: {
      type: Sequelize.STRING,
    },
    file_ext: {
      type: Sequelize.STRING,
    },
    file_type: {
      type: Sequelize.STRING,
    },
    status: {
      type: Sequelize.INTEGER,
    },
    imported_by: {
      type: Sequelize.STRING,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "import_laporan_masyarakat",
    modelName: "import_file",
    sequelize: db,
  }
);
(async () => {
  ImportFileMasyarakat.sync({ alter: false });
})();

/**
 * Class Kegiatanmasyarakat
 */
class Kegiatanmasyarakat extends Model {}
Kegiatanmasyarakat.init(
  {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      get() {
        return AESEncrypt(String(this.getDataValue("id")), {
          isSafeUrl: true,
        });
      },
    },
    polda_id: {
      type: Sequelize.INTEGER,
    },
    polres_id: {
      type: Sequelize.INTEGER,
    },
    date: {
      type: Sequelize.DATEONLY,
    },
    tegur_prokes: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    masker: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    sosial_prokes: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    baksos: {
      type: Sequelize.INTEGER,
      defaultValue: 0,
    },
    ...StructureTimestamp,
  },
  {
    defaultScope: {
      where: {
        deleted_at: null,
      },
    },
    scopes: {
      deleted: {
        where: {
          deleted_at: null,
        },
      },
    },
    deletedAt: "deleted_at",
    createdAt: "created_at",
    updatedAt: "updated_at",
    tableName: "input_laporan_masyarakat",
    modelName: "input_laporan_masyarakat",
    sequelize: db,
  }
);

(async () => {
  Kegiatanmasyarakat.sync({ alter: false });
})();
/**
 * [END]
 * SECTION IMPORT LAPORAN MASYARAKAT
 */

module.exports = {
  ImportFile: ImportFile,
  Polres: Polres,
  Dakgarlantas: Dakgarlantas,
  Konvensional: Konvensional,
  Lalulintas: Lalulintas,
  Turjagwali: Turjagwali,
  Dikmaslantas: Dikmaslantas,
  Penyebaran: Penyebaran,
  Sim: Sim,
  Bpkb: Bpkb,
  Ranmor: Ranmor,
  Stnk: Stnk,
  Poldaa: Poldaa,
  ImportFileOps: ImportFileOps,
  Langgarlantas: Langgarlantas,
  Langgarmotor: Langgarmotor,
  Langgarmobil: Langgarmobil,
  Barangbukti: Barangbukti,
  Kendaraanterlibat: Kendaraanterlibat,
  Profesipelaku: Profesipelaku,
  Usia: Usia,
  Simpelaku: Simpelaku,
  Lokasikawasan: Lokasikawasan,
  Statusjalan: Statusjalan,
  Dikmaslantasops: Dikmaslantasops,
  Giatlantas: Giatlantas,
  Lakalantas: Lakalantas,
  Fungsijalan: Fungsijalan,
  Pekerjaankorban: Pekerjaankorban,
  Pekerjaanpelaku: Pekerjaanpelaku,
  Pendidikankorban: Pendidikankorban,
  Penyebaranops: Penyebaranops,
  Ranmorops: Ranmorops,
  Usiakorban: Usiakorban,
  Usiapelaku: Usiapelaku,
  Turjagwaliops: Turjagwaliops,
  ImportFileNtmc: ImportFileNtmc,
  Programtv: Programtv,
  Programonline: Programonline,
  Programmedsos: Programmedsos,
  Offairprogram: Offairprogram,
  Mediatv: Mediatv,
  Medsos: Medsos,
  Sosial: Sosial,
  Radio: Radio,
  Pengaduan: Pengaduan,
  ImportFileMasyarakat: ImportFileMasyarakat,
  Kegiatanmasyarakat: Kegiatanmasyarakat
}


