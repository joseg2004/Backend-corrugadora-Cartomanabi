const permissions = {
   DESARROLLO: ['all'],
   GERENCIA: ['all'],
   CONTABILIDAD: ['all'],
   EMPAQUES: ['/bobinas', '/insumos', '/weekpaper', '/general'],
   PLANIFICACION: ['/bobinas', '/insumos', '/weekpaper', '/general'],
   PRODUCCION: ['/bobinas', '/insumos', '/weekpaper', '/general'],
   SUPERVISOR: ['/bobinas', '/insumos', '/weekpaper', '/general'],
   IMPRENTAS: ['/bobinas', '/insumos', '/weekpaper', '/general'],
   MANTENIMIENTO: ['/bobinas', '/insumos', '/weekpaper', '/general'],
   BODEGA: ['/bobinas', '/insumos', '/weekpaper', '/general'],
   IMPORTACIONES: ['/bobinas', '/generatepdf', '/upload', '/insumos', '/importacion', '/anexoscomp', '/ordrcompra', '/weekpaper', '/general'],
   LOGISTICA: ['/bobinas', '/pdfcalidad', '/generatepdf', '/insumos', '/calidad', '/weekpaper', '/general'],
   CALIDAD: ['/calidad', '/pdfcalidad', '/generatepdf', '/bobinas', '/insumos', '/weekpaper', '/general'],
   DESPACHO: ['/pdfcalidad', '/generatepdf', '/insumos', '/weekpaper', '/general', '/bobinas'],
   VENTAS: ['/pdfcalidad', '/generatepdf', '/insumos', '/cuentas', '/weekpaper', '/general'],
   'SRV. CLIENTE': ['/pdfcalidad', '/generatepdf', '/insumos', '/cuentas', '/weekpaper', '/general'],
   'null': ['/404'],
   COBRANZA:['/cuentas']
}

module.exports = permissions