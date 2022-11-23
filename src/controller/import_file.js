const db = require("../config/database");
const response = require("../lib/response");
const {ImportFile, Dakgarlantas, Polres, Konvensional, Lalulintas, Turjagwali, Dikmaslantas, Penyebaran, Sim, Bpkb, Ranmor, Stnk} = require("../model/import_file");
const { Op, Sequelize } = require("sequelize");
const { AESDecrypt } = require("../lib/encryption");
const Validator = require('fastest-validator')
const check = new Validator()

/**
 * Function 
 * Decrypt ID
 */
const decAes = (param) =>
AESDecrypt(param, {
    isSafeUrl: true,
    parseMode: "string",
});

/**
 * Class Import
 * For process data daily report
 */

module.exports = class ImportFileController {

    /**
     * Function process import file
     */
    static file = async (req, res) => {
        const transaction = await db.transaction();
        try {

            /**
             * Validate parameter
             */
            
            const schema = {
                polda_id: { type: 'string'},
                jenis_satker: { type: 'string'},
                jenis_laporan: { type: 'string'},
                tanggal: { type: 'string'},
                file_name: { type: 'string'},
                file_client_name: { type: 'string'},
                file_ext: { type: 'string'},
                file_type: { type: 'string'},
                status: { type: 'string'},
                imported_by: { type: 'string'}
            }
            const valid = check.validate(req.body, schema)

            if (valid === true) {

                /**
                 * Parameter
                 */
                const polda_id = req.body.polda_id
                const jenis_satker = req.body.jenis_satker
                const jenis_laporan = req.body.jenis_laporan
                const tanggal = req.body.tanggal
                const file_name = req.body.file_name
                const file_client_name = req.body.file_client_name
                const file_ext = req.body.file_ext
                const file_type = req.body.file_type
                const status = req.body.status
                const imported_by = req.body.imported_by

                /**
                 * Data Payload
                 */
                const Data = {
                    polda_id: decAes(polda_id),
                    jenis_satker: jenis_satker,
                    jenis_laporan: jenis_laporan,
                    tanggal: tanggal,
                    file_name: file_name,
                    file_client_name: file_client_name,
                    file_ext: file_ext,
                    file_type: file_type,
                    status: status,
                    imported_by: decAes(imported_by)
                }

                /**
                 * Transaction process
                 */
                await ImportFile.create(Data, {transaction: transaction});
                await transaction.commit();
                response(res, true, "Success", "Success");
            }else{
                /**
                 * Validate Error
                 */
                response(res, false, "Failed", "You have some error please check parameter");
            }

        } catch (error) {
            
            /**
             * Rollback if error
             */
            await transaction.rollback();
            response(res, false, "Failed", error.message);
        
        }
    };

    static rmfile = async (req, res) => {
        const transaction = await db.transaction();
        try {

            /**
             * Validate parameter
             */
            
            const schema = {
                id: { type: 'string'}
            }
            const valid = check.validate(req.body, schema)

            if (valid === true) {

                /**
                 * Parameter
                 */
                const id = decAes(req.body.id)

                /**
                 * Transaction process
                 */
                await ImportFile.destroy({where: {id: id}, transaction: transaction});
                await transaction.commit();
                response(res, true, "Success", "Success");
            }else{
                /**
                 * Validate Error
                 */
                response(res, false, "Failed", "You have some error please check parameter");
            }

        } catch (error) {
            
            /**
             * Rollback if error
             */
            await transaction.rollback();
            response(res, false, "Failed", error.message);
        
        }
    };

    /**
     * Function list of data import
     */
    static list = async (req, res) => {
        try {

            const {
                length = 10,
                start = 0,
                serverSide = null,
                search = null,
                filter = [],
                filterSearch = [],
                order = 0,
                orderDirection = "asc",
            } = req.query;

            const modelAttr = Object.keys(ImportFile.getAttributes());
            let getDataRules = { where: null };

            if (serverSide?.toLowerCase() === "true") {
                getDataRules.limit = length;
                getDataRules.offset = start;
            }

            if (order <= modelAttr.length) {
                getDataRules.order = [[modelAttr[order], orderDirection.toUpperCase()]];
            }

            if (search != null) {
                let whereBuilder = [];
                modelAttr.forEach((key) => {
                    whereBuilder.push(
                        Sequelize.where(
                            Sequelize.fn(
                                "lower",
                                Sequelize.cast(Sequelize.col(key), "varchar")
                            ),
                            {
                                [Op.like]: `%${search.toLowerCase()}%`,
                            }
                        )
                    );
                });
                getDataRules.where = {
                    [Op.or]: whereBuilder,
                };
            }

            if (
              filter != null &&
              filter.length > 0 &&
              filterSearch != null &&
              filterSearch.length > 0
            ) {
              const filters = [];
              filter.forEach((fKey, index) => {
                if (_.includes(modelAttr, fKey)) {
                  filters[fKey] = filterSearch[index];
                }
              });
              getDataRules.where = {
                ...getDataRules.where,
                ...filters,
              };
            }

            const data = await ImportFile.findAll(getDataRules);
            const count = await ImportFile.count({
              where: getDataRules?.where,
            });

            response(res, true, "Succeed", {
              data,
              recordsFiltered: count,
              recordsTotal: count,
            });
        } catch (e) {
            response(res, false, "Failed", e.message);
        }
    };

    /**
     * Function process dakgarlantas
     */
     static dakgarlantas = async (req, res) => {
        const transaction = await db.transaction();
        const param = req.body;
        const source_id = decAes(param.source_id)
        const value = param.value
        try {

            /**
             * Validate parameter
             */
            
            const schema = {
                value: ['string','array']
            }
            const valid = check.validate(req.body, schema)

            if (valid === true) {
                
                /**
                 * Data Payload
                 */
                let Data = []
                let Destroy = []
                for (let i in value) {

                    /**
                     * Define Parameter
                     */
                    const polda_id = value[i].polda_id
                    const polres_name = value[i].polres_name
                    const date = value[i].date
                    const capture_camera = value[i].capture_camera
                    const statis = value[i].statis
                    const mobile = value[i].mobile
                    const online = value[i].online
                    const posko = value[i].posko
                    const preemtif = value[i].preemtif
                    const odol_227 = value[i].odol_227
                    const odol_307 = value[i].odol_307

                    /**
                     * Get ID Polres
                     */
                    let getIdPolres = await Polres.findOne({
                        where: {
                            name_polres: polres_name
                        }
                    });

                    /**
                     * Data Payload
                     */
                    Data.push({
                        polda_id: polda_id,
                        polres_id: getIdPolres.dataValues.id,
                        date: date,
                        capture_camera: capture_camera,
                        statis: statis,
                        mobile: mobile,
                        online: online,
                        posko: posko,
                        preemtif: preemtif,
                        odol_227: odol_227,
                        odol_307: odol_307
                    })


                    /**
                     * Check data if exist set to array destroy
                     */
                    let checkExist = await Dakgarlantas.findAll({
                        where: {
                            polda_id: polda_id,
                            polres_id: getIdPolres.dataValues.id,
                            date: date
                        }
                    });

                    /**
                     * Data Destroy & Update to new value
                     */
                    for (let i in checkExist) {
                        if(checkExist[i].dataValues.id!=null){
                            Destroy.push(
                                checkExist[i].dataValues.id
                            )
                        }
                    }

                }

                /**
                 * Transaction process
                 */
                await Dakgarlantas.destroy({where: {id: Destroy}, transaction: transaction});
                await Dakgarlantas.bulkCreate(Data, {transaction: transaction});
                await ImportFile.update({status: 1}, {where: {id: source_id}, transaction: transaction});
                await transaction.commit();
                response(res, true, "Success", "Success");
            }else{
                /**
                 * Validate Error
                 */
                response(res, false, "Failed", "You have some error please check parameter");
            }

        } catch (error) {
            
            /**
             * Rollback if error
             */
            await transaction.rollback();
            response(res, false, "Failed", error.message);
        
        }
    };

    /**
     * Function process konvensional
     */
     static konvensional = async (req, res) => {
        const transaction = await db.transaction();
        const param = req.body;
        const source_id = decAes(param.source_id)
        const value = param.value
        try {

            /**
             * Validate parameter
             */
            
            const schema = {
                value: ['string','array']
            }
            const valid = check.validate(req.body, schema)

            if (valid === true) {
                
                /**
                 * Data Payload
                 */
                let Data = []
                let Destroy = []
                for (let i in value) {

                    /**
                     * Define Parameter
                     */
                    const polda_id = value[i].polda_id
                    const polres_name = value[i].polres_name
                    const date = value[i].date
                    const pelanggaran_berat = value[i].pelanggaran_berat
                    const pelanggaran_sedang = value[i].pelanggaran_sedang
                    const pelanggaran_ringan = value[i].pelanggaran_ringan
                    const teguran = value[i].teguran

                    /**
                     * Get ID Polres
                     */
                    let getIdPolres = await Polres.findOne({
                        where: {
                            name_polres: polres_name
                        }
                    });

                    /**
                     * Data Payload
                     */
                    Data.push({
                        polda_id: polda_id,
                        polres_id: getIdPolres.dataValues.id,
                        date: date,
                        pelanggaran_berat: pelanggaran_berat,
                        pelanggaran_sedang: pelanggaran_sedang,
                        pelanggaran_ringan: pelanggaran_ringan,
                        teguran: teguran
                    })


                    /**
                     * Check data if exist set to array destroy
                     */
                    let checkExist = await Konvensional.findAll({
                        where: {
                            polda_id: polda_id,
                            polres_id: getIdPolres.dataValues.id,
                            date: date
                        }
                    });

                    /**
                     * Data Destroy & Update to new value
                     */
                    for (let i in checkExist) {
                        if(checkExist[i].dataValues.id!=null){
                            Destroy.push(
                                checkExist[i].dataValues.id
                            )
                        }
                    }

                }

                /**
                 * Transaction process
                 */
                await Konvensional.destroy({where: {id: Destroy}, transaction: transaction});
                await Konvensional.bulkCreate(Data, {transaction: transaction});
                await ImportFile.update({status: 1}, {where: {id: source_id}, transaction: transaction});
                await transaction.commit();
                response(res, true, "Success", "Success");
            }else{
                /**
                 * Validate Error
                 */
                response(res, false, "Failed", "You have some error please check parameter");
            }

        } catch (error) {
            
            /**
             * Rollback if error
             */
            await transaction.rollback();
            response(res, false, "Failed", error.message);
        
        }
    };

    /**
     * Function process lalulintas
     */
     static lalulintas = async (req, res) => {
        const transaction = await db.transaction();
        const param = req.body;
        const source_id = decAes(param.source_id)
        const value = param.value
        try {

            /**
             * Validate parameter
             */
            
            const schema = {
                value: ['string','array']
            }
            const valid = check.validate(req.body, schema)

            if (valid === true) {
                
                /**
                 * Data Payload
                 */
                let Data = []
                let Destroy = []
                for (let i in value) {

                    /**
                     * Define Parameter
                     */
                    const polda_id = value[i].polda_id
                    const polres_name = value[i].polres_name
                    const date = value[i].date
                    const meninggal_dunia = value[i].meninggal_dunia
                    const luka_berat = value[i].luka_berat
                    const luka_ringan = value[i].luka_ringan
                    const kerugian_material = value[i].kerugian_material

                    /**
                     * Get ID Polres
                     */
                    let getIdPolres = await Polres.findOne({
                        where: {
                            name_polres: polres_name
                        }
                    });

                    /**
                     * Data Payload
                     */
                    Data.push({
                        polda_id: polda_id,
                        polres_id: getIdPolres.dataValues.id,
                        date: date,
                        meninggal_dunia: meninggal_dunia,
                        luka_berat: luka_berat,
                        luka_ringan: luka_ringan,
                        kerugian_material: kerugian_material
                    })


                    /**
                     * Check data if exist set to array destroy
                     */
                    let checkExist = await Lalulintas.findAll({
                        where: {
                            polda_id: polda_id,
                            polres_id: getIdPolres.dataValues.id,
                            date: date
                        }
                    });

                    /**
                     * Data Destroy & Update to new value
                     */
                    for (let i in checkExist) {
                        if(checkExist[i].dataValues.id!=null){
                            Destroy.push(
                                checkExist[i].dataValues.id
                            )
                        }
                    }

                }

                /**
                 * Transaction process
                 */
                await Lalulintas.destroy({where: {id: Destroy}, transaction: transaction});
                await Lalulintas.bulkCreate(Data, {transaction: transaction});
                await ImportFile.update({status: 1}, {where: {id: source_id}, transaction: transaction});
                await transaction.commit();
                response(res, true, "Success", "Success");
            }else{
                /**
                 * Validate Error
                 */
                response(res, false, "Failed", "You have some error please check parameter");
            }

        } catch (error) {
            
            /**
             * Rollback if error
             */
            await transaction.rollback();
            response(res, false, "Failed", error.message);
        
        }
    };

    /**
     * Function process turjagwali
     */
     static turjagwali = async (req, res) => {
        const transaction = await db.transaction();
        const param = req.body;
        const source_id = decAes(param.source_id)
        const value = param.value
        try {

            /**
             * Validate parameter
             */
            
            const schema = {
                value: ['string','array']
            }
            const valid = check.validate(req.body, schema)

            if (valid === true) {
                
                /**
                 * Data Payload
                 */
                let Data = []
                let Destroy = []
                for (let i in value) {

                    /**
                     * Define Parameter
                     */
                    const polda_id = value[i].polda_id
                    const polres_name = value[i].polres_name
                    const date = value[i].date
                    const penjagaan = value[i].penjagaan
                    const pengawalan = value[i].pengawalan
                    const patroli = value[i].patroli
                    const pengaturan = value[i].pengaturan

                    /**
                     * Get ID Polres
                     */
                    let getIdPolres = await Polres.findOne({
                        where: {
                            name_polres: polres_name
                        }
                    });

                    /**
                     * Data Payload
                     */
                    Data.push({
                        polda_id: polda_id,
                        polres_id: getIdPolres.dataValues.id,
                        date: date,
                        penjagaan: penjagaan,
                        pengawalan: pengawalan,
                        patroli: patroli,
                        pengaturan: pengaturan
                    })


                    /**
                     * Check data if exist set to array destroy
                     */
                    let checkExist = await Turjagwali.findAll({
                        where: {
                            polda_id: polda_id,
                            polres_id: getIdPolres.dataValues.id,
                            date: date
                        }
                    });

                    /**
                     * Data Destroy & Update to new value
                     */
                    for (let i in checkExist) {
                        if(checkExist[i].dataValues.id!=null){
                            Destroy.push(
                                checkExist[i].dataValues.id
                            )
                        }
                    }

                }

                /**
                 * Transaction process
                 */
                await Turjagwali.destroy({where: {id: Destroy}, transaction: transaction});
                await Turjagwali.bulkCreate(Data, {transaction: transaction});
                await ImportFile.update({status: 1}, {where: {id: source_id}, transaction: transaction});
                await transaction.commit();
                response(res, true, "Success", "Success");
            }else{
                /**
                 * Validate Error
                 */
                response(res, false, "Failed", "You have some error please check parameter");
            }

        } catch (error) {
            
            /**
             * Rollback if error
             */
            await transaction.rollback();
            response(res, false, "Failed", error.message);
        
        }
    };

    /**
     * Function process dikmaslantas
     */
     static dikmaslantas = async (req, res) => {
        const transaction = await db.transaction();
        const param = req.body;
        const source_id = decAes(param.source_id)
        const value = param.value
        try {

            /**
             * Validate parameter
             */
            
            const schema = {
                value: ['string','array']
            }
            const valid = check.validate(req.body, schema)

            if (valid === true) {
                
                /**
                 * Data Payload
                 */
                let Data = []
                let Destroy = []
                for (let i in value) {

                    /**
                     * Define Parameter
                     */
                    const polda_id = value[i].polda_id
                    const polres_name = value[i].polres_name
                    const date = value[i].date
                    const media_cetak = value[i].media_cetak
                    const media_elektronik = value[i].media_elektronik
                    const media_sosial = value[i].media_sosial
                    const laka_langgar = value[i].laka_langgar

                    /**
                     * Get ID Polres
                     */
                    let getIdPolres = await Polres.findOne({
                        where: {
                            name_polres: polres_name
                        }
                    });

                    /**
                     * Data Payload
                     */
                    Data.push({
                        polda_id: polda_id,
                        polres_id: getIdPolres.dataValues.id,
                        date: date,
                        media_cetak: media_cetak,
                        media_elektronik: media_elektronik,
                        media_sosial: media_sosial,
                        laka_langgar: laka_langgar
                    })


                    /**
                     * Check data if exist set to array destroy
                     */
                    let checkExist = await Dikmaslantas.findAll({
                        where: {
                            polda_id: polda_id,
                            polres_id: getIdPolres.dataValues.id,
                            date: date
                        }
                    });

                    /**
                     * Data Destroy & Update to new value
                     */
                    for (let i in checkExist) {
                        if(checkExist[i].dataValues.id!=null){
                            Destroy.push(
                                checkExist[i].dataValues.id
                            )
                        }
                    }

                }

                /**
                 * Transaction process
                 */
                await Dikmaslantas.destroy({where: {id: Destroy}, transaction: transaction});
                await Dikmaslantas.bulkCreate(Data, {transaction: transaction});
                await ImportFile.update({status: 1}, {where: {id: source_id}, transaction: transaction});
                await transaction.commit();
                response(res, true, "Success", "Success");
            }else{
                /**
                 * Validate Error
                 */
                response(res, false, "Failed", "You have some error please check parameter");
            }

        } catch (error) {
            
            /**
             * Rollback if error
             */
            await transaction.rollback();
            response(res, false, "Failed", error.message);
        
        }
    };

    /**
     * Function process penyebaran
     */
     static penyebaran = async (req, res) => {
        const transaction = await db.transaction();
        const param = req.body;
        const source_id = decAes(param.source_id)
        const value = param.value
        try {

            /**
             * Validate parameter
             */
            
            const schema = {
                value: ['string','array']
            }
            const valid = check.validate(req.body, schema)

            if (valid === true) {
                
                /**
                 * Data Payload
                 */
                let Data = []
                let Destroy = []
                for (let i in value) {

                    /**
                     * Define Parameter
                     */
                    const polda_id = value[i].polda_id
                    const polres_name = value[i].polres_name
                    const date = value[i].date
                    const stiker = value[i].stiker
                    const leaflet = value[i].leaflet
                    const spanduk = value[i].spanduk
                    const billboard = value[i].billboard
                    const jemensosprek = value[i].jemensosprek

                    /**
                     * Get ID Polres
                     */
                    let getIdPolres = await Polres.findOne({
                        where: {
                            name_polres: polres_name
                        }
                    });

                    /**
                     * Data Payload
                     */
                    Data.push({
                        polda_id: polda_id,
                        polres_id: getIdPolres.dataValues.id,
                        date: date,
                        stiker: stiker,
                        leaflet: leaflet,
                        spanduk: spanduk,
                        billboard: billboard,
                        jemensosprek: jemensosprek
                    })


                    /**
                     * Check data if exist set to array destroy
                     */
                    let checkExist = await Penyebaran.findAll({
                        where: {
                            polda_id: polda_id,
                            polres_id: getIdPolres.dataValues.id,
                            date: date
                        }
                    });

                    /**
                     * Data Destroy & Update to new value
                     */
                    for (let i in checkExist) {
                        if(checkExist[i].dataValues.id!=null){
                            Destroy.push(
                                checkExist[i].dataValues.id
                            )
                        }
                    }

                }

                /**
                 * Transaction process
                 */
                await Penyebaran.destroy({where: {id: Destroy}, transaction: transaction});
                await Penyebaran.bulkCreate(Data, {transaction: transaction});
                await ImportFile.update({status: 1}, {where: {id: source_id}, transaction: transaction});
                await transaction.commit();
                response(res, true, "Success", "Success");
            }else{
                /**
                 * Validate Error
                 */
                response(res, false, "Failed", "You have some error please check parameter");
            }

        } catch (error) {
            
            /**
             * Rollback if error
             */
            await transaction.rollback();
            response(res, false, "Failed", error.message);
        
        }
    };

    /**
     * Function process sim
     */
     static sim = async (req, res) => {
        const transaction = await db.transaction();
        const param = req.body;
        const source_id = decAes(param.source_id)
        const value = param.value
        try {

            /**
             * Validate parameter
             */
            
            const schema = {
                value: ['string','array']
            }
            const valid = check.validate(req.body, schema)

            if (valid === true) {
                
                /**
                 * Data Payload
                 */
                let Data = []
                let Destroy = []
                for (let i in value) {

                    /**
                     * Define Parameter
                     */
                    const polda_id = value[i].polda_id
                    const polres_name = value[i].polres_name
                    const date = value[i].date
                    const baru = value[i].baru
                    const perpanjangan = value[i].perpanjangan

                    /**
                     * Get ID Polres
                     */
                    let getIdPolres = await Polres.findOne({
                        where: {
                            name_polres: polres_name
                        }
                    });

                    /**
                     * Data Payload
                     */
                    Data.push({
                        polda_id: polda_id,
                        polres_id: getIdPolres.dataValues.id,
                        date: date,
                        baru: baru,
                        perpanjangan: perpanjangan
                    })


                    /**
                     * Check data if exist set to array destroy
                     */
                    let checkExist = await Sim.findAll({
                        where: {
                            polda_id: polda_id,
                            polres_id: getIdPolres.dataValues.id,
                            date: date
                        }
                    });

                    /**
                     * Data Destroy & Update to new value
                     */
                    for (let i in checkExist) {
                        if(checkExist[i].dataValues.id!=null){
                            Destroy.push(
                                checkExist[i].dataValues.id
                            )
                        }
                    }

                }

                /**
                 * Transaction process
                 */
                await Sim.destroy({where: {id: Destroy}, transaction: transaction});
                await Sim.bulkCreate(Data, {transaction: transaction});
                await ImportFile.update({status: 1}, {where: {id: source_id}, transaction: transaction});
                await transaction.commit();
                response(res, true, "Success", "Success");
            }else{
                /**
                 * Validate Error
                 */
                response(res, false, "Failed", "You have some error please check parameter");
            }

        } catch (error) {
            
            /**
             * Rollback if error
             */
            await transaction.rollback();
            response(res, false, "Failed", error.message);
        
        }
    };

    /**
     * Function process bpkb
     */
     static bpkb = async (req, res) => {
        const transaction = await db.transaction();
        const param = req.body;
        const source_id = decAes(param.source_id)
        const value = param.value
        try {

            /**
             * Validate parameter
             */
            
            const schema = {
                value: ['string','array']
            }
            const valid = check.validate(req.body, schema)

            if (valid === true) {
                
                /**
                 * Data Payload
                 */
                let Data = []
                let Destroy = []
                for (let i in value) {

                    /**
                     * Define Parameter
                     */
                    const polda_id = value[i].polda_id
                    const polres_name = value[i].polres_name
                    const date = value[i].date
                    const baru = value[i].baru
                    const perpanjangan = value[i].perpanjangan
                    const rubentina = value[i].rubentina

                    /**
                     * Get ID Polres
                     */
                    let getIdPolres = await Polres.findOne({
                        where: {
                            name_polres: polres_name
                        }
                    });

                    /**
                     * Data Payload
                     */
                    Data.push({
                        polda_id: polda_id,
                        polres_id: getIdPolres.dataValues.id,
                        date: date,
                        baru: baru,
                        perpanjangan: perpanjangan,
                        rubentina: rubentina
                    })


                    /**
                     * Check data if exist set to array destroy
                     */
                    let checkExist = await Bpkb.findAll({
                        where: {
                            polda_id: polda_id,
                            polres_id: getIdPolres.dataValues.id,
                            date: date
                        }
                    });

                    /**
                     * Data Destroy & Update to new value
                     */
                    for (let i in checkExist) {
                        if(checkExist[i].dataValues.id!=null){
                            Destroy.push(
                                checkExist[i].dataValues.id
                            )
                        }
                    }

                }

                /**
                 * Transaction process
                 */
                await Bpkb.destroy({where: {id: Destroy}, transaction: transaction});
                await Bpkb.bulkCreate(Data, {transaction: transaction});
                await ImportFile.update({status: 1}, {where: {id: source_id}, transaction: transaction});
                await transaction.commit();
                response(res, true, "Success", "Success");
            }else{
                /**
                 * Validate Error
                 */
                response(res, false, "Failed", "You have some error please check parameter");
            }

        } catch (error) {
            
            /**
             * Rollback if error
             */
            await transaction.rollback();
            response(res, false, "Failed", error.message);
        
        }
    };

    /**
     * Function process ranmor
     */
     static ranmor = async (req, res) => {
        const transaction = await db.transaction();
        const param = req.body;
        const source_id = decAes(param.source_id)
        const value = param.value
        try {

            /**
             * Validate parameter
             */
            
            const schema = {
                value: ['string','array']
            }
            const valid = check.validate(req.body, schema)

            if (valid === true) {
                
                /**
                 * Data Payload
                 */
                let Data = []
                let Destroy = []
                for (let i in value) {

                    /**
                     * Define Parameter
                     */
                    const polda_id = value[i].polda_id
                    const polres_name = value[i].polres_name
                    const date = value[i].date
                    const mobil_penumpang = value[i].mobil_penumpang
                    const mobil_barang = value[i].mobil_barang
                    const mobil_bus = value[i].mobil_bus
                    const ransus = value[i].ransus
                    const sepeda_motor = value[i].sepeda_motor

                    /**
                     * Get ID Polres
                     */
                    let getIdPolres = await Polres.findOne({
                        where: {
                            name_polres: polres_name
                        }
                    });

                    /**
                     * Data Payload
                     */
                    Data.push({
                        polda_id: polda_id,
                        polres_id: getIdPolres.dataValues.id,
                        date: date,
                        mobil_penumpang: mobil_penumpang,
                        mobil_barang: mobil_barang,
                        mobil_bus: mobil_bus,
                        ransus: ransus,
                        sepeda_motor: sepeda_motor
                    })


                    /**
                     * Check data if exist set to array destroy
                     */
                    let checkExist = await Ranmor.findAll({
                        where: {
                            polda_id: polda_id,
                            polres_id: getIdPolres.dataValues.id,
                            date: date
                        }
                    });

                    /**
                     * Data Destroy & Update to new value
                     */
                    for (let i in checkExist) {
                        if(checkExist[i].dataValues.id!=null){
                            Destroy.push(
                                checkExist[i].dataValues.id
                            )
                        }
                    }

                }

                /**
                 * Transaction process
                 */
                await Ranmor.destroy({where: {id: Destroy}, transaction: transaction});
                await Ranmor.bulkCreate(Data, {transaction: transaction});
                await ImportFile.update({status: 1}, {where: {id: source_id}, transaction: transaction});
                await transaction.commit();
                response(res, true, "Success", "Success");
            }else{
                /**
                 * Validate Error
                 */
                response(res, false, "Failed", "You have some error please check parameter");
            }

        } catch (error) {
            
            /**
             * Rollback if error
             */
            await transaction.rollback();
            response(res, false, "Failed", error.message);
        
        }
    };

    /**
     * Function process stnk
     */
     static stnk = async (req, res) => {
        const transaction = await db.transaction();
        const param = req.body;
        const source_id = decAes(param.source_id)
        const value = param.value
        try {

            /**
             * Validate parameter
             */
            
            const schema = {
                value: ['string','array']
            }
            const valid = check.validate(req.body, schema)

            if (valid === true) {
                
                /**
                 * Data Payload
                 */
                let Data = []
                let Destroy = []
                for (let i in value) {

                    /**
                     * Define Parameter
                     */
                    const polda_id = value[i].polda_id
                    const polres_name = value[i].polres_name
                    const date = value[i].date
                    const baru = value[i].baru
                    const perpanjangan = value[i].perpanjangan
                    const rubentina = value[i].rubentina

                    /**
                     * Get ID Polres
                     */
                    let getIdPolres = await Polres.findOne({
                        where: {
                            name_polres: polres_name
                        }
                    });

                    /**
                     * Data Payload
                     */
                    Data.push({
                        polda_id: polda_id,
                        polres_id: getIdPolres.dataValues.id,
                        date: date,
                        baru: baru,
                        perpanjangan: perpanjangan,
                        rubentina: rubentina
                    })


                    /**
                     * Check data if exist set to array destroy
                     */
                    let checkExist = await Stnk.findAll({
                        where: {
                            polda_id: polda_id,
                            polres_id: getIdPolres.dataValues.id,
                            date: date
                        }
                    });

                    /**
                     * Data Destroy & Update to new value
                     */
                    for (let i in checkExist) {
                        if(checkExist[i].dataValues.id!=null){
                            Destroy.push(
                                checkExist[i].dataValues.id
                            )
                        }
                    }

                }

                /**
                 * Transaction process
                 */
                await Stnk.destroy({where: {id: Destroy}, transaction: transaction});
                await Stnk.bulkCreate(Data, {transaction: transaction});
                await ImportFile.update({status: 1}, {where: {id: source_id}, transaction: transaction});
                await transaction.commit();
                response(res, true, "Success", "Success");
            }else{
                /**
                 * Validate Error
                 */
                response(res, false, "Failed", "You have some error please check parameter");
            }

        } catch (error) {
            
            /**
             * Rollback if error
             */
            await transaction.rollback();
            response(res, false, "Failed", error.message);
        
        }
    };
};
