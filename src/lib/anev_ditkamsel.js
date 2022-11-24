const jsdom = require("jsdom");
const { JSDOM } = jsdom;
exports.tempAnevKamsel = (dikmaslantas, penyebaran) => {
  let htmlString = `<table width="70%" align="center" id="table1">
            <h3 align="center">
                Selamat Pagi Komandan Melaporkan Anev Harian Laka dan Dakgar Lantas berdasarkan Rekapitulasi 
            </h3>
            <h3 align="center">
                pada aplikasi IRSMS dan aplikasi Dakgar selama 1X24 Jam, hari Minggu, 20 November 2022 sbb : 
            </h3>
            <br>
            <tr>
                <th colspan="7">A. LAPORAN HARIAN ANEV DITKAMSEL</p>
            </tr>
            <tr>
                    <th rowspan="2">No</th>
                    <th rowspan="2">Uraian</th>
                    <th colspan="2">Waktu</th>
                    <th colspan="2">Trend</th>
                    <th rowspan="2">Keterangan</th>
                </tr>
                <tr>
                    <th>${dikmaslantas[0].yesterday}</th>
                    <th>${dikmaslantas[0].today}</th>
                    <th>ANGKA</th>
                    <th>PERSEN %</th>
                </tr>
                 <tr align="center">
                <td>1</td>
                <td>MEDIA CETAK</td>
                <td>${dikmaslantas[0].media_cetak_yesterday}</td>
                <td>${dikmaslantas[0].media_cetak_today}</td>
                <td>${dikmaslantas[0].angka_media_cetak}</td>
                <td>${dikmaslantas[0].persen_media_cetak}%</td>
                <td>${dikmaslantas[0].status_media_cetak}</td>
            </tr>
            <tr align="center">
                <td>2</td>
                <td>MEDIA ELEKTRONIK</td>
                <td>${dikmaslantas[0].media_elektronik_yesterday}</td>
                <td>${dikmaslantas[0].media_elektronik_today}</td>
                <td>${dikmaslantas[0].angka_media_elektronik}</td>
                <td>${dikmaslantas[0].persen_media_elektronik}%</td>
                <td>${dikmaslantas[0].status_media_elektronik}</td>
            </tr>
            <tr align="center">
                <td>3</td>
                <td>MEDIA SOSIAL</td>
                <td>${dikmaslantas[0].media_sosial_yesterday}</td>
                <td>${dikmaslantas[0].media_sosial_today}</td>
                <td>${dikmaslantas[0].angka_media_sosial}</td>
                <td>${dikmaslantas[0].persen_media_sosial}%</td>
                <td>${dikmaslantas[0].status_media_sosial}</td>
            </tr>
            <tr align="center">
                <td>4</td>
                <td>LAKA LANGGAR</td>
                <td>${dikmaslantas[0].laka_langgar_yesterday}</td>
                <td>${dikmaslantas[0].laka_langgar_today}</td>
                <td>${dikmaslantas[0].angka_laka_langgar}</td>
                <td>${dikmaslantas[0].persen_laka_langgar}%</td>
                <td>${dikmaslantas[0].status_laka_langgar}</td>
            </tr>
            <tr align="center">
                <td>5</td>
                <td>TOTAL DIKMASLANTAS</td>
                 <td>${dikmaslantas[0].total_dikmaslantas_yesterday}</td>
                <td>${dikmaslantas[0].total_dikmaslantas_today}</td>
                <td>${dikmaslantas[0].angka_total_dikmaslantas}</td>
                <td>${dikmaslantas[0].persen_total_dikmaslantas}%</td>
                <td>${dikmaslantas[0].status_total_dikmaslantas}</td>
            </tr>
            <tr>
                <td></td>
            </tr>
            <tr>
                <td></td>
            </tr>
            <tr>
                <th colspan="7">B. LAPORAN HARIAN ANEV DATA PENYEBARAN</th>
            </tr>
            <tr>
                <th rowspan="2">No</th>
                <th rowspan="2">Uraian</th>
                <th colspan="2">Waktu</th>
                <th colspan="2">Trend</th>
                <th rowspan="2">Keterangan</th>
            </tr>
            <tr>
                <th>${penyebaran[0].yesterday}</th>
                <th>${penyebaran[0].today}</th>
                <th>ANGKA</th>
                <th>PERSEN %</th>
            </tr>
            <tr align="center">
                <td>1</td>
                <td>SPANDUK</td>
                <td>${penyebaran[0].spanduk_yesterday}</td>
                <td>${penyebaran[0].spanduk_today}</td>
                <td>${penyebaran[0].angka_spanduk}</td>
                <td>${penyebaran[0].persen_spanduk}%</td>
                <td>${penyebaran[0].status_spanduk}</td>
            </tr>
            <tr align="center">
                <td>2</td>
                <td>GAR BERAT</td>
                <td>${penyebaran[0].leaflet_yesterday}</td>
                <td>${penyebaran[0].leaflet_today}</td>
                <td>${penyebaran[0].angka_leaflet}</td>
                <td>${penyebaran[0].persen_leaflet}%</td>
                <td>${penyebaran[0].status_leaflet}</td>
            </tr>
            <tr align="center">
                <td>3</td>
                <td>GAR SEDANG</td>
                <td>${penyebaran[0].stiker_yesterday}</td>
                <td>${penyebaran[0].stiker_today}</td>
                <td>${penyebaran[0].angka_stiker}</td>
                <td>${penyebaran[0].persen_stiker}%</td>
                <td>${penyebaran[0].status_stiker}</td>
            </tr>
            <tr align="center">
                <td>4</td>
                <td>GAR RINGAN</td>
                <td>${penyebaran[0].billboard_yesterday}</td>
                <td>${penyebaran[0].billboard_today}</td>
                <td>${penyebaran[0].angka_billboard}</td>
                <td>${penyebaran[0].persen_billboard}%</td>
                <td>${penyebaran[0].status_billboard}</td>
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
            <td></td>
        </tr>
        <tr>
            <td></td>
        </tr>
        <tr>
            <td>Jakarta, ${penyebaran[0].today}</td>
        </tr>
    </table>`;
  const dom = new JSDOM(htmlString);
  const table = dom.window.document.getElementById("table1");
  return table;
};
