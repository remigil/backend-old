const Sequelize = require("sequelize");
const db = require("../config/database");
const { StructureTimestamp } = require("../constanta/db_structure");
const { AESEncrypt } = require("../lib/encryption");
const Polda = require("./polda");
const Model = Sequelize.Model;

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
  ImportFile.sync({ alter: true });
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
    polres_id: {
      type: Sequelize.INTEGER,
    },
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
    tableName: "input_laka_langgar",
    modelName: "input_laka_langgar",
    sequelize: db,
  }
);
(async () => {
  Dakgarlantas.sync({ alter: true });
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
  Polres.sync({ alter: true });
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
     polres_id: {
       type: Sequelize.INTEGER,
     },
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
     tableName: "input_garlantas",
     modelName: "input_garlantas",
     sequelize: db,
   }
 );
 (async () => {
  Konvensional.sync({ alter: true });
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
    polres_id: {
      type: Sequelize.INTEGER,
    },
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
    tableName: "input_laka_lantas",
    modelName: "input_laka_lantas",
    sequelize: db,
  }
);
(async () => {
  Lalulintas.sync({ alter: true });
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
    polres_id: {
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
    tableName: "input_turjagwali",
    modelName: "input_turjagwali",
    sequelize: db,
  }
);

(async () => {
  Turjagwali.sync({ alter: true });
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
     polres_id: {
       type: Sequelize.INTEGER,
     },
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
     tableName: "input_dikmaslantas",
     modelName: "input_dikmaslantas",
     sequelize: db,
   }
 );
 (async () => {
    Dikmaslantas.sync({ alter: true });
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
    polres_id: {
      type: Sequelize.INTEGER,
    },
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
    tableName: "input_penyebaran",
    modelName: "input_penyebaran",
    sequelize: db,
  }
);

(async () => {
  Penyebaran.sync({ alter: true });
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
    polres_id: {
      type: Sequelize.INTEGER,
    },
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
    tableName: "input_sim",
    modelName: "input_sim",
    sequelize: db,
  }
);

(async () => {
  Sim.sync({ alter: true });
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
     polres_id: {
       type: Sequelize.INTEGER,
     },
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
     tableName: "input_bpkb",
     modelName: "input_bpkb",
     sequelize: db,
   }
 );
 
 (async () => {
   Bpkb.sync({ alter: true });
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
    polres_id: {
      type: Sequelize.INTEGER,
    },
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
    tableName: "input_ranmor",
    modelName: "input_ranmor",
    sequelize: db,
  }
);

(async () => {
  Ranmor.sync({ alter: true });
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
    polres_id: {
      type: Sequelize.INTEGER,
    },
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
    tableName: "input_stnk",
    modelName: "input_stnk",
    sequelize: db,
  }
);

(async () => {
  Stnk.sync({ alter: true });
})();

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
  Stnk: Stnk
}


