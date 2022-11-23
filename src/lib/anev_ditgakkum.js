const jsdom = require("jsdom");
const { JSDOM } = jsdom;
exports.tempAnevGakkum = (laka, gar) => {
  let htmlString = `<table width="70%" align="center" id="table1">
            <h3 align="center">
                Selamat Pagi Komandan Melaporkan Anev Harian Laka dan Dakgar Lantas berdasarkan Rekapitulasi 
            </h3>
            <h3 align="center">
                pada aplikasi IRSMS dan aplikasi Dakgar selama 1X24 Jam, hari Minggu, 20 November 2022 sbb : 
            </h3>
            <br>
            <tr>
                <th colspan="7">A. LAPORAN HARIAN ANEV KORBAN LAKA LANTAS</p>
            </tr>
            <tr>
                    <th rowspan="2">No</th>
                    <th rowspan="2">Uraian</th>
                    <th colspan="2">Waktu</th>
                    <th colspan="2">Trend</th>
                    <th rowspan="2">Keterangan</th>
                </tr>
                <tr>
                    <th>${laka[0].yesterday}</th>
                    <th>${laka[0].today}</th>
                    <th>ANGKA</th>
                    <th>PERSEN %</th>
                </tr>
                 <tr align="center">
                <td>1</td>
                <td>JUMLAH LAKA</td>
                <td>${laka[0].insiden_kecelakaan_yesterday}</td>
                <td>${laka[0].insiden_kecelakaan_today}</td>
                <td>${laka[0].angka_insiden_kecelakaan}</td>
                <td>${laka[0].persen_insiden_kecelakaan}%</td>
                <td>${laka[0].status_insiden_kecelakaan}</td>
            </tr>
            <tr align="center">
                <td>2</td>
                <td>MENINGGAL DUNIA</td>
                <td>${laka[0].meninggal_dunia_yesterday}</td>
                <td>${laka[0].meninggal_dunia_today}</td>
                <td>${laka[0].angka_meninggal_dunia}</td>
                <td>${laka[0].persen_meninggal_dunia}%</td>
                <td>${laka[0].status_meninggal_dunia}</td>
            </tr>
            <tr align="center">
                <td>3</td>
                <td>LUKA BERAT</td>
                <td>${laka[0].luka_berat_yesterday}</td>
                <td>${laka[0].luka_berat_today}</td>
                <td>${laka[0].angka_luka_berat}</td>
                <td>${laka[0].persen_luka_berat}%</td>
                <td>${laka[0].status_luka_berat}</td>
            </tr>
            <tr align="center">
                <td>4</td>
                <td>LUKA RINGAN</td>
                <td>${laka[0].luka_ringan_yesterday}</td>
                <td>${laka[0].luka_ringan_today}</td>
                <td>${laka[0].angka_luka_ringan}</td>
                <td>${laka[0].persen_luka_ringan}%</td>
                <td>${laka[0].status_luka_ringan}</td>
            </tr>
            <tr align="center">
                <td>5</td>
                <td>MATERIAL</td>
                 <td>${laka[0].kerugian_material_yesterday}</td>
                <td>${laka[0].kerugian_material_today}</td>
                <td>${laka[0].angka_kerugian_material}</td>
                <td>${laka[0].persen_kerugian_material}%</td>
                <td>${laka[0].status_kerugian_material}</td>
            </tr>
            <tr>
                <td></td>
            </tr>
            <tr>
                <td></td>
            </tr>
            <tr>
                <th colspan="7">B. LAPORAN HARIAN ANEV DATA DAKGAR</th>
            </tr>
            <tr>
                <th rowspan="2">No</th>
                <th rowspan="2">Uraian</th>
                <th colspan="2">Waktu</th>
                <th colspan="2">Trend</th>
                <th rowspan="2">Keterangan</th>
            </tr>
            <tr>
                <th>${gar[0].yesterday}</th>
                <th>${gar[0].today}</th>
                <th>ANGKA</th>
                <th>PERSEN %</th>
            </tr>
            <tr align="center">
                <td>1</td>
                <td>JUMLAH DAKGAR</td>
                <td>${gar[0].total_garlantas_yesterday}</td>
                <td>${gar[0].total_garlantas_today}</td>
                <td>${gar[0].angka_total_garlantas}</td>
                <td>${gar[0].persen_total_garlantas}%</td>
                <td>${gar[0].status_total_garlantas}</td>
            </tr>
            <tr align="center">
                <td>2</td>
                <td>GAR BERAT</td>
                <td>${gar[0].pelanggaran_berat_yesterday}</td>
                <td>${gar[0].pelanggaran_berat_today}</td>
                <td>${gar[0].angka_pelanggaran_berat}</td>
                <td>${gar[0].persen_pelanggaran_berat}%</td>
                <td>${gar[0].status_pelanggaran_berat}</td>
            </tr>
            <tr align="center">
                <td>3</td>
                <td>GAR SEDANG</td>
                <td>${gar[0].pelanggaran_sedang_yesterday}</td>
                <td>${gar[0].pelanggaran_sedang_today}</td>
                <td>${gar[0].angka_pelanggaran_sedang}</td>
                <td>${gar[0].persen_pelanggaran_sedang}%</td>
                <td>${gar[0].status_pelanggaran_sedang}</td>
            </tr>
            <tr align="center">
                <td>4</td>
                <td>GAR RINGAN</td>
                <td>${gar[0].pelanggaran_ringan_yesterday}</td>
                <td>${gar[0].pelanggaran_ringan_today}</td>
                <td>${gar[0].angka_pelanggaran_ringan}</td>
                <td>${gar[0].persen_pelanggaran_ringan}%</td>
                <td>${gar[0].status_pelanggaran_ringan}</td>
            </tr>
            <tr>
                <td></td>
            </tr>
            <tr>
                <td></td>
            </tr>
            <tr>
                <th colspan="7">C. LAPORAN HARIAN ANEV DATA TURJAGWALI</th>
            </tr>
            <tr>
            <th rowspan="2">No</th>
            <th rowspan="2">Uraian</th>
            <th colspan="2">Waktu</th>
            <th colspan="2">Trend</th>
            <th rowspan="2">Keterangan</th>
        </tr>
        <tr>
            <th>SABTU, 19-11-22</th>
            <th>MINGGU, 20-11-22</th>
            <th>ANGKA</th>
            <th>PERSEN %</th>
        </tr>
        <tr align="center">
            <td>1</td>
            <td>PENGATURAN</td>
            <td>401</td>
            <td>22</td>
            <td>4</td>
            <td>-5%</td>
            <td>TURUN</td>
        </tr>
        <tr align="center">
            <td>2</td>
            <td>PENJAGAAN</td>
            <td>807</td>
            <td>108</td>
            <td>699</td>
            <td>94%</td>
            <td>NAIK</td>
        </tr>
        <tr align="center">
            <td>3</td>
            <td>PENGAWALAN</td>
            <td>109</td>
            <td>14</td>
            <td>-95</td>
            <td>-87%</td>
            <td>TURUN</td>
        </tr>
        <tr align="center">
            <td>4</td>
            <td>PATROLI</td>
            <td>2,836</td>
            <td>102</td>
            <td>-734</td>
            <td>-6%</td>
            <td>TURUN</td>
        </tr>
        <tr>
            <td></td>
        </tr>
        <tr>
            <td></td>
        </tr>
        <tr>
            <td></td>
        </tr>
        <tr>
            <td>Jakarta, 21 November 2022</td>
        </tr>
        <tr>
            <td>Penanggung Jawab</td>
        </tr>
        <tr>
            <td>KANIT II NTMC BAG OPS KORLANTAS POLRI</td>
        </tr>
        <tr>
            <td></td>
        </tr>
        <tr>
            <td></td>
        </tr>
        <tr>
            <td></td>
        </tr>
        <tr>
            <td>Nurayno</td>
        </tr>
        <tr>
            <td>IPDA / 71090054</td>
        </tr>
        
    </table>`;

  const dom = new JSDOM(htmlString);
  const table = dom.window.document.getElementById("table1");
  return table;
};
