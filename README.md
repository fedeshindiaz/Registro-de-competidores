# Encuentro Kyokushin Uruguay

Aplicación web para cargar inscripciones de competidores por dojo. Guarda el borrador en el navegador, calcula la categoría automáticamente y envía toda la inscripción junta a Google Sheets mediante Google Apps Script.

## Requisitos

- Node.js 20 o superior.
- Una cuenta de Google con acceso a Google Sheets.
- La tabla oficial de categorías cargada en `src/data/categories.ts`.

## Instalar y correr

```bash
npm install
npm run dev
```

Luego abrir la URL que muestra Vite, normalmente `http://localhost:5173`.

## Configurar Google Sheets

1. Crear una Google Sheet nueva.
2. Renombrar la primera hoja o dejar que el script cree una hoja llamada `Inscripciones`.
3. Ir a `Extensiones > Apps Script`.
4. Pegar el contenido de `google-apps-script/Code.gs`.
5. Guardar el proyecto.
6. Ir a `Implementar > Nueva implementación`.
7. Elegir tipo `Aplicación web`.
8. En `Ejecutar como`, seleccionar el propietario del script.
9. En `Quién tiene acceso`, usar una opción que permita recibir peticiones desde la app web, por ejemplo `Cualquier usuario`.
10. Implementar y copiar la URL del despliegue.

## Variables de entorno

Crear un archivo `.env` en la raíz del proyecto:

```bash
VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/TU_DEPLOYMENT_ID/exec
```

También hay un ejemplo en `.env.example`.

## Probar una inscripción

1. Cargar los datos del dojo.
2. Cargar un competidor con nombre, edad, peso, sexo y grado.
3. Verificar que aparezca la categoría asignada en vivo.
4. Presionar `Agregar competidor`.
5. Revisar la tabla o las tarjetas en móvil.
6. Presionar `Enviar inscripción`.
7. Confirmar el envío.
8. Revisar la hoja `Inscripciones` en Google Sheets.

Si `VITE_GOOGLE_SCRIPT_URL` no está configurada, la app mostrará un error y no intentará enviar.

## Categorías

La función `assignCategory` usa:

- Sexo.
- Edad mínima y máxima.
- Peso mínimo y máximo.
- Grado mínimo y máximo.

Los kyu usan valores positivos y los dan usan valores negativos:

- `10° kyu` = `10`
- `1° kyu` = `1`
- `1° dan` = `-1`
- `4° dan o más` = `-4`

Si existe más de una categoría compatible, se prioriza la más específica por menor rango de edad, luego menor rango de peso y luego menor rango de grado.

## Build final

```bash
npm run build
```

El resultado queda en `dist/`.

## Notas de operación

- La app guarda borradores en `localStorage` con las claves `ufko_dojo_data` y `ufko_competitors_draft`.
- El envío a Google Sheets se hace solo al presionar `Enviar inscripción`.
- Luego de un envío exitoso se limpia el borrador local.
- El botón de envío queda deshabilitado mientras la petición está en curso para evitar doble envío.
- La exportación CSV es un respaldo local, no reemplaza el envío oficial.
