# ÓRBITA · Sistema Solar del Tiempo

> Tu semana como sistema solar.

**Órbita** es una agenda semanal que convierte tu tiempo en un sistema solar animado. Cada actividad de tu vida es un **planeta**, y su tamaño depende de cuántas horas le dedicás. La actividad más importante va al **centro, como el sol**, y todo lo demás gira a su alrededor.

Planificás una semana tipo, la app la proyecta a cada fecha, y la **bitácora** registra lo que realmente pasó cada día. Todo funciona offline, sin cuentas y sin servidor: tus datos quedan en tu dispositivo.

🔗 **Demo:** https://nmftstudio.github.io/agendasolar/

---

## Cómo funciona

### Planetas
Cada planeta es una actividad o área de tu vida, con **nombre**, **color** y la opción **"Va en el centro (el sol)"**. Solo uno puede ser el sol. En la pestaña *Planetas* ves cuántas horas tiene cada uno en el período elegido.

### Semana regular
Tu **semana tipo**, de lunes a domingo, armada con bloques horarios. Es la base de todo: la bitácora la copia a cada fecha futura.

### Bitácora
Es la agenda de fechas concretas. Cada día puede estar en uno de estos estados:

- **Sigue la semana regular:** mientras no lo toques, refleja los cambios de la semana tipo.
- **Día personalizado (`•`):** si agregás o cambiás un bloque, el día deja de seguir la semana regular. Podés volver con *Volver a la semana regular*.
- **Registrado:** cuando pasa un día, queda guardado tal como estaba planificado. Si hiciste otra cosa, tocás el bloque y lo corregís; el día se marca como **corregido (`✎`)**.

Las fechas anteriores al inicio de uso de la bitácora no cuentan en el balance, pero podés cargarlas a mano.

### Bloques
Un bloque asigna un tramo horario a un planeta, con título opcional (hasta 40 caracteres).

- **Se hace lugar solo:** un bloque nuevo recorta o reemplaza lo que haya en ese horario.
- **Cruza la medianoche:** si "Hasta" es anterior a "Desde", el bloque continúa en el día siguiente.
- **Huecos:** los tramos libres de 15 minutos o más aparecen como "Sin asignar" y se completan con un toque.
- **Semana regular:** podés aplicar un bloque a varios días a la vez.
- **Bitácora:** podés elegir una fecha, un rango (*hasta la fecha*) o hacerlo **repetir todos los meses o todos los años**. Los eventos repetidos no pueden abarcar varios días ni cruzar la medianoche.

### Sueño
Existe un planeta de **Sueño nocturno** con una línea de resumen por día ("Noche anterior: 23:00 → 07:00 · 8 h") y un acceso rápido para registrar o corregir el sueño.

## Pestañas

| Pestaña | Qué hace |
|---------|----------|
| **Cielo** | Sistema solar animado en `canvas`, bloque "Ahora / luego" en tiempo real y leyenda con horas por planeta. |
| **Bitácora** | Agenda por fecha, navegación semanal, selector de fecha y botón **Hoy**. |
| **Semana** | Edición de la semana regular, día por día. |
| **Planetas** | Alta, edición y baja de planetas. |
| **Balance** | Barras de reparto por planeta, gráfico apilado por día o mes y respaldo de datos. |

Cielo y Balance se pueden ver por **Semana, Mes o Año**, con navegación entre períodos.

## Funcionalidades

- Sistema solar animado: órbitas elípticas, tamaño de planeta según las horas, estrellas titilantes y estrellas fugaces. Respeta `prefers-reduced-motion`.
- Bloque **"Ahora"** que se actualiza cada segundo y muestra la actividad actual y la siguiente.
- Número de **semana ISO** y fecha actual en el encabezado.
- Balance con porcentaje de tiempo por planeta, incluyendo "Sin asignar".
- **Exportar / importar** respaldo en JSON (`orbita-AAAA-MM-DD.json`). La importación valida y limpia el archivo, y rechaza los que no son de Órbita.
- Migración automática desde versiones anteriores de los datos (`orbita.v4`).
- Interfaz oscura, mobile-first, con barra de pestañas inferior en móvil y superior en escritorio. Soporta pantallas con notch.

## Datos y privacidad

Todo se guarda en `localStorage` bajo la clave `orbita.v5`. No hay backend, cuentas ni seguimiento.

> ⚠️ Al ser `localStorage`, borrar los datos del navegador borra tu agenda. Usá **Exportar datos** (pestaña *Balance*) para hacer respaldos, sobre todo antes de cambiar de dispositivo.

Al abrir la app por primera vez se carga una **semana de ejemplo** con planetas y bloques de muestra. Podés editarlos o borrarlos libremente.

## Stack

- HTML, CSS y JavaScript **vanilla** (sin frameworks ni build)
- `canvas` 2D para el sistema solar
- `<dialog>` nativo para los editores
- Hosting estático en GitHub Pages; apto para empaquetar como APK Android vía WebView

## Estructura

```
agendasolar/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── app.js
└── README.md
```

## Uso local

```bash
git clone https://github.com/nmftstudio/agendasolar.git
cd agendasolar
npx serve .   # o abrir index.html directamente en el navegador
```

## Modelo de datos (resumen)

```jsonc
{
  "activities": [{ "id", "name", "color", "center" }],  // planetas
  "tpl":  [{ "d", "s", "e", "a", "t" }],                // semana regular (d: 0=lun … 6=dom, s/e en minutos)
  "days": { "AAAA-MM-DD": [{ "s", "e", "a", "t" }] },   // días personalizados o ya registrados
  "rec":  [{ "k": "m|y", "m", "dd", "s", "e", "a", "t" }], // eventos que se repiten
  "frozen": "AAAA-MM-DD",  // último día ya registrado
  "fix":  { "AAAA-MM-DD": 1 }, // días corregidos a mano
  "start": "AAAA-MM-DD",   // inicio de la bitácora
  "v": 6
}
```

## Créditos

Hecho por **NOMORE** · [Studio NMFT](https://nmft.ar)
