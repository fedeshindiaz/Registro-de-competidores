var SPREADSHEET_ID = '';
var SHEET_NAME = 'Inscripciones';

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, message: 'No se recibió información para procesar.' });
    }

    var data = JSON.parse(e.postData.contents);

    if (!data.dojo || !data.organizacion || !data.departamento || !data.encargadoDojo) {
      return jsonResponse({ ok: false, message: 'Faltan datos del dojo.' });
    }

    if (!data.competidores || !Array.isArray(data.competidores) || data.competidores.length === 0) {
      return jsonResponse({ ok: false, message: 'No hay competidores para cargar.' });
    }

    var ss = getTargetSpreadsheet();
    var sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);

    var headers = [
      'Fecha envío',
      'Dojo',
      'Organización',
      'Departamento',
      'Encargado del dojo',
      'ID competidor',
      'Nombre competidor',
      'Edad',
      'Peso',
      'Sexo',
      'Grado',
      'Valor grado',
      'Código categoría',
      'Categoría asignada',
      'Estado'
    ];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
    }

    var fechaEnvio = data.fechaEnvio || new Date().toISOString();
    var rows = data.competidores.map(function(c) {
      return [
        fechaEnvio,
        data.dojo,
        data.organizacion,
        data.departamento,
        data.encargadoDojo,
        c.competidorId,
        c.nombre,
        c.edad,
        c.peso,
        c.sexo,
        c.grado,
        c.gradoValor,
        c.categoriaCodigo,
        c.categoriaNombre,
        'Enviado'
      ];
    });

    sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);

    return jsonResponse({ ok: true, message: 'Inscripción enviada correctamente' });
  } catch (error) {
    return jsonResponse({ ok: false, message: error.toString() });
  }
}

function doGet() {
  return jsonResponse({ ok: true, message: 'Endpoint de Encuentro Kyokushin Uruguay activo.' });
}

function getTargetSpreadsheet() {
  if (SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SPREADSHEET_ID);
  }

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (!ss) {
    throw new Error('No hay una Google Sheet activa. Configure SPREADSHEET_ID con el ID de la planilla destino.');
  }

  return ss;
}

function jsonResponse(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
