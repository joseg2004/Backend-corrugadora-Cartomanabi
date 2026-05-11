module.exports = ({ cliente, numAnexo, dias, linesV }) => {
   return `
      <!DOCTYPE html>
         <head>
            <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
            <meta content="width=device-width" name="viewport" />
            <meta content="IE=edge" http-equiv="X-UA-Compatible" />
            <meta name="author" content="charlsdev"/>
            <meta name="copyright" content="Copyright (c) 2023 - Cartomanabi"/>
            <title>Cartomanabi SA</title>

            <style type="text/css">
               body {
                  margin: 0;
                  padding: 0;
               }

               table,
               td,
               tr {
                  vertical-align: top;
                  border-collapse: collapse;
               }

               * {
                  line-height: inherit;
               }

               a[x-apple-data-detectors="true"] {
                  color: inherit !important;
                  text-decoration: none !important;
               }

               table.tableData {
                  border-collapse: collapse;
                  width: 100%;
               }

               table.tableData thead {
                  background-color: #88B6E2;
               }

               table.tableData td, table.tableData th {
                  border: 1px solid #dddddd;
                  text-align: left;
                  padding: 8px;
                  text-align: center;
               }
            </style>
            <style id="media-query" type="text/css">
               @media (max-width: 675px) {
                  .block-grid,
                  .col {
                     min-width: 320px !important;
                     max-width: 100% !important;
                     display: block !important;
                  }

                  .block-grid {
                     width: 100% !important;
                  }

                  .col {
                     width: 100% !important;
                  }

                  .col_cont {
                     margin: 0 auto;
                  }

                  img.fullwidth,
                  img.fullwidthOnMobile {
                     width: 100% !important;
                  }

                  .no-stack .col {
                     min-width: 0 !important;
                     display: table-cell !important;
                  }

                  .no-stack.two-up .col {
                     width: 50% !important;
                  }

                  .no-stack .col.num2 {
                     width: 16.6% !important;
                  }

                  .no-stack .col.num3 {
                     width: 25% !important;
                  }

                  .no-stack .col.num4 {
                     width: 33% !important;
                  }

                  .no-stack .col.num5 {
                     width: 41.6% !important;
                  }

                  .no-stack .col.num6 {
                     width: 50% !important;
                  }

                  .no-stack .col.num7 {
                     width: 58.3% !important;
                  }

                  .no-stack .col.num8 {
                     width: 66.6% !important;
                  }

                  .no-stack .col.num9 {
                     width: 75% !important;
                  }

                  .no-stack .col.num10 {
                     width: 83.3% !important;
                  }

                  .video-block {
                     max-width: none !important;
                  }

                  .mobile_hide {
                     min-height: 0px;
                     max-height: 0px;
                     max-width: 0px;
                     display: none;
                     overflow: hidden;
                     font-size: 0px;
                  }

                  .desktop_hide {
                     display: block !important;
                     max-height: none !important;
                  }
               }
            </style>
            <style id="icon-media-query" type="text/css">
               @media (max-width: 675px) {
                  .icons-inner {
                     text-align: center;
                  }

                  .icons-inner td {
                     margin: 0 auto;
                  }
               }
            </style>
         </head>
         <body
            class="clean-body"
            style="
               margin: 0;
               padding: 0;
               -webkit-text-size-adjust: 100%;
               background-color: #f5f5f5;
            "
         >
            <table
               bgcolor="#F5F5F5"
               cellpadding="0"
               cellspacing="0"
               class="nl-container"
               role="presentation"
               style="
                  table-layout: fixed;
                  vertical-align: top;
                  min-width: 320px;
                  border-spacing: 0;
                  border-collapse: collapse;
                  mso-table-lspace: 0pt;
                  mso-table-rspace: 0pt;
                  background-color: #f5f5f5;
                  width: 100%;
               "
               valign="top"
               width="100%"
            >
               <tbody>
                  <tr style="vertical-align: top" valign="top">
                     <td
                        style="word-break: break-word; vertical-align: top"
                        valign="top"
                     >
                        <div style="background-color: #f6f6f6">
                           <div
                              class="block-grid"
                              style="
                                 min-width: 320px;
                                 max-width: 955px;
                                 overflow-wrap: break-word;
                                 word-wrap: break-word;
                                 word-break: break-word;
                                 margin: 0 auto;
                                 background-color: #88B6E2;
                              "
                           >
                              <div
                                 style="
                                    border-collapse: collapse;
                                    display: table;
                                    width: 100%;
                                    background-color: #ffffff;
                                 "
                              >
                                 <div
                                    class="col num12"
                                    style="
                                       min-width: 320px;
                                       max-width: 655px;
                                       display: table-cell;
                                       vertical-align: top;
                                       width: 655px;
                                    "
                                 >
                                    <div
                                       class="col_cont"
                                       style="width: 100% !important"
                                    >
                                       <div
                                          style="
                                             border-top: 15px solid #f6f6f6;
                                             border-left: 0px solid transparent;
                                             border-bottom: 2px solid #F29000;
                                             border-right: 0px solid transparent;
                                             padding-top: 5px;
                                             padding-bottom: 5px;
                                             padding-right: 5px;
                                             padding-left: 5px;
                                          "
                                       >
                                          <div
                                             align="center"
                                             class="img-container center fixedwidth"
                                             style="
                                                padding-right: 10px;
                                                padding-left: 10px;
                                             "
                                          >
                                             <div
                                                style="
                                                   font-size: 1px;
                                                   line-height: 10px;
                                                "
                                             >

                                             </div>
                                             <img
                                                align="center"
                                                border="0"
                                                class="center fixedwidth"
                                                src="https://drive.google.com/uc?export=view&amp;id=1DkWgzRrHA09aL9_zhE_MJFLFn7nTLAOt"
                                                style="
                                                   text-decoration: none;
                                                   -ms-interpolation-mode: bicubic;
                                                   height: auto;
                                                   border: 0;
                                                   width: 250px;
                                                   max-width: 100%;
                                                   display: block;
                                                "
                                                width="129"
                                             />
                                             <div
                                                style="
                                                   font-size: 1px;
                                                   line-height: 10px;
                                                "
                                             >

                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>

                        <div style="background-color: #f6f6f6">
                           <div
                              class="block-grid"
                              style="
                                 min-width: 320px;
                                 max-width: 955px;
                                 overflow-wrap: break-word;
                                 word-wrap: break-word;
                                 word-break: break-word;
                                 margin: 0 auto;
                                 background-color: #ffffff;
                              "
                           >
                              <div
                                 style="
                                    border-collapse: collapse;
                                    display: table;
                                    width: 100%;
                                    background-color: #ffffff;
                                 "
                              >
                                 <div
                                    class="col num12"
                                    style="
                                       min-width: 320px;
                                       max-width: 655px;
                                       display: table-cell;
                                       vertical-align: top;
                                       width: 655px;
                                    "
                                 >
                                    <div
                                       class="col_cont"
                                       style="width: 100% !important"
                                    >
                                       <div
                                          style="
                                             border-top: 0px solid transparent;
                                             border-left: 0px solid transparent;
                                             border-bottom: 15px solid #f6f6f6;
                                             border-right: 0px solid transparent;
                                             padding-top: 15px;
                                             padding-bottom: 5px;
                                             padding-right: 25px;
                                             padding-left: 25px;
                                          "
                                       >
                                          <div
                                             align="center"
                                             class="img-container center fixedwidth"
                                             style="
                                                padding-right: 0px;
                                                padding-left: 0px;
                                                margin: 10px;
                                             "
                                          >
                                             <img
                                                align="center"
                                                alt="Image"
                                                border="0"
                                                class="center fixedwidth"
                                                src="https://drive.google.com/uc?export=view&amp;id=1-44k-vZnDTbjVRDGrhz5oaN60G1KQobz"
                                                style="
                                                   text-decoration: none;
                                                   -ms-interpolation-mode: bicubic;
                                                   height: auto;
                                                   border: 0;
                                                   /* width: 420px; */
                                                   width: 230px;
                                                   max-width: 100%;
                                                   display: block;
                                                "
                                                title="Export Aduana"
                                                width="190"
                                             />
                                          </div>
                                          <div
                                             style="
                                                color: #052d3d;
                                                font-family: Lato, Tahoma, Verdana,
                                                   Segoe, sans-serif;
                                                line-height: 1.5;
                                                padding-top: 10px;
                                                padding-right: 10px;
                                                padding-bottom: 0px;
                                                padding-left: 15px;
                                             "
                                          >
                                             <div
                                                class="txtTinyMce-wrapper"
                                                style="
                                                   font-size: 12px;
                                                   line-height: 1.5;
                                                   font-family: Lato, Tahoma, Verdana,
                                                      Segoe, sans-serif;
                                                   color: #052d3d;
                                                   mso-line-height-alt: 18px;
                                                "
                                             >
                                                <p
                                                   style="
                                                      margin: 0;
                                                      font-size: 28px;
                                                      line-height: 1.5;
                                                      text-align: center;
                                                      word-break: break-word;
                                                      mso-line-height-alt: 42px;
                                                      margin-top: 0;
                                                      margin-bottom: 0;
                                                   "
                                                >
                                                   <span
                                                      style="
                                                         font-size: 24px;
                                                         color: #88B6E2;
                                                         text-transform: uppercase;
                                                      "
                                                      ><strong
                                                         ><span style=""
                                                            ><span style=""
                                                               >ANEXO COMPENSATORIO REGISTRADO</span
                                                            ></span
                                                         ></strong
                                                      ></span
                                                   >
                                                </p>
                                             </div>
                                          </div>
                                          <div
                                             style="
                                                color: #555555;
                                                font-family: Lato, Tahoma, Verdana,
                                                   Segoe, sans-serif;
                                                line-height: 1.8;
                                                padding-top: 5px;
                                                padding-right: 10px;
                                                padding-bottom: 5px;
                                                padding-left: 10px;
                                             "
                                          >
                                             <div
                                                class="txtTinyMce-wrapper"
                                                style="
                                                   font-size: 12px;
                                                   line-height: 1.8;
                                                   font-family: Lato, Tahoma, Verdana,
                                                      Segoe, sans-serif;
                                                   color: #555555;
                                                   mso-line-height-alt: 22px;
                                                "
                                             >
                                                <p
                                                   style="
                                                      margin: 0;
                                                      text-align: justify;
                                                      line-height: 1.8;
                                                      word-break: break-word;
                                                      font-size: 17px;
                                                      mso-line-height-alt: 31px;
                                                      mso-ansi-font-size: 18px;
                                                      margin-top: 0;
                                                      margin-bottom: 0;
                                                   "
                                                >
                                                   <span
                                                      style="
                                                         font-size: 17px;
                                                         mso-ansi-font-size: 18px;
                                                      "
                                                      ><span
                                                         style="
                                                            font-size: 13px;
                                                            color: #000000;
                                                         "
                                                         >
                                                         Señores <strong>${cliente}</strong><br>
                                                         Agradecemos y valoramos enormemente la relación comercial que hemos construido y apreciamos su dedicación a la excelencia.
                                                         Nos complace adjuntarles el anexo compensatorio registrado con el detalle de sus facturas correspondientes: <br>

                                                         <b># Anexo:</b> ${numAnexo} <br>
                                                         <b>Dias restantes para aceptar:</b> ${dias} <br>
                                                         <b>*</b> En caso de haber aceptado el anexo no hacer caso al presente correo. <br> <br>

                                                         <div>
                                                            <p
                                                               style="
                                                                  margin: 0;
                                                                  font-size: 20px;
                                                                  line-height: 1.5;
                                                                  text-align: center;
                                                                  word-break: break-word;
                                                                  mso-line-height-alt: 42px;
                                                                  margin-top: 0;
                                                                  margin-bottom: 0;
                                                               "
                                                            >
                                                               <span
                                                                  style="
                                                                     font-size: 20px;
                                                                     color: #F29000;
                                                                     text-transform: uppercase;
                                                                     margin-bottom: 15px;
                                                                  "
                                                                  ><strong
                                                                     ><span style=""
                                                                        ><span style=""
                                                                           >FACTURAS</span
                                                                        ></span
                                                                     ></strong
                                                                  ></span
                                                               >
                                                            </p>
                                                         </div>

                                                         <div>
                                                            <table class="tableData" style="width: 100%;">
                                                               <thead>
                                                                  <tr>
                                                                     <th nowrap>#</th>
                                                                     <th nowrap>Factura</th>
                                                                     <th nowrap>Fecha</th>
                                                                     <th nowrap>Descripcion</th>
                                                                     <th nowrap>Cantidad</th>
                                                                  </tr>
                                                               </thead>

                                                               <tbody>${linesV}</tbody>
                                                            </table>
                                                         </div>

                                                            <span style="line-height: 1 !important; font-style: italic !important;">
                                                               <br>En caso de que tengan alguna pregunta o requieran información adicional sobre el anexo, no duden en ponerse en contacto con nuestra dedicada representante de importación, la <b>Ing. Jeniffer Bravo</b> o con su vendedor, estarán encantados de atender sus consultas y proporcionar cualquier detalle adicional que puedan necesitar. Pueden contactarla a través de la dirección de correo electrónico <b><a href="mailto:jbravo@cartomanabi.com">jbravo@cartomanabi.com</a></b> o por teléfono al <b><a href="tel:+59355000555,1013">+593 55 000 555 Ext.1013</a></b>.
                                                            </span>
                                                               <br>Esperamos continuar fortaleciendo nuestra relación comercial en el futuro y deseamos mantener esta asociación fructífera durante muchos años más.
                                                               <br>Gracias por su confianza en nosotros y por ser parte fundamental de nuestro éxito.
                                                            </span
                                                      ></span
                                                   ><br><br><span
                                                      style="
                                                         line-height: 1 !important;
                                                         font-style: italic !important;
                                                         font-size: 13px;
                                                      "
                                                   >
                                                   <strong>NOTA:</strong>
                                                   <br> En caso de haber aceptado el anexo no hacer caso al presente correo.
                                                   <br> En caso de tener una nota de crédito parcial se ha descontado en el detalle de la factura.
                                                   </span>
                                                </p>
                                                <p
                                                   style="
                                                      padding-top: 5px;
                                                      margin: 0;
                                                      font-size: 18px;
                                                      text-align: center;
                                                      line-height: 1.8;
                                                      word-break: break-word;
                                                      margin-top: 0;
                                                      margin-bottom: 0;
                                                   "
                                                >
                                                   <span style="font-size: 18px"
                                                      ><strong
                                                         ><span style="color: #000000"
                                                            >Muchas gracias!</span
                                                         ></strong
                                                      ></span
                                                   >
                                                </p>
                                             </div>
                                          </div>

                                          <table
                                             border="0"
                                             cellpadding="0"
                                             cellspacing="0"
                                             class="divider"
                                             role="presentation"
                                             style="
                                                table-layout: fixed;
                                                vertical-align: top;
                                                border-spacing: 0;
                                                border-collapse: collapse;
                                                mso-table-lspace: 0pt;
                                                mso-table-rspace: 0pt;
                                                min-width: 100%;
                                                -ms-text-size-adjust: 100%;
                                                -webkit-text-size-adjust: 100%;
                                             "
                                             valign="top"
                                             width="100%"
                                          >
                                             <tbody>
                                                <tr
                                                   style="vertical-align: top"
                                                   valign="top"
                                                >
                                                   <td
                                                      class="divider_inner"
                                                      style="
                                                         word-break: break-word;
                                                         vertical-align: top;
                                                         min-width: 100%;
                                                         -ms-text-size-adjust: 100%;
                                                         -webkit-text-size-adjust: 100%;
                                                         padding-top: 10px;
                                                         padding-right: 10px;
                                                         padding-bottom: 10px;
                                                         padding-left: 10px;
                                                      "
                                                      valign="top"
                                                   >
                                                      <table
                                                         align="center"
                                                         border="0"
                                                         cellpadding="0"
                                                         cellspacing="0"
                                                         class="divider_content"
                                                         height="0"
                                                         role="presentation"
                                                         style="
                                                            table-layout: fixed;
                                                            vertical-align: top;
                                                            border-spacing: 0;
                                                            border-collapse: collapse;
                                                            mso-table-lspace: 0pt;
                                                            mso-table-rspace: 0pt;
                                                            border-top: 1px dotted
                                                               #c4c4c4;
                                                            height: 0px;
                                                            width: 70%;
                                                         "
                                                         valign="top"
                                                         width="70%"
                                                      >
                                                         <tbody>
                                                            <tr
                                                               style="
                                                                  vertical-align: top;
                                                               "
                                                               valign="top"
                                                            >
                                                               <td
                                                                  height="0"
                                                                  style="
                                                                     word-break: break-word;
                                                                     vertical-align: top;
                                                                     -ms-text-size-adjust: 100%;
                                                                     -webkit-text-size-adjust: 100%;
                                                                  "
                                                                  valign="top"
                                                               >
                                                                  <span></span>
                                                               </td>
                                                            </tr>
                                                         </tbody>
                                                      </table>
                                                   </td>
                                                </tr>
                                             </tbody>
                                          </table>
                                          <div
                                             style="
                                                color: #555555;
                                                font-family: Lato, Tahoma, Verdana,
                                                   Segoe, sans-serif;
                                                line-height: 1.8;
                                                padding-top: 0px;
                                                padding-right: 10px;
                                                padding-bottom: 0px;
                                                padding-left: 10px;
                                             "
                                          >
                                             <div
                                                class="txtTinyMce-wrapper"
                                                style="
                                                   font-size: 12px;
                                                   line-height: 1.8;
                                                   font-family: Lato, Tahoma, Verdana,
                                                      Segoe, sans-serif;
                                                   color: #555555;
                                                   mso-line-height-alt: 22px;
                                                "
                                             >
                                                <p
                                                   style="
                                                      margin: 0;
                                                      text-align: center;
                                                      font-size: 12px;
                                                      line-height: 1.8;
                                                      word-break: break-word;
                                                      mso-line-height-alt: 22px;
                                                      margin-top: 0;
                                                      margin-bottom: 0;
                                                   "
                                                >
                                                   <span style="font-size: 12px"
                                                      ><strong
                                                         >CARTOMANABI S.A.</strong
                                                      ></span
                                                   >
                                                </p>
                                                <p
                                                   style="
                                                      margin: 0;
                                                      text-align: center;
                                                      font-size: 12px;
                                                      line-height: 1.8;
                                                      word-break: break-word;
                                                      mso-line-height-alt: 22px;
                                                      margin-top: 0;
                                                      margin-bottom: 0;
                                                   "
                                                >
                                                   <span style="font-size: 12px"
                                                      >
                                                         <strong>MONTECRISTI - MANTA - ECUADOR</strong
                                                      ></span
                                                   >
                                                </p>
                                             </div>
                                          </div>

                                          <div
                                             style="
                                                color: #555555;
                                                font-family: Lato, Tahoma, Verdana,
                                                   Segoe, sans-serif;
                                                line-height: 1.8;
                                                padding-top: 0px;
                                                padding-right: 10px;
                                                padding-bottom: 10px;
                                                padding-left: 10px;
                                             "
                                          >
                                             <div
                                                class="txtTinyMce-wrapper"
                                                style="
                                                   font-size: 12px;
                                                   line-height: 1.8;
                                                   font-family: Lato, Tahoma, Verdana,
                                                      Segoe, sans-serif;
                                                   color: #da8013;
                                                   mso-line-height-alt: 22px;
                                                "
                                             >
                                                <p
                                                   style="
                                                      margin: 0;
                                                      text-align: center;
                                                      font-size: 12px;
                                                      line-height: 1.8;
                                                      word-break: break-word;
                                                      mso-line-height-alt: 22px;
                                                      margin-top: 0;
                                                      margin-bottom: 0;
                                                   "
                                                >
                                                   <span style="font-size: 12px"
                                                      ><strong
                                                         >COPYRIGHT © 2023</strong
                                                      ></span
                                                   >
                                                   <br>
                                                   <span style="font-size: 12px"
                                                      ><strong
                                                         >Sistemas CM</strong
                                                      ></span
                                                   >
                                                </p>
                                             </div>
                                          </div>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </td>
                  </tr>
               </tbody>
            </table>
         </body>
      </html>
   `
}