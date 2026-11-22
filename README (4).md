# ÓRBITA · Sistema Solar del Tiempo

> Tu semana como sistema solar.

**Órbita** es una agenda semanal visual donde cada actividad de tu vida es un planeta y tu tiempo se organiza como un sistema solar. En lugar de una grilla fría de horarios, ves cómo se reparte tu semana alrededor de lo que más importa: el sol.

🔗 **Demo en vivo:** https://nmftstudio.github.io/agendasolar/

---

## Secciones

La app se organiza en cinco vistas, accesibles desde la barra de navegación:

| Vista | Descripción |
|-------|-------------|
| **Cielo** | Vista principal: el sistema solar con tus planetas y el estado del día. |
| **Bitácora** | Agenda del día/fecha concreta. Navegás con `‹` `›` y volvés a hoy con **Hoy**. |
| **Semana** | La *semana regular*: tu semana tipo. |
| **Planetas** | Administración de las actividades/categorías que forman tu sistema. |
| **Balance** | Resumen de cómo repartís tu tiempo entre planetas, más exportar/importar datos. |

## Conceptos clave

### Planetas
Cada planeta representa una actividad o área de tu vida (trabajo, estudio, familia, descanso, etc.). Cada uno tiene:

- **Nombre**
- **Color**
- **Va en el centro (el sol):** marcá esta opción para el planeta que ocupa el centro de tu sistema, el que organiza todo lo demás.

### Bloques
Un bloque es un tramo de tiempo asignado a un planeta. Al crear un bloque definís:

- **Actividad** (el planeta) y **título** opcional
- **Desde / Hasta** (horario)
- **Días de la semana** en que aplica
- **Fecha** y **hasta la fecha** (opcional) para acotarlo en el tiempo
- **Se repite:** No · Todos los meses · Todos los años

### Semana regular y Bitácora
- La **semana regular** es tu semana tipo.
- La **bitácora** copia esa semana a cada fecha, y ahí podés modificar días puntuales **sin tocar la semana regular**. Así los cambios de un día no rompen tu rutina base.

## Funcionalidades

- Visualización de la semana como sistema solar
- Alta, edición y eliminación de bloques
- Alta, edición y eliminación de planetas
- Bloques con repetición mensual y anual
- Navegación por fechas con acceso rápido a **Hoy**
- Balance de tiempo por planeta
- **Exportar e importar datos** para respaldar o mover tu información entre dispositivos
- Diseño oscuro (`theme-color: #05070a`) y adaptado a móviles (`viewport-fit=cover`, compatible con pantallas con notch)

## Stack

Proyecto web estático, pensado para correr sin build ni dependencias de servidor:

- HTML + CSS + JavaScript vanilla
- Hosting en GitHub Pages
- Apto para empaquetar como APK Android vía WebView

## Uso local

```bash
git clone https://github.com/nmftstudio/agendasolar.git
cd agendasolar
# abrir index.html en el navegador, o servir con cualquier servidor estático:
npx serve .
```

## Respaldo de datos

Desde **Balance** podés usar **Exportar datos** para descargar tu información y **Importar datos** para restaurarla. Conviene exportar de vez en cuando, sobre todo antes de cambiar de dispositivo o limpiar los datos del navegador.

## Estructura sugerida

```
agendasolar/
├── index.html
├── css/
├── js/
└── README.md
```

> Ajustá esta sección a la estructura real del repo.

## Roadmap

- [ ] Notificaciones / recordatorios de bloques
- [ ] Instalación como PWA
- [ ] Temas de color alternativos
- [ ] Versión APK publicada

## Créditos

Hecho por **NOMORE** · [Studio NMFT](https://nmft.ar)
