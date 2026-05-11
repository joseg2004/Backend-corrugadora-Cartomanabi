module.exports = ({
   cliente,
   vencido,
   vencer,
   fecha
}) => {
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
                                          <!-- <div
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
                                                src="https://drive.google.com/uc?export=view&amp;id=1oSWuYAvLWcrJQM9yyiYl2aIUjJKU2rby"
                                                style="
                                                   text-decoration: none;
                                                   -ms-interpolation-mode: bicubic;
                                                   height: auto;
                                                   border: 0;
                                                   /* width: 420px; */
                                                   width: 250px;
                                                   max-width: 100%;
                                                   display: block;
                                                "
                                                title="Confirm Password"
                                                width="393"
                                             />
                                          </div> -->
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
                                                         color: #F29000;
                                                         text-transform: uppercase;
                                                      "
                                                      ><strong
                                                         ><span style=""
                                                            ><span style=""
                                                               >ESTADO DE CUENTA</span
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
                                                         Nos permitimos adjuntar el estado de cuenta de su representada, por venta de cajas de cartón corrugado, solicitando el favor gestionar el pago de los valores vencidos a cualquiera de las cuentas abajo detalladas.
                                                         <br>

                                                         <b>Saldo vencido:</b> ${vencido} <br>
                                                         <b>Saldo por vencer:</b> ${vencer} <br>
                                                         <b>Fecha:</b> ${fecha} <br>
                                                   <div style="margin-top: 15px;">
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
                                                                     >ENTIDADES FINANCIERAS</span
                                                                  ></span
                                                               ></strong
                                                            ></span
                                                         >
                                                      </p>

                                                      <table class="tableData" style="width: 100%; margin-bottom: 15px; ">
                                                         <thead>
                                                            <tr>
                                                               <th nowrap>Proveedor</th>
                                                               <th nowrap>RUC</th>
                                                               <th nowrap>CORREO:</th>
                                                            </tr>
                                                         </thead>

                                                         <tbody>
                                                            <td nowrap>Cartonera Manabí Cartomanabi S.A.</th>
                                                            <td nowrap>1391912811001</th>
                                                            <td >glopez@cartomanabi.com</th>
                                                         </tbody>
                                                      </table>

                                                      <table class="tableData" style="width: 100%;">
                                                         <thead>
                                                            <!-- <tr>
                                                               <th nowrap colspan="3">ENTIDADES FINANCIERAS</th>
                                                            </tr> -->
                                                         </thead>
                                                         <tbody>
                                                            <tr>
                                                               <td nowrap rowspan="3" style="vertical-align: middle; font-weight: 700;"> Cuenta Corriente</th>
                                                               <td nowrap style="background-color: #fede03; font-weight: 600; color: #122660;"> BANCO PICHINCHA</th>
                                                               <td nowrap> 2100215367</th>
                                                            </tr>
                                                            <tr>
                                                               <td nowrap style="background-color: #bc157c; font-weight: 600; color: #fff;"> BANCO GUAYAQUIL</th>
                                                               <td nowrap > 0022480278</th>
                                                            </tr>
                                                            <tr>
                                                               <td nowrap style="background-color: #13879b; font-weight: 600; color: #fff;"> BANCO BOLIVARIANO</th>
                                                               <td nowrap> 0005333231</th>
                                                            </tr>
                                                         </tbody>
                                                      </table>
                                                   </div>
                                                   <br><span
                                                      style="
                                                         line-height: 1 !important;
                                                      "
                                                   >
                                                   <strong>NOTA:</strong> Si usted no es la persona indicada para tratar este tema, le ofrecemos una disculpa, y le solicitamos reenviarlo a la persona adecuada o borrar este mensaje.<br>
                                                   Este mensaje se envia con la complacencia de la nueva legislacion sobre correo electronico (R.O. 735 de 31 de diciembre de 2002, Decreto No. 3496, Articulo 22): En base de las Normativas Internacionales sobre SPAM, este E-mail no podra ser considerado SPAM mientras incluya una forma de ser removido.
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
                                                            >¡Muchas gracias!</span
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
                                                         >COPYRIGHT © 2024</strong
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