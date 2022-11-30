const jsdom = require("jsdom");
const { JSDOM } = jsdom;

exports.tempalteLaphar = (data, tgl) => {
  let body = "";
  data.map((Element) => {
    body += `<tr>
                                    <td>${Element.no}</td>
                                    <td>${Element.nama_polda}</td>
                                    <td>${Element.capture_camera}</td>
                                    <td>${Element.statis}</td>
                                    <td>${Element.mobile}</td>
                                    <td>${Element.total_validasi}</td>
                                    <td>${Element.online}</td>
                                    <td>${Element.posko}</td>
                                    <td>${Element.total_konfirmasi}</td>
                                    <td>${Element.preemtif}</td>
                                    <td>${Element.preventif}</td>
                                    <td>${Element.odol_227}</td>
                                    <td>${Element.odol_307}</td>
                                    <td>${Element.pelanggaran_berat}</td>
                                    <td>${Element.pelanggaran_sedang}</td>
                                    <td>${Element.pelanggaran_ringan}</td>
                                    <td>${Element.teguran}</td>
                                    <td>${Element.jumlah_garlantas}</td>
                                    <td>${Element.meninggal_dunia}</td>
                                    <td>${Element.luka_berat}</td>
                                    <td>${Element.luka_ringan}</td>
                                    <td>${Element.kerugian_material}</td>
                                    <td>${Element.jumlah_laka_lantas}</td>
                                    <td>${Element.pengaturan}</td>
                                    <td>${Element.penjagaan}</td>
                                    <td>${Element.pengawalan}</td>
                                    <td>${Element.patroli}</td>
                                    <td>${Element.jumlah_turjagwali}</td>
                                    <td>${Element.media_cetak}</td>
                                    <td>${Element.media_elektronik}</td>
                                    <td>${Element.media_sosial}</td>
                                    <td>${Element.laka_langgar}</td>
                                    <td>${Element.jumlah_dikmaslantas}</td>
                                    <td>${Element.stiker}</td>
                                    <td>${Element.spanduk}</td>
                                    <td>${Element.leaflet}</td>
                                    <td>${Element.billboard}</td>
                                    <td>${Element.jemensosprek}</td>
                                    <td>${Element.jumlah_penyebaran}</td>
                                    <td>${Element.sim_baru}</td>
                                    <td>${Element.sim_perpanjangan}</td>
                                    <td>${Element.jumlah_sim}</td>
                                    <td>${Element.stnk_baru}</td>
                                    <td>${Element.stnk_perpanjangan}</td>
                                    <td>${Element.stnk_rubentina}</td>
                                    <td>${Element.jumlah_stnk}</td>
                                    <td>${Element.bpkb_baru}</td>
                                    <td>${Element.bpkb_gantinama}</td>
                                    <td>${Element.bpkb_rubentina}</td>
                                    <td>${Element.jumlah_bpkb}</td>
                                    <td>${Element.mobil_penumpang}</td>
                                    <td>${Element.mobil_barang}</td>
                                    <td>${Element.mobil_bus}</td>
                                    <td>${Element.ransus}</td>
                                    <td>${Element.sepeda_motor}</td>
                                    <td>${Element.jumlah_ranmor}</td>

                                </tr>`;
  });
  const htmlString = `
      <table id="table1" border="1px" cellspacing="0" cellpadding="0" border="1px">
                        <thead style="vertical-align : middle;text-align:center;">
                            <tr>
                                <th colspan="62">Markas Besar</th>
                            </tr>
                            <tr>
                                <th colspan="62">Kepolisian Negara Republik Indonesia</th>
                            </tr>
                            <tr>
                                <th colspan="62">Corps Lalulintas</th>
                            </tr>
                            <tr>
                                <th colspan="62"></th>
                            </tr>
                             <tr>
                                <th colspan="62"></th>
                            </tr>
                             <tr>
                                <th colspan="62"></th>
                            </tr>
                            <tr>
                                <th colspan="62">Laporan Harian Kegiatan Fungsi Lalu Lintas</th>
                            </tr>
                            <tr>
                                <th colspan="62">Hari / Tanggal  : ${tgl}</th>
                            </tr>
                            <tr>
                                <th rowspan="4">No</th>
                                <th rowspan="4">Polda</th>
                                <th colspan="26">DITGAKKUM</th>
                                <th colspan="11">DITKAMSEL</th>
                                <th colspan="17">DITREGIDENT</th>
                            </tr>
                        	<tr>
                            	<th colspan="11">DATA DAKGAR LANTAS</th>
                                <th colspan="5">GARLANTAS KONVENSIONAL</th>
                                <th colspan="5">KECELAKAAN LALU LINTAS</th>
                                <th colspan="5">TURJAGWALI</th>
                                <th colspan="5">DIKMASLANTAS</th>
                                <th colspan="6">PEMASANGAN / PENYEBARAN</th>
                                <th colspan="3">SIM</th>
                                <th colspan="4">STNK</th>
                                <th colspan="4">BPKB</th>
                                <th colspan="6">RANMOR</th>
                            </tr>
                            <tr>
                                <th rowspan="2">Capture Camera</th>
                                <th colspan="3">Validasi Petugas</th>
                                <th colspan="3">Konfirmasi Masyarakat</th>
                                <th colspan="4">ODOL</th>
        <th rowspan="2">Pelanggaran Berat</th>
        <th rowspan="2">Pelanggaran Sedang</th>
        <th rowspan="2">Pelanggaran Ringan</th>
        <th rowspan="2">Teguran</th>
        <th rowspan="2">Jumlah</th>
        <th rowspan="2">Meninggal dunia</th>
        <th rowspan="2">Luka Berat</th>
        <th rowspan="2">Luka Ringan</th>
        <th rowspan="2">Teguran</th>
        <th rowspan="2">Jumlah</th>
          <th rowspan="2">Pengaturan</th>
        <th rowspan="2">Penjagaan</th>
        <th rowspan="2">Pengawalan</th>
        <th rowspan="2">Patroli</th>
        <th rowspan="2">Jumlah</th>
        <th rowspan="2">Media Cetak</th>
        <th rowspan="2">Media Elektronik</th>
        <th rowspan="2">Media Sosial</th>
        <th rowspan="2">Laka Langgar</th>
        <th rowspan="2">Jumlah</th>
        <th rowspan="2">Stiker</th>
        <th rowspan="2">Spanduk</th>
        <th rowspan="2">Leaflet</th>
        <th rowspan="2">Billboard</th>
        <th rowspan="2">Jemensosprek</th>
        <th rowspan="2">Jumlah</th>
        <th rowspan="2">Baru</th>
        <th rowspan="2">Perpanjangan</th>
        <th rowspan="2">Jumlah</th>
        <th rowspan="2">Baru</th>
        <th rowspan="2">Perpanjangan</th>
        <th rowspan="2">Rubentina</th>
        <th rowspan="2">Jumlah</th>
        <th rowspan="2">Baru</th>
        <th rowspan="2">Ganti Pemilik</th>
        <th rowspan="2">Rubentina</th>
        <th rowspan="2">Jumlah</th>
        <th rowspan="2">Mobil Penumpang</th>
        <th rowspan="2">Mobil Barang</th>
        <th rowspan="2">Bus</th>
        <th rowspan="2">Ransus</th>
        <th rowspan="2">Sepeda Motor</th>
        <th rowspan="2">Jumlah</th>







                            </tr>
                            <tr>
                                <th>STATIS</th>
                                <th>MOBILE</th>
                                <th>TOTAL</th>
                                <th>ONLINE</th>
                                <th>POSKO</th>
                                <th>TOTAL</th>
                                <th>PREEMTIF</th>
                                <th>PRE-VENTIF</th>
                                <th>227</th>
                                <th>307</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${body}
                        </tbody>
                    </table>
`;
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