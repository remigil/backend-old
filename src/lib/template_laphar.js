const jsdom = require("jsdom");
const { JSDOM } = jsdom;

exports.tempLaka = (data, tgl) => {
  const htmlString = `<table style="font-size: 12px; border:1px solid #CCC; font-family: Arial, Helvetica, sans-serif;" align="center"
        class="tableizer-table" cellpadding="0" cellspacing="0" id="table1">
        
        <tbody>
        <tr>
                                <th colspan="7">Markas Besar</th>
                            </tr>
                            <tr>
                                <th colspan="7">Kepolisian Negara Republik Indonesia</th>
                            </tr>
                            <tr>
                                <th colspan="7">Corps Lalulintas</th>
                            </tr>
                            <tr>
                                <th colspan="7">Tanggal : ${tgl}</th>
                            </tr>
                             <tr>
                                <th colspan="7">Laporan : Kecelakaan Lalu Lintas</th>
                            </tr>
                                  <tr>
                                <th colspan="7"></th>
                            </tr>
                                <tr>
                                <th colspan="7"></th>
                            </tr>
            <tr class="tableizer-firstrow">
                <td>URAIAN</td>
                ${data.rows_name_polda.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>1. Meninggal Dunia</td>
                ${data.rows_meninggal_dunia.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>2. Luka Berat</td>
                ${data.rows_luka_berat.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>3. Luka Ringan</td>
                ${data.rows_luka_ringan.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>4. Kerugian Material</td>
                ${data.rows_kerugian_material.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total Insinden</td>
                ${data.rows_jumlah_lakalantas.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
        </tbody>
    </table>`;

  const dom = new JSDOM(htmlString);
  const table = dom.window.document.getElementById("table1");
  return table;
};

exports.tempLanggar = (data, tgl) => {
  const htmlString = `<table style="font-size: 12px; border:1px solid #CCC; font-family: Arial, Helvetica, sans-serif;" align="center"
        class="tableizer-table" cellpadding="0" cellspacing="0" id="table1">
        
        <tbody>
        <tr>
                                <th colspan="7">Markas Besar</th>
                            </tr>
                            <tr>
                                <th colspan="7">Kepolisian Negara Republik Indonesia</th>
                            </tr>
                            <tr>
                                <th colspan="7">Corps Lalulintas</th>
                            </tr>
                            <tr>
                                <th colspan="7">Tanggal : ${tgl}</th>
                            </tr>
                             <tr>
                                <th colspan="7">Laporan : Pelanggaran Lalu Lintas</th>
                            </tr>
                                  <tr>
                                <th colspan="7"></th>
                            </tr>
                                <tr>
                                <th colspan="7"></th>
                            </tr>
            <tr class="tableizer-firstrow">
               
                <td>URAIAN</td>
                ${data.rows_name_polda.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>1. Pelanggaran Berat</td>
                ${data.rows_pelanggaran_berat.map((element) => {
                  return `<td>${element}</td>`;
                })}}
            </tr>
            <tr>
                <td>2. Pelanggaran Sedang</td>
                 ${data.rows_pelanggaran_sedang.map((element) => {
                   return `<td>${element}</td>`;
                 })}}
            </tr>
            <tr>
                <td>3. Pelanggaran Ringan</td>
                 ${data.rows_pelanggaran_ringan.map((element) => {
                   return `<td>${element}</td>`;
                 })}}
            </tr>
            <tr>
                <td>4. Teguran</td>
                ${data.rows_teguran.map((element) => {
                  return `<td>${element}</td>`;
                })}}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3+4)</td>
                ${data.rows_jumlah_garlantas.map((element) => {
                  return `<td>${element}</td>`;
                })}}
            </tr>
        </tbody>
    </table>`;

  const dom = new JSDOM(htmlString);
  const table = dom.window.document.getElementById("table1");
  return table;
};
exports.tempTurjagwali = (data, tgl) => {
  const htmlString = `<table style="font-size: 12px; border:1px solid #CCC; font-family: Arial, Helvetica, sans-serif;" align="center"
        class="tableizer-table" cellpadding="0" cellspacing="0" id="table1">
        
        <tbody>
        <tr>
                                <th colspan="7">Markas Besar</th>
                            </tr>
                            <tr>
                                <th colspan="7">Kepolisian Negara Republik Indonesia</th>
                            </tr>
                            <tr>
                                <th colspan="7">Corps Lalulintas</th>
                            </tr>
                            <tr>
                                <th colspan="7">Tanggal : ${tgl}</th>
                            </tr>
                             <tr>
                                <th colspan="7">Laporan : Turjagwali</th>
                            </tr>
                                  <tr>
                                <th colspan="7"></th>
                            </tr>
                                <tr>
                                <th colspan="7"></th>
                            </tr>
            <tr class="tableizer-firstrow">
                <td>URAIAN</td>
                ${data.rows_name_polda.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>1. Pengaturan</td>
                ${data.rows_pengaturan.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>2. Penjagaan</td>
                 ${data.rows_penjagaan.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>3. Pengawalan</td>
               ${data.rows_pengawalan.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td>4. Patroli</td>
                ${data.rows_patroli.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3+4)</td>
                 ${data.rows_jumlah_turjagwali.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
        </tbody>
    </table>`;

  const dom = new JSDOM(htmlString);
  const table = dom.window.document.getElementById("table1");
  return table;
};

exports.tempRanmor = (data, tgl) => {
  const htmlString = `<table style="font-size: 12px; border:1px solid #CCC; font-family: Arial, Helvetica, sans-serif;" align="center"
        class="tableizer-table" cellpadding="0" cellspacing="0" id="table1">
        
        <tbody>
        <tr>
                                <th colspan="7">Markas Besar</th>
                            </tr>
                            <tr>
                                <th colspan="7">Kepolisian Negara Republik Indonesia</th>
                            </tr>
                            <tr>
                                <th colspan="7">Corps Lalulintas</th>
                            </tr>
                            <tr>
                                <th colspan="7">Tanggal : ${tgl}</th>
                            </tr>
                              <tr>
                                <th colspan="7">Laporan : Kendaraan Bermotor</th>
                            </tr>
                                  <tr>
                                <th colspan="7"></th>
                            </tr>
                                <tr>
                                <th colspan="7"></th>
                            </tr>
            <tr class="tableizer-firstrow">
                <td>URAIAN</td>
                ${data.rows_name_polda.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>1. Mobil Barang</td>
                 ${data.rows_mobil_barang.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>2. Mobil Penumpang</td>
                ${data.rows_mobil_penumpang.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>3. Mobil Bus</td>
                ${data.rows_mobil_bus.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>4. Sepeda Motor</td>
                 ${data.rows_sepeda_motor.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>5. Ransus</td>
               ${data.rows_ransus.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3+4+5)</td>
               ${data.rows_jumlah_ranmor.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
        </tbody>
    </table>`;

  const dom = new JSDOM(htmlString);
  const table = dom.window.document.getElementById("table1");
  return table;
};

exports.tempSim = (data, tgl) => {
  const htmlString = `<table style="font-size: 12px; border:1px solid #CCC; font-family: Arial, Helvetica, sans-serif;" align="center"
        class="tableizer-table" cellpadding="0" cellspacing="0" id="table1">
        
        <tbody>
        <tr>
                                <th colspan="7">Markas Besar</th>
                            </tr>
                            <tr>
                                <th colspan="7">Kepolisian Negara Republik Indonesia</th>
                            </tr>
                            <tr>
                                <th colspan="7">Corps Lalulintas</th>
                            </tr>
                            <tr>
                                <th colspan="7">Tanggal : ${tgl}</th>
                            </tr>
                              <tr>
                                <th colspan="7">Laporan : SIM</th>
                            </tr>
                                  <tr>
                                <th colspan="7"></th>
                            </tr>
                                <tr>
                                <th colspan="7"></th>
                            </tr>
            <tr class="tableizer-firstrow">
                <td>URAIAN</td>
                ${data.rows_name_polda.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>1. Baru A</td>
                ${data.rows_baru_a.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>2. Baru C</td>
                 ${data.rows_baru_c.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
             <tr>
                <td>3. Baru C1</td>
                 ${data.rows_baru_c1.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
             <tr>
                <td>4. Baru C2</td>
                 ${data.rows_baru_c2.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>5. Baru D</td>
                 ${data.rows_baru_d.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
             <tr>
                <td>6. Baru D1</td>
                 ${data.rows_baru_d1.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
               <tr>
                <td>7. Perpanjangan A</td>
                 ${data.rows_perpanjangan_a.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
             <tr>
                <td>8. Perpanjangan AU</td>
                 ${data.rows_perpanjangan_au.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
               <tr>
                <td>9. Perpanjangan C</td>
                 ${data.rows_perpanjangan_c.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
              <tr>
                <td>9. Perpanjangan C1</td>
                 ${data.rows_perpanjangan_c1.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
              <tr>
                <td>9. Perpanjangan C2</td>
                 ${data.rows_perpanjangan_c2.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
             <tr>
                <td>9. Perpanjangan D</td>
                 ${data.rows_perpanjangan_d.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
                <tr>
                <td>9. Perpanjangan D1</td>
                 ${data.rows_perpanjangan_d1.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
               <tr>
                <td>9. Perpanjangan B1</td>
                 ${data.rows_perpanjangan_b1.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
                <tr>
                <td>9. Perpanjangan B1U</td>
                 ${data.rows_perpanjangan_b1u.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
                  <tr>
                <td>9. Perpanjangan B2</td>
                 ${data.rows_perpanjangan_b2.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
                    <tr>
                <td>9. Perpanjangan B2U</td>
                 ${data.rows_perpanjangan_b2u.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>9. Peningkatan AU</td>
                 ${data.rows_peningkatan_au.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
             <tr>
                <td>9. Peningkatan B1</td>
                 ${data.rows_peningkatan_b1.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
              <tr>
                <td>9. Peningkatan B1U</td>
                 ${data.rows_peningkatan_b1u.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
              <tr>
                <td>9. Peningkatan B2</td>
                 ${data.rows_peningkatan_b2u.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2)</td>
                ${data.rows_jumlah_sim.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
        </tbody>
    </table>`;

  const dom = new JSDOM(htmlString);
  const table = dom.window.document.getElementById("table1");
  return table;
};
exports.tempStnk = (data, tgl) => {
  const htmlString = `<table style="font-size: 12px; border:1px solid #CCC; font-family: Arial, Helvetica, sans-serif;" align="center"
        class="tableizer-table" cellpadding="0" cellspacing="0" id="table1">
        
        <tbody>
        <tr>
                                <th colspan="7">Markas Besar</th>
                            </tr>
                            <tr>
                                <th colspan="7">Kepolisian Negara Republik Indonesia</th>
                            </tr>
                            <tr>
                                <th colspan="7">Corps Lalulintas</th>
                            </tr>
                            <tr>
                                <th colspan="7">Tanggal : ${tgl}</th>
                            </tr>
                              <tr>
                                <th colspan="7">Laporan : STNK</th>
                            </tr>
                                  <tr>
                                <th colspan="7"></th>
                            </tr>
                                <tr>
                                <th colspan="7"></th>
                            </tr>
            <tr class="tableizer-firstrow">
                <td>URAIAN</td>
                ${data.rows_name_polda.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>1. BBN 1 R2</td>
                 ${data.rows_bbn_1_r2.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
              <tr>
                <td>2. BBN 1 R4</td>
                 ${data.rows_bbn_1_r4.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
             <tr>
                <td>3. Perubahan R2</td>
                 ${data.rows_perubahan_r2.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
              <tr>
                <td>4. Perubahan R4</td>
                 ${data.rows_perubahan_r4.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
             <tr>
                <td>5. Mutasi Keluar R2</td>
                 ${data.rows_mutasi_keluar_r2.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
              <tr>
                <td>6. Mutasi Keluar R4</td>
                 ${data.rows_mutasi_keluar_r4.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>7. Mutasi Masuk R2</td>
                 ${data.rows_mutasi_masuk_r2.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
              <tr>
                <td>8. Mutasi Masuk R4</td>
                 ${data.rows_mutasi_masuk_r4.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>9. Pengesahan R2</td>
                 ${data.rows_pengesahan_r2.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
             <tr>
                <td>10. Pengesahan R4</td>
                 ${data.rows_pengesahan_r4.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
              <tr>
                <td>11. Samolnas R2</td>
                 ${data.rows_samolnas_r2.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
              <tr>
                <td>12. Samolnas R4</td>
                 ${data.rows_samolnas_r4.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3)</td>
                ${data.rows_jumlah_stnk.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
        </tbody>
    </table>`;

  const dom = new JSDOM(htmlString);
  const table = dom.window.document.getElementById("table1");
  return table;
};
exports.templateLapharNew = (data, tgl) => {
  const htmlString = `<table style="font-size: 12px; border:1px solid #CCC; font-family: Arial, Helvetica, sans-serif;" align="center"
        class="tableizer-table" cellpadding="0" cellspacing="0" id="table1">
        
        <tbody>
        <tr>
                                <th colspan="7">Markas Besar</th>
                            </tr>
                            <tr>
                                <th colspan="7">Kepolisian Negara Republik Indonesia</th>
                            </tr>
                            <tr>
                                <th colspan="7">Corps Lalulintas</th>
                            </tr>
                            <tr>
                                <th colspan="7">Tanggal : ${tgl}</th>
                            </tr>
                                  <tr>
                                <th colspan="7"></th>
                            </tr>
                                <tr>
                                <th colspan="7"></th>
                            </tr>
            <tr class="tableizer-firstrow">
                <td>NO</td>
                <td>URAIAN</td>
                ${data.rows_name_polda.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td style="font-weight: bold;">I</td>
                <td style="font-weight: bold;" colspan="4">DITGAKKUM</td>
            </tr>
            <tr>
                <td rowspan="6"></td>
                <td colspan="4" style="font-weight: bold;">A. Pelanggaran Konvensional</td>
            </tr>
            <tr>
                <td>1. Pelanggaran Berat</td>
                ${data.rows_pelanggaran_berat.map((element) => {
                  return `<td>${element}</td>`;
                })}}
            </tr>
            <tr>
                <td>2. Pelanggaran Sedang</td>
                 ${data.rows_pelanggaran_sedang.map((element) => {
                   return `<td>${element}</td>`;
                 })}}
            </tr>
            <tr>
                <td>3. Pelanggaran Ringan</td>
                 ${data.rows_pelanggaran_ringan.map((element) => {
                   return `<td>${element}</td>`;
                 })}}
            </tr>
            <tr>
                <td>4. Teguran</td>
                ${data.rows_teguran.map((element) => {
                  return `<td>${element}</td>`;
                })}}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3+4)</td>
                ${data.rows_jumlah_garlantas.map((element) => {
                  return `<td>${element}</td>`;
                })}}
            </tr>
            <tr>
                <td rowspan="6"></td>
                <td colspan="4" style="font-weight: bold;">C. Kecelakaan</td>
            </tr>
            <tr>
                <td>1. Meninggal Dunia</td>
                ${data.rows_meninggal_dunia.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>2. Luka Berat</td>
                ${data.rows_luka_berat.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>3. Luka Ringan</td>
                ${data.rows_luka_ringan.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>4. Kerugian Material</td>
                ${data.rows_kerugian_material.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total Insinden</td>
                ${data.rows_jumlah_lakalantas.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td rowspan="6"></td>
                <td colspan="4" style="font-weight: bold;">D. Turjagwali</td>
            </tr>
            <tr>
                <td>1. Pengaturan</td>
                ${data.rows_pengaturan.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>2. Penjagaan</td>
                 ${data.rows_penjagaan.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>3. Pengawalan</td>
               ${data.rows_pengawalan.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td>4. Patroli</td>
                ${data.rows_patroli.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3+4)</td>
                 ${data.rows_jumlah_turjagwali.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td style="font-weight:bold">II</td>
                <td style="font-weight: bold;" colspan="4">DITKAMSEL</td>
            </tr>
            <tr>
                <td rowspan="6"></td>
                <td colspan="4" style="font-weight: bold;">E. Dikmaslantas</td>
            </tr>
            <tr>
                <td>1. Media Cetak</td>
               ${data.rows_media_cetak.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td>2. Media Elektronik</td>
                ${data.rows_media_elektronik.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>3. Media Sosial</td>
               ${data.rows_media_sosial.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td>4. Laka langgar</td>
                 ${data.rows_laka_langgar.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3+4)</td>
                ${data.rows_jumlah_dikmaslantas.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td rowspan="7"></td>
                <td colspan="4" style="font-weight: bold;">F. Penyebaran / Pemasangan</td>
            </tr>
            <tr>
                <td>1. Stiker</td>
                ${data.rows_stiker.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>2. Spanduk</td>
                ${data.rows_spanduk.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>3. Leaflet</td>
                ${data.rows_leaflet.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>4. Billboard</td>
                ${data.rows_billboard.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>5. Jemensosprek</td>
               ${data.rows_jemensosprek.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3+4+5)</td>
               ${data.rows_jumlah_penyebaran.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td style="font-weight: bold;">III</td>
                <td style="font-weight: bold;" colspan="4">DITREGIDENT</td>
            </tr>
            <tr>
                <td rowspan="4"></td>
                <td colspan="4" style="font-weight: bold;">G. SIM</td>
            </tr>
            <tr>
                <td>1. Baru</td>
                ${data.rows_sim_baru.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>2. Perpanjangan</td>
                 ${data.rows_sim_perpanjangan.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2)</td>
                ${data.rows_jumlah_sim.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td rowspan="5"></td>
                <td colspan="4" style="font-weight: bold;">H. STNK</td>
            </tr>
            <tr>
                <td>1. Baru</td>
                 ${data.rows_stnk_baru.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>2. Perpanjangan</td>
               ${data.rows_stnk_perpanjangan.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td>3. Rubentina</td>
                ${data.rows_stnk_rubentina.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3)</td>
                ${data.rows_jumlah_stnk.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td rowspan="5"></td>
                <td colspan="4" style="font-weight: bold;">H. BPKB</td>
            </tr>
            <tr>
                <td>1. Baru</td>
                ${data.rows_bpkb_baru.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>2. Ganti Nama</td>
                ${data.rows_bpkb_gantinama.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>3. Rubentina</td>
                 ${data.rows_bpkb_rubentina.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3)</td>
                ${data.rows_jumlah_bpkb.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td rowspan="7"></td>
                <td colspan="4" style="font-weight: bold;">H. RANMOR</td>
            </tr>
            <tr>
                <td>1. Mobil Barang</td>
                 ${data.rows_mobil_barang.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>2. Mobil Penumpang</td>
                ${data.rows_mobil_penumpang.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>3. Mobil Bus</td>
                ${data.rows_mobil_bus.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>4. Sepeda Motor</td>
                 ${data.rows_sepeda_motor.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>5. Ransus</td>
               ${data.rows_ransus.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3+4+5)</td>
               ${data.rows_jumlah_ranmor.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
        </tbody>
    </table>`;

  const dom = new JSDOM(htmlString);
  const table = dom.window.document.getElementById("table1");
  return table;
};

exports.templateLapharNew = (data, tgl) => {
  const htmlString = `<table style="font-size: 12px; border:1px solid #CCC; font-family: Arial, Helvetica, sans-serif;" align="center"
        class="tableizer-table" cellpadding="0" cellspacing="0" id="table1">
        
        <tbody>
        <tr>
                                <th colspan="7">Markas Besar</th>
                            </tr>
                            <tr>
                                <th colspan="7">Kepolisian Negara Republik Indonesia</th>
                            </tr>
                            <tr>
                                <th colspan="7">Corps Lalulintas</th>
                            </tr>
                            <tr>
                                <th colspan="7">Tanggal : ${tgl}</th>
                            </tr>
                                  <tr>
                                <th colspan="7"></th>
                            </tr>
                                <tr>
                                <th colspan="7"></th>
                            </tr>
            <tr class="tableizer-firstrow">
                <td>NO</td>
                <td>URAIAN</td>
                ${data.rows_name_polda.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td style="font-weight: bold;">I</td>
                <td style="font-weight: bold;" colspan="4">DITGAKKUM</td>
            </tr>
            <tr>
                <td rowspan="6"></td>
                <td colspan="4" style="font-weight: bold;">A. Pelanggaran Konvensional</td>
            </tr>
            <tr>
                <td>1. Pelanggaran Berat</td>
                ${data.rows_pelanggaran_berat.map((element) => {
                  return `<td>${element}</td>`;
                })}}
            </tr>
            <tr>
                <td>2. Pelanggaran Sedang</td>
                 ${data.rows_pelanggaran_sedang.map((element) => {
                   return `<td>${element}</td>`;
                 })}}
            </tr>
            <tr>
                <td>3. Pelanggaran Ringan</td>
                 ${data.rows_pelanggaran_ringan.map((element) => {
                   return `<td>${element}</td>`;
                 })}}
            </tr>
            <tr>
                <td>4. Teguran</td>
                ${data.rows_teguran.map((element) => {
                  return `<td>${element}</td>`;
                })}}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3+4)</td>
                ${data.rows_jumlah_garlantas.map((element) => {
                  return `<td>${element}</td>`;
                })}}
            </tr>
            <tr>
                <td rowspan="6"></td>
                <td colspan="4" style="font-weight: bold;">C. Kecelakaan</td>
            </tr>
            <tr>
                <td>1. Meninggal Dunia</td>
                ${data.rows_meninggal_dunia.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>2. Luka Berat</td>
                ${data.rows_luka_berat.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>3. Luka Ringan</td>
                ${data.rows_luka_ringan.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>4. Kerugian Material</td>
                ${data.rows_kerugian_material.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total Insinden</td>
                ${data.rows_jumlah_lakalantas.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td rowspan="6"></td>
                <td colspan="4" style="font-weight: bold;">D. Turjagwali</td>
            </tr>
            <tr>
                <td>1. Pengaturan</td>
                ${data.rows_pengaturan.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>2. Penjagaan</td>
                 ${data.rows_penjagaan.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>3. Pengawalan</td>
               ${data.rows_pengawalan.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td>4. Patroli</td>
                ${data.rows_patroli.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3+4)</td>
                 ${data.rows_jumlah_turjagwali.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td style="font-weight:bold">II</td>
                <td style="font-weight: bold;" colspan="4">DITKAMSEL</td>
            </tr>
            <tr>
                <td rowspan="6"></td>
                <td colspan="4" style="font-weight: bold;">E. Dikmaslantas</td>
            </tr>
            <tr>
                <td>1. Media Cetak</td>
               ${data.rows_media_cetak.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td>2. Media Elektronik</td>
                ${data.rows_media_elektronik.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>3. Media Sosial</td>
               ${data.rows_media_sosial.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td>4. Laka langgar</td>
                 ${data.rows_laka_langgar.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3+4)</td>
                ${data.rows_jumlah_dikmaslantas.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td rowspan="7"></td>
                <td colspan="4" style="font-weight: bold;">F. Penyebaran / Pemasangan</td>
            </tr>
            <tr>
                <td>1. Stiker</td>
                ${data.rows_stiker.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>2. Spanduk</td>
                ${data.rows_spanduk.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>3. Leaflet</td>
                ${data.rows_leaflet.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>4. Billboard</td>
                ${data.rows_billboard.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>5. Jemensosprek</td>
               ${data.rows_jemensosprek.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3+4+5)</td>
               ${data.rows_jumlah_penyebaran.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td style="font-weight: bold;">III</td>
                <td style="font-weight: bold;" colspan="4">DITREGIDENT</td>
            </tr>
            <tr>
                <td rowspan="4"></td>
                <td colspan="4" style="font-weight: bold;">G. SIM</td>
            </tr>
            <tr>
                <td>1. Baru</td>
                ${data.rows_sim_baru.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>2. Perpanjangan</td>
                 ${data.rows_sim_perpanjangan.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2)</td>
                ${data.rows_jumlah_sim.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td rowspan="5"></td>
                <td colspan="4" style="font-weight: bold;">H. STNK</td>
            </tr>
            <tr>
                <td>1. Baru</td>
                 ${data.rows_stnk_baru.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>2. Perpanjangan</td>
               ${data.rows_stnk_perpanjangan.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td>3. Rubentina</td>
                ${data.rows_stnk_rubentina.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3)</td>
                ${data.rows_jumlah_stnk.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td rowspan="5"></td>
                <td colspan="4" style="font-weight: bold;">H. BPKB</td>
            </tr>
            <tr>
                <td>1. Baru</td>
                ${data.rows_bpkb_baru.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>2. Ganti Nama</td>
                ${data.rows_bpkb_gantinama.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>3. Rubentina</td>
                 ${data.rows_bpkb_rubentina.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3)</td>
                ${data.rows_jumlah_bpkb.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td rowspan="7"></td>
                <td colspan="4" style="font-weight: bold;">H. RANMOR</td>
            </tr>
            <tr>
                <td>1. Mobil Barang</td>
                 ${data.rows_mobil_barang.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>2. Mobil Penumpang</td>
                ${data.rows_mobil_penumpang.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>3. Mobil Bus</td>
                ${data.rows_mobil_bus.map((element) => {
                  return `<td>${element}</td>`;
                })}
            </tr>
            <tr>
                <td>4. Sepeda Motor</td>
                 ${data.rows_sepeda_motor.map((element) => {
                   return `<td>${element}</td>`;
                 })}
            </tr>
            <tr>
                <td>5. Ransus</td>
               ${data.rows_ransus.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
            <tr>
                <td style="font-weight:bold;">Total (1+2+3+4+5)</td>
               ${data.rows_jumlah_ranmor.map((element) => {
                 return `<td>${element}</td>`;
               })}
            </tr>
        </tbody>
    </table>`;

  const dom = new JSDOM(htmlString);
  const table = dom.window.document.getElementById("table1");
  return table;
};