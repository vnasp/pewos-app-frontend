# Rediseño mobile-first — Fase 1: sistema de diseño, shell y pantalla Hoy

**Fecha:** 2026-08-21
**Estado:** diseño aprobado, pendiente de plan de implementación

## Problema

La PWA se ve como una plantilla genérica y su identidad visual no está en ninguna parte
declarada: **25 de los 29 archivos con JSX hardcodean `indigo-*`** y el bloque `@theme` de
`src/index.css` define cinco tokens (`primary`, `primaryLight`, `primaryDark`,
`primaryInactive`, `secondary`) que **no usa nadie**. Cambiar un color hoy significa buscar y
reemplazar en 25 archivos.

Encima hay tres problemas de producto que arrastramos:

1. El header de dos líneas obliga a **partir palabras con guion** en el código:
   `"Medica-"/"mento"`, `"Veteri-"/"narios"`, y `"Cuidado"/"Operatorios"` ni siquiera concuerda
   en número (`AppLayout.tsx:56-69`).
2. **Seis subpantallas no tienen forma de volver.** `MedicationsListScreen`,
   `ExercisesListScreen`, `CaresListScreen`, `VeterinariansListScreen`,
   `MealTimesSettingsScreen` y `TenantMembersScreen` no reciben `onNavigateBack`
   (`AppLayout.tsx:212-247`): para salir hay que tocar una pestaña, que además devuelve a la raíz.
3. Los cuatro botones de acceso rápido de Hoy **navegan a pantallas de listado** cuando su
   intención era **filtrar la lista del día por tipo de recordatorio** (`HomeScreen.tsx:200-205`).

## Alcance

Este spec cubre **solo la fase 1**. El rediseño completo son 18 pantallas y 5 componentes
compartidos: demasiado para un solo plan.

| Fase | Contenido |
|---|---|
| **1 — este spec** | Tokens, 8 primitivos, shell (`AppLayout`/`Header`/`TabBar`/`Fab`), pantalla Hoy |
| 2 | 7 pantallas de listado: Mascotas, Agenda, Medicamentos, Ejercicios, Cuidados, Veterinarios, Mi grupo |
| 3 | 7 formularios: los 6 `AddEdit*` y Horarios de comida |
| 4 | Login, Onboarding, InstallBanner |
| 5 | Desktop y tablet |

**La fase 1 deja la app entera funcionando.** Las pantallas de fases posteriores siguen usando
`indigo-*`, que pertenece a la paleta por defecto de Tailwind y no a nuestros tokens: compilan y
se ven igual que hoy. La app queda visualmente mezclada durante las fases 2-4, pero nunca rota.

**Fuera de alcance en la fase 1:** modo oscuro (la app es solo modo claro por decisión explícita),
desktop y tablet (se mantienen los `lg:` actuales funcionando, sin pulir), y el rediseño del
ícono, splash y assets de la PWA (queda anotado como pendiente, ver "Trabajo pendiente").

## Decisiones de diseño

Tomadas comparando mockups en el navegador, no en abstracto.

- **Dirección visual:** superficie blanca sobre header con degradado, hoja blanca muy redondeada,
  TabBar flotante tipo píldora, pasteles por categoría.
- **Degradado ("índigo nocturno"):** `linear-gradient(150deg, #312E81 0%, #4338CA 50%, #7C3AED 100%)`.
- **Shell:** header completo (no compacto), lista agrupada por momento del día, barra flotante
  con FAB separado.
- **Filtros:** mascota en chips sobre el degradado, tipo en píldoras con contador dentro de la
  hoja blanca. Ambos **excluyentes**.
- **Tipografía:** Manrope reemplaza a Montserrat.

## Sistema de diseño

### Tokens

Reemplazan el bloque `@theme` de `src/index.css:8-24`.

```css
@theme {
  --font-sans: "Manrope", system-ui, sans-serif;

  --color-brand:        #4338CA;
  --color-brand-dark:   #312E81;
  --color-brand-bright: #7C3AED;
  --color-brand-soft:   #EEF0FE;

  --color-ink:    #191233;
  --color-muted:  #635E75;
  --color-subtle: #9B95AB;
  --color-line:   #EFEDF5;
  --color-canvas: #F7F6FB;

  --color-med: #C2255C;         --color-med-soft: #FDECEF;
  --color-exercise: #12854E;    --color-exercise-soft: #E7F8EF;
  --color-care: #C2410C;        --color-care-soft: #FFF0EA;
  --color-appointment: #1B5FCB; --color-appointment-soft: #EAF1FE;

  --color-success: #12854E;  --color-success-soft: #E7F8EF;
  --color-danger:  #DC2626;  --color-danger-soft:  #FEE2E2;

  --radius-card:  1rem;
  --radius-sheet: 1.5rem;
  --radius-tile:  0.875rem;

  --shadow-card:  0 4px 16px rgba(30,20,70,.08);
  --shadow-float: 0 5px 22px rgba(40,20,90,.17);
  --shadow-fab:   0 6px 18px rgba(49,46,129,.45);
}

@utility bg-brand-gradient {
  background-image: linear-gradient(150deg, #312E81 0%, #4338CA 50%, #7C3AED 100%);
}
```

El degradado va como `@utility` porque un degradado de tres paradas no se puede expresar como
token de color.

`index.html` cambia el `<link>` de Google Fonts de Montserrat a **Manrope** (pesos 400/500/700/800).
Va en la fase 1: sin eso el token `--font-sans` apunta a una fuente que no está cargada.

**Cuidados pasa de rosa a naranja.** Hoy Medicamentos usa `pink-100/700` y Cuidados `rose-100/700`:
son casi el mismo color y en una lista mixta no se distinguen.

Todo par `fg`/`soft` de categoría debe alcanzar **≥ 4.5:1**; se verifica al implementar.

### Fuente de verdad de las categorías

Hoy los colores por tipo están triplicados: `constants/labels.ts` (`appointmentTypeColors`,
`exerciseTypeColors`, `careTypeColors`), `typeConfig` en `components/home/EventsList.tsx` e
`items` en `components/home/QuickAccess.tsx`.

Pasan a **un solo mapa** `src/constants/categories.ts`:

```ts
export const categoryStyles: Record<EventCategory, {
  label: string;      // "Medicamentos"
  labelShort: string; // "Medic."
  icon: LucideIcon;
  fg: string;         // clase de token: "text-med"
  soft: string;       // "bg-med-soft"
}>
```

donde `EventCategory = "medication" | "exercise" | "care" | "appointment"`.

Los mapas de `labels.ts` que asignan color **por subtipo** (`appointmentTypeColors`,
`exerciseTypeColors`, `careTypeColors`, que pintan distinto un control de una vacuna) quedan
**deprecados pero no se borran en la fase 1**: los importan cinco archivos de fases posteriores
(`ExercisesListScreen`, `AddEditExerciseScreen`, `CaresListScreen`, `AppointmentCard`,
`CalendarMonthView`) y borrarlos ahora rompería la compilación. Se eliminan al cerrar la fase 3,
cuando ya nadie los use. El color pasa a indicar la categoría, no el subtipo.

Las etiquetas de texto de `labels.ts` (`appointmentTypeLabels`, `careTypeLabels`, etc.) se
mantienen intactas — las usan pantallas de fases posteriores y el scheduler de notificaciones.

### Primitivos

En `src/components/ui/`, uno por archivo. **Solo los que la fase 1 usa de verdad** — `Button`
espera a la fase 2, donde los formularios y las listas le darán consumidores reales que definan
bien sus variantes.

| Componente | Responsabilidad | Consumidor en fase 1 |
|---|---|---|
| `Chip` | píldora de filtro con contador opcional y estado activo | filtros de mascota y de tipo |
| `Card` | superficie blanca con radio, borde y sombra de tarjeta | tarjeta de recordatorio |
| `IconBubble` | círculo de color por categoría con su icono | tarjeta de recordatorio, `AddSheet` |
| `Sheet` | hoja inferior con backdrop y cierre por backdrop o Escape | `AddSheet` |
| `EmptyState` | icono + título + texto secundario | Hoy sin recordatorios y "todo completado" |
| `Spinner` | reemplaza el `border-4 … animate-spin` repetido en 3 archivos | pantalla de carga de `App.tsx` |
| `Fab` | botón flotante circular con degradado | shell |

`Sheet` además sustituye los **9 `window.confirm`** repartidos por las pantallas. Hoy un borrado
se pregunta con el diálogo nativo, que en la PWA instalada aparece como una alerta del sistema
operativo. En la fase 1 solo se construye `Sheet` y se usa para el `AddSheet`; la migración de
los 9 `confirm` ocurre en las fases 2 y 3, cuando se toque cada pantalla.

## Shell

### `src/navigation.ts` (nuevo)

Saca de `AppLayout` lo que hoy está mezclado con el JSX:

- los tipos `Tab` y `SubScreen`
- el mapa de títulos, ahora **de una sola línea** (`"Medicamentos"`, `"Veterinarios"`,
  `"Cuidados operatorios"`) — desaparecen `title1`/`title2` y los guiones
- `addActionFor(tab, subScreen)`: qué crea el `+` en cada pantalla, hoy disperso entre
  `showAddForTab`, `showAddForSub`, `handleAdd` y `handleAddSub`

`AppLayout` queda en ~90 líneas: solo compone el shell y hace el switch de pantallas.

### `Header`

```
[← volver]  ANTETÍTULO CON LA FECHA          [icono veterinarios]
            Título en una línea
[chips de mascota — solo en Hoy]
```

- Fondo `bg-brand-gradient`, `pt-safe`, esquina inferior tapada por la hoja blanca.
- **Flecha de volver visible en toda subpantalla**, incluidas las seis que hoy no tienen salida.
  Las 7 flechas que cada formulario dibuja dentro de la hoja blanca se eliminan.
- Antetítulo: blanco al **85% de opacidad, mínimo 11px**. Al 72% sobre `#7C3AED` da 3.76:1 y no
  cumple; al 85% da 4.55:1.
- El icono de veterinarios deja de ser `/assets/vet-icon.webp` con `brightness-0 invert` y pasa a
  SVG de Lucide, como todo lo demás.

### `TabBar`

Píldora flotante blanca con `--shadow-float`, margen lateral y `env(safe-area-inset-bottom)`.
Cuatro pestañas en orden **Hoy · Agenda · Mascotas · Ajustes**: Agenda sube porque es la más
usada después de Hoy. La pestaña activa se rellena con `bg-brand-gradient`.

Los `lg:` actuales (sidebar de 96px a la izquierda) se conservan sin tocar.

### `Fab`

Circular, con degradado, sobre la esquina inferior derecha. Oculto cuando `!canWrite`.
Su acción sale de `addActionFor()`. En Hoy abre el `AddSheet`.

### Pantalla de carga de `App.tsx`

`App.tsx:31-35` pinta un `bg-indigo-600` a pantalla completa mientras resuelve la sesión: es el
primer pixel que ve la usuaria y contradiría el degradado nuevo. Pasa a `bg-brand-gradient` con
el primitivo `Spinner`. Es lo único que la fase 1 toca de `App.tsx`.

## Pantalla Hoy

### `useTodayEvents()` (nuevo, en `src/hooks/`)

Absorbe los cuatro `useMemo` de derivación que hoy viven dentro de `HomeScreen` — el filtrado de
medicamentos por intervalo mayor a 24h, cuidados por `days_of_week`, ejercicios permanentes y
citas del día. Devuelve `HomeEvent[]` ordenado por hora. `HomeScreen` baja de 230 a ~80 líneas.

### `groupByTimeOfDay()` (nuevo, en `src/utils/schedule.ts`)

- **Mañana**: `< 12:00`
- **Tarde**: `12:00` – `18:59`
- **Noche**: `≥ 19:00`

Devuelve los tres grupos en orden. Los grupos sin eventos no se dibujan.

### Filtros

Dos dimensiones, **ambas excluyentes**:

- **Mascota** — chips sobre el degradado, dentro del `Header`. Igual que hoy, se oculta si hay una
  sola mascota (`PetFilterTabs.tsx:19`).
- **Tipo** — píldoras con icono, etiqueta corta y contador, dentro de la hoja blanca. Píldora
  `Todo` al inicio.

**La mascota es la dimensión externa:** los contadores de las píldoras de tipo se recalculan
sobre los eventos ya filtrados por mascota. Al revés no.

Se mantienen el toggle de mostrar/ocultar completados y la atribución *"lo marcó Ana"*.

### `AddSheet`

Hoja inferior con cinco opciones: Medicamento, Cita veterinaria, Rutina de ejercicio, Cuidado
operatorio, Mascota. Cada una navega a su `AddEdit*`.

Es **funcionalidad nueva**: hoy Hoy no tiene botón de agregar.

### Tarjeta de recordatorio

`IconBubble` de la categoría · nombre · `mascota · hora · dato extra` · notas · atribución ·
botón de completar. Completado: opacidad reducida y tachado, como hoy.

La lista lleva `padding-bottom` suficiente para FAB + TabBar + `env(safe-area-inset-bottom)`, o
el FAB tapa la última tarjeta.

## Verificación

- `npm run build` (`tsc -b` + `vite build`) y `npm run lint` sin errores.
- **Vitest**, nuevo en el proyecto, cubriendo solo lógica pura:
  - `groupByTimeOfDay`: límites exactos `11:59` / `12:00` / `18:59` / `19:00`, lista vacía,
    grupos vacíos.
  - `useTodayEvents`: medicamento cada 48h en día que no toca, cuidado con `days_of_week` que no
    incluye hoy, ejercicio permanente sin `end_date`, medicamento con `duration_days === 0`,
    tratamiento cuyo `start_date` es futuro.
  - Sin tests de componentes ni de estilos.
- Revisión manual en el navegador: iPhone SE (375px) y Pixel (412px).

## Riesgos

1. **Contraste sobre el degradado.** El extremo `#7C3AED` da 5.73:1 con blanco puro, pero
   cualquier texto con opacidad hay que verificarlo. Regla: nada por debajo de 85% de opacidad
   sobre el degradado.
2. **El ícono y el splash quedan desalineados** durante la fase 1: siguen siendo el calendario
   violeta con huella naranja mientras la app ya es índigo nocturno. Ver "Trabajo pendiente".
3. **App visualmente mezclada** durante las fases 2-4. Es deliberado y no rompe nada, pero se ve.

## Trabajo pendiente (fuera de fase 1)

- Regenerar ícono, `apple-touch-icon`, `favicon`, splash y los `pwa-*.png`. El `theme_color` y
  el `background_color` **sí se actualizaron en la fase 1** (no dependen del arte y dejarlos en
  `#4f39f6` desentonaba con el degradado nuevo); lo que queda es el arte en sí.
- Migrar los 9 `window.confirm` a `Sheet` (fases 2 y 3).
- Borrar `appointmentTypeColors`, `exerciseTypeColors` y `careTypeColors` de `labels.ts` al
  cerrar la fase 3, cuando ya no los importe nadie.
- Construir el primitivo `Button` (fase 2, con consumidores reales).
- `AppContent` arranca con `showOnboarding` en `true` sin persistir nada (`App.tsx:26`), así que
  el onboarding aparece en **cada** arranque. Es un bug de producto, no de diseño; se resuelve en
  la fase 4, que es la que toca esa pantalla.
