const emailSend = require("nodemailer");
// const hbs = require("nodemailer-express-handlebars");
const path = require("path");
const moment = require("moment");
// const { globalVariable, emailVerif } = require("../constanta/global");
// const TypeEmail = {
//   forgotPass: {
//     subject: "[LUPA PASSWORD] Akun Korlantas",
//     html: ({
//       code,
//       expired,
//     }) => `<div style="background-color:#eeeeee;margin:0!important;padding:0!important">

//     <div style="display:none;font-size:1px;color:#eeeeee;line-height:1px;font-family:Lato,Helvetica,Helvetica,sans-serif;max-height:0px;max-width:0px;opacity:0;overflow:hidden">To activate your account, please click on the button below to verify your email address.</div>

//     <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
//         <tbody>
//         <tr>
//             <td align="center" valign="top">
//                 <table align="center" border="0" cellpadding="0" cellspacing="0" class="m_-500704732933539698container" style="max-width:600px" width="100%">
//                     <tbody>

//                     <tr>
//                         <td align="center" bgcolor="#FFFFFF" valign="top">
//                             <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width:600px" width="100%">
//                                 <tbody>
//                                 <tr>
//                                     <td style="padding:40px 30px 10px;font-family:'Lato',Helvetica,sans-serif;font-size:38px;line-height:42px;color:#232333;font-weight:900;text-align:center;display:block;letter-spacing:0.01em" class="m_-500704732933539698mobile-padding">FORGOT PASSWORD</td>
//                                 </tr>
//                                 </tbody>
//                             </table>

//                             <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width:600px" width="100%">
//                                 <tbody>
//                                 <tr>
//                                     <td align="center" style="padding:0px 30px 30px 30px;display:block" valign="top" class="m_-500704732933539698mobile-padding"><img src="https://ci4.googleusercontent.com/proxy/IrLK-OmvhVWKYs8kW7c1wmjcTpDdf2F1f7U8hhbkfDXSD-ZeKk8N7KqDdy5AfzgjtEqOuSqPYfAkgW6gAIt7Q4o0OdMcMwi-d436dx0QMw-L91JM3LMfk-gfAFkMxo86KWZPVpU=s0-d-e1-ft#https://click.zoom.us/l/84442/2020-05-20/blf6y1/84442/140392/title_marker_40x8.png" style="width:100%;max-width:40px" width="40" class="CToWUd" data-bit="iit"></td>
//                                 </tr>
//                                 </tbody>
//                             </table>

//                         </td>
//                     </tr>

//                     <tr>
//                         <td class="m_-500704732933539698mobile-padding" align="center" bgcolor="#ffffff" style="padding:0px 30px 60px 30px" valign="top">
//                             <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width:600px" width="100%">
//                                 <tbody>
//                                 <tr>
//                                     <td align="center" class="m_-500704732933539698BodyCopy" style="padding-bottom:60px;font-family:'Lato',Helvetica,sans-serif;font-size:16px;line-height:24px;color:#ffffff;font-weight:400;color:#747487;letter-spacing:.01em;text-align:center"><div style="max-width:470px;margin:0 auto">To activate your account, please click on the button below to verify your email address. Once activated, you’ll have full access to Bintang Pelajar &amp; Chat.</div></td>
//                                 </tr>

//                                 <tr>
//                                     <td align="center" style="padding-bottom:30px" valign="top">
//                                         <table bgcolor="#FF5F0F" style="border-radius:3px;border-spacing:0;margin:0 auto">
//                                             <tbody>
//                                             <tr style="background:#ff5f0f">
//                                                 <td class="m_-500704732933539698mobile-cta" style="border:0 solid #ff5f0f;display:inline-block;padding:20px 45px;text-align:center;font-family:'Lato',Helvetica,sans-serif;font-size:15px;line-height:24px;color:#ffffff;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:.2em">
//                                                     ${code}</td>
//                                             </tr>
//                                             </tbody>
//                                         </table>
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td align="center" style="padding-bottom:30px" valign="top">
//                                         <table bgcolor="#FF5F0F" style="border-radius:3px;border-spacing:0;margin:0 auto">
//                                             <tbody>
//                                             <tr style="background:#ff5f0f">
//                                                 <td class="m_-500704732933539698mobile-cta" style="border:0 solid #ff5f0f;display:inline-block;padding:20px 45px;text-align:center;font-family:'Lato',Helvetica,sans-serif;font-size:15px;line-height:24px;color:#ffffff;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:.2em">
//                                                   Expired:  ${moment(
//                                                     expired
//                                                   ).format(
//                                                     "YYYY-MM-DD HH:mm:ss"
//                                                   )}</td>
//                                             </tr>
//                                             </tbody>
//                                         </table>
//                                     </td>
//                                 </tr>

//                                 <tr>
//                                     <td align="center" colspan="2" valign="top" style="padding-top:60px">
//                                         <hr style="border-bottom:#e4e4ed 5px dotted;border-width:0 0 5px 0"></td>
//                                 </tr>
//                                 </tbody>
//                             </table>
//                         </td>
//                     </tr>

//                     <tr>
//                         <td class="m_-500704732933539698mobile-padding" align="center" bgcolor="#235685" style="padding:0px 30px 100px 30px" valign="top">
//                             <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width:600px" width="100%">
//                                 <tbody>
//                                 <tr>
//                                     <td align="left" colspan="2" style="padding:70px 30px 50px 30px;font-family:'Lato',Helvetica,sans-serif;font-size:20px;line-height:24px;font-weight:700;color:#ffffff;text-align:center;text-transform:uppercase;letter-spacing:0.05em">Questions?</td>
//                                 </tr>
//                                 <tr valign="top">
//                                     <td style="text-align:center;font-size:14px!important;font-weight:normal">
//                                         <a class="m_-500704732933539698em_blue" href="https://support.zoom.us/hc/en-us" style="font-family:'Lato',Helvetica,sans-serif;font-weight:900;color:#ffffff;font-size:15px;letter-spacing:.2em;text-transform:uppercase;text-decoration:none;border-bottom:#2d8cff 0px solid;vertical-align:middle" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://support.zoom.us/hc/en-us&amp;source=gmail&amp;ust=1660018816550000&amp;usg=AOvVaw08I0y4BYNVRjskpiPBL9nt">Visit Bintang pelajar Help Center</a>&nbsp;&nbsp;&nbsp;<a class="m_-500704732933539698em_blue" href="https://support.zoom.us/hc/en-us" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://support.zoom.us/hc/en-us&amp;source=gmail&amp;ust=1660018816550000&amp;usg=AOvVaw08I0y4BYNVRjskpiPBL9nt"><img src="https://ci6.googleusercontent.com/proxy/CyItCO8pSorDJs8IltLhP3ZNQ3t-kEsIWFz3pE3cHZS-0fF0IGGv2MI98wxsu9AcTYskmpJ4zqk0EurVypNpdPoqNf62aZx4aZSx0yxY4USku3iy6hAw7I8_Qa7QJfzFEhYBNYr5-DPgIhV0=s0-d-e1-ft#https://click.zoom.us/l/84442/2020-05-06/blbhjk/84442/140350/textual_link_arrow_white.png" style="width:100%;max-width:8px;vertical-align:middle" width="8" class="CToWUd" data-bit="iit"></a>                                     </td>
//                                 </tr>

//                                 </tbody>
//                             </table>
//                         </td>
//                     </tr>

//                     <tr>
//                         <td align="center" bgcolor="#E4E4ED" valign="top">
//                             <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width:600px" width="100%">
//                                 <tbody>
//                                 <tr>
//                                     <td align="center" style="padding:30px 15px" valign="top">
//                                         <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
//                                             <tbody>
//                                             <tr>
//                                                 <td align="center" style="padding-bottom:15px" valign="top">
//                                                     <table align="center" border="0" cellpadding="0" cellspacing="0">
//                                                         <tbody>
//                                                         <tr>
//                                                             <td align="center" valign="top"><a href="https://twitter.com/zoom_us" style="text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://twitter.com/zoom_us&amp;source=gmail&amp;ust=1660018816550000&amp;usg=AOvVaw1YnbqATFrnuYd45X95I0pn"><img alt="Twitter" border="0" height="28" src="https://ci3.googleusercontent.com/proxy/D9kj-tRETJ6Ws1IHcGJBuV_EcMwhwH0k3FdJiSw7WubeSH3Ipvgd69k5SEac4QLUBMf-eTrZ0EZBS215S2cxc0Wh9U4icGFfp8BCLs42ZXY40Qca6cB34BFoxFRJvWli4-_aFDJYUw=s0-d-e1-ft#https://click.zoom.us/l/84442/2019-12-26/bfs1bv/84442/140021/Social_Twitter_2020.png" style="display:block;font-family:'Lato',Helvetica,sans-serif;font-size:9px;line-height:22px;color:#ffffff" width="28" class="CToWUd" data-bit="iit"></a></td>
//                                                             <td width="12">&nbsp;</td>
//                                                             <td align="center" valign="top"><a href="https://www.linkedin.com/company/zoom-video-communications/" style="text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.linkedin.com/company/zoom-video-communications/&amp;source=gmail&amp;ust=1660018816550000&amp;usg=AOvVaw3TWer5tMStEwkRbdZ0HzAw"><img alt="LinkedIn" border="0" height="28" src="https://ci5.googleusercontent.com/proxy/4I36_04Wc1FFlftWQQ4lMckLO9rW0U7dzvpqlm6aVcwM9K46WApxQi-Ai8VxGc96yIgnNJsJhvt5jjGB-SAmS41EC1-dxSoTuIhNARHtqHxLpH1WBSnRVtEPJP2JQsKq_B5fwLdaWY0=s0-d-e1-ft#https://click.zoom.us/l/84442/2019-12-26/bfs1bs/84442/140023/Social_LinkedIn_2020.png" style="display:block;font-family:'Lato',Helvetica,sans-serif;font-size:9px;line-height:22px;color:#ffffff" width="28" class="CToWUd" data-bit="iit"></a></td>
//                                                             <td width="12">&nbsp;</td>
//                                                             <td align="center" valign="top"><a href="https://blog.zoom.us/" style="text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://blog.zoom.us/&amp;source=gmail&amp;ust=1660018816550000&amp;usg=AOvVaw1oALHFjhzgfHtBLfL_gg-4"><img alt="Blog" border="0" height="28" src="https://ci4.googleusercontent.com/proxy/0do6_Sv_nd99Xvl8IMBPegS1T-xwuRCEHOiP3mBoQMljS-HN5aPMDPACXLIRKwY-_Tk0ky2cfDHEZpvXA0M_ao7iVZ-uqZArIbW64wD4htFCeYfiGLoSCr2mDDjhQ8y8lKYxJQ=s0-d-e1-ft#https://click.zoom.us/l/84442/2019-12-26/bfs1bx/84442/140025/Social_Blog_2020.png" style="display:block;font-family:'Lato',Helvetica,sans-serif;font-size:9px;line-height:22px;color:#ffffff" width="28" class="CToWUd" data-bit="iit"></a></td>

//                                                         </tr></tbody>
//                                                     </table>
//                                                 </td>
//                                             </tr>
//                                             <tr>
//                                                 <td align="center" class="m_-500704732933539698em_grayfooter" style="font-family:'Lato',Helvetica,sans-serif;font-size:13px;line-height:22px;color:#828282"><a href="tel:1-888-799-9666" style="text-decoration:none;color:#828282" target="_blank">+1.888.799.9666</a><br>
//                                                     © 2022 Zoom - All Rights Reserved</td>
//                                             </tr>
//                                             </tbody>
//                                         </table>
//                                     </td>
//                                 </tr>
//                                 </tbody>
//                             </table>
//                             </td>
//                     </tr>

//                     <tr>
//                         <td align="center" bgcolor="#eeeeee" valign="top">
//                             <table align="center" border="0" cellpadding="0" cellspacing="0" style="max-width:600px" width="100%">
//                                 <tbody>
//                                 <tr>
//                                     <td align="center" style="padding:30px 0 10px 0" valign="top">
//                                         <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
//                                             <tbody>
//                                             <tr>
//                                                 <td align="center" class="m_-500704732933539698em_grayfooter" style="font-family:'Lato',Helvetica,sans-serif;font-size:13px;line-height:20px;color:#969aa1">Visit <a href="https://zoom.us" style="color:#969aa1" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://zoom.us&amp;source=gmail&amp;ust=1660018816551000&amp;usg=AOvVaw0T2RZtRFfHeaWCI6sh_o2e">zoom.us</a><br>
//                                                     <a href="https://www.google.com/maps/place/55+Almaden+Blvd,+San+Jose,+CA+95113/@37.3328541,-121.897097,17z/data=!3m1!4b1!4m5!3m4!1s0x808fcca40adf3cb7:0x5a2d33d3593e0a33!8m2!3d37.3328541!4d-121.8949083" style="color:#969aa1;text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.google.com/maps/place/55%2BAlmaden%2BBlvd,%2BSan%2BJose,%2BCA%2B95113/@37.3328541,-121.897097,17z/data%3D!3m1!4b1!4m5!3m4!1s0x808fcca40adf3cb7:0x5a2d33d3593e0a33!8m2!3d37.3328541!4d-121.8949083&amp;source=gmail&amp;ust=1660018816551000&amp;usg=AOvVaw0_uS7ID7Kq2fj3_ObVtmz2">55 Almaden Blvd<br>
//                                                         San Jose, CA 95113</a></td>
//                                             </tr>
//                                             </tbody>
//                                         </table>
//                                     </td>
//                                 </tr>
//                                 <tr>
//                                     <td align="center" style="padding:0 0 40px 0" valign="top">
//                                         <table align="center" border="0" cellpadding="0" cellspacing="0" width="100%">
//                                             <tbody>
//                                             <tr>
//                                                 <td align="center" class="m_-500704732933539698em_grayfooter" style="font-family:'Lato',Helvetica,sans-serif;font-size:10px;line-height:15px;color:#969aa1">You're receiving this email because you signed up for a Zoom account.<br></td>
//                                             </tr>
//                                             </tbody>
//                                         </table>
//                                     </td>
//                                 </tr>
//                                 </tbody>
//                             </table>
//                             </td>
//                     </tr>
//                     </tbody>
//                 </table>
//                 </td>
//         </tr>
//         </tbody>
//     </table><div class="yj6qo"></div><div class="adL">
//     </div></div>`,
//   },
//   verification: {
//     subject: "[VERIFICATION] Pendaftaran K3i Umum",
//     html: ({
//       uuid,
//       email,
//       port = process.env.PORT,
//       host = process.env.HOST,
//     }) => `<html lang="en">

//     <head>
//       <meta charset="UTF-8">
//       <meta http-equiv="X-UA-Compatible" content="IE=edge">
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//       <title>aktivasiAkun</title>

//       <style>
//         .card {
//           /* Add shadows to create the "card" effect */
//           box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
//           transition: 0.3s;
//         }

//         /* On mouse-over, add a deeper shadow */
//         .card:hover {
//           box-shadow: 0 8px 16px 0 rgba(0, 0, 0, 0.2);
//         }

//         /* Add some padding inside the card container */
//         .container {
//           padding: 20px 16px;
//         }
//       </style>
//     </head>

//     <body style="background-color: grey;">

//       <div class=""
//         style=" max-width: 60%; height: 100%;display: block; margin-left: auto; margin-right: auto;background-color: white;">
//         <div class="container">

//           <p>Hai [Nama Akun LMS],</p>
//           <a href="http://localhost:3002/siswa/verification/${uuid}" style="color:#2d8cff;text-decoration:none;word-break:break-all" target="_blank">http://localhost:3002/siswa/verification/${uuid}</a>
//           <p>Tinggal selangkah lagi untuk aktifkan akun Anda! Segera aktivasi untuk dapat menggunakan Aplikasi <strong>
//               LMS-SIAP </strong> dan melakukan demo trial video pembelajaran.</p>
//           <div style="text-align: center; ">
//           <a href="${host}:${port}/v1/siswa/verification/${uuid}" style="color:#ffffff;text-decoration:none" target="_blank">Activate Account</a>
//           <a href="http://localhost:3002/v1/siswa/verification/${uuid}" target="_blank" style="background: #3ab88e 10% 10% no-repeat padding-box;
//    border: none;
//   padding : 10px;
// 	border-radius: 5px;
// 	opacity: 1;
//   color:white;
//   cursor:pointer">Aktivasi Akun </a>
//           </div>
//           <p>*Mohon abaikan pesan ini apabila Anda telah menyelesaikan proses aktivasi akun.</p>
//         </div>
//       </div>

//     </body>

//     </html>`,
//   },
// };

exports.emailSendVerif = (req, res, next, { email = null, code = "" }) =>
  // { email = null, uuid = null, type = "verification", code = "", expired = "" }
  {
    try {
      return new Promise((resolve, reject) => {
        let transporter = emailSend.createTransport({
          host: "smtp.gmail.com",
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: "develop.k3i.korlantas@gmail.com",
            pass: "vvrdbwzhvsoobjvm",
            //           email: develop.k3i.korlantas@gmail.com
            // password:dev123qwe123qwe
          },
          from: "develop.k3i.korlantas@gmail.com",
        });
        //   console.log({ uuid });
        var mailOptions = {
          from: process.env.EMAIL_SMTP,
          to: email,
          subject: "[VERIFIKASI] Pendaftaran K3i Umum",
          // html: `<center><h4>OJK MAFLO Forgot Password Verification Code</h4></center>
          html: `<center><h4>Verifikasi Kode OTP Pendaftaran K3i Umum</h4></center>
                        <p>Ini kode verifikasi anda, berlaku selama 5 menit,
                        jika tidak, kode verifikasi ini tidak akan berlaku lagi.</p>
                        <center><b><h2>${code}</h2></b></center>`,
          // from: "OJK MAFLO <mafloapps@gmail.com>",
          // to: "maulanazakaria.danu@gmail.com",
          // subject: "[OJK MAFLO] Forgot Password Verification Code",
          // html: `<center><h4>OJK MAFLO Forgot Password Verification Code</h4></center>
          //                 <p>This is your verification code, please use this code within 2 hours to reset your password,
          //                 otherwise this verification code will no longer valid.</p>
          //                 <center><b><h2>${"sssss"}</h2></b></center>`,
        };
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log({ error: error.message });
            reject(error);
          } else {
            console.log("Email sent: " + info.response);
            resolve(info);
          }
        });
      });
    } catch (error) {
      return error;
    }
  };
