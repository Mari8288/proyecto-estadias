# Quality - Registro y Análisis de Defectos

![Quality Logo](https://img.shields.io/badge/Quality-App-blue?style=for-the-badge) ![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white) ![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white) ![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white) ![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

Plataforma de panel analítico, registro y consulta histórico del control de calidad en líneas de producción.

---

## 🏗️ Arquitectura del Proyecto

El proyecto está diseñado de forma modular utilizando una arquitectura cliente-servidor clásica.
*   **Frontend**: Multi-página estática (Vanilla JavaScript, HTML5, CSS3). Se comunica con la API vía Fetch.
*   **Backend**: API RESTful construida con Node.js y Express (Arquitectura MVC).
*   **Base de Datos**: MySQL.

## 📂 Estructura de Directorios

```text
📁 Proyect Calidad/
├── 📄 index.html             # Pantalla principal (Dashboard Analítico)
├── 📄 register.html          # Formulario de captura de defectos
├── 📄 history.html           # Tabla y visor de historial con filtros
├── 📄 server.js              # Punto de entrada del servidor Node/Express
├── 📄 package.json           # Dependencias y scripts de Node.js
├── 📄 .env                   # Variables de entorno (Puerto, credenciales BD)
│
├── 📁 css/                   
│   └── 📄 style.css          # Estilos globales y sistema de diseño UI
│
├── 📁 js/                    # Logica del Cliente (Frontend)
│   ├── 📄 app.js             # Lógica de guardar y capturar de register.html
│   ├── 📄 dashboard.js       # Consumo de API y dibujo de Chart.js para index.html
│   └── 📄 history.js         # Lógica de renderizado, filtros y edición para history.html
│
└── 📁 src/                   # Lógica del Servidor (Backend)
    ├── 📁 config/            
    │   └── 📄 db.js          # Configuración de conexión y pool a MySQL (mysql2)
    ├── 📁 controllers/
    │   └── 📄 defects.controller.js  # Lógica de negocio (manejo de requests HTTP)
    ├── 📁 models/
    │   └── 📄 defects.model.js       # Consultas SQL nativas a la tabla 'defects'
    └── 📁 routes/
        └── 📄 defects.routes.js      # Definición de endpoints (/api/defects/...)
```

---

## 🚀 Flujo de Trabajo (Frontend)

1.  **Dashboard (`index.html` & `dashboard.js`)**:
    *   Carga la librería `Chart.js` y `Lucide Icons` mediante CDN.
    *   Hace un `GET /api/defects` al inicio, para procesar la estadística.
    *   Calcula Total de Defectos, Tasa de Rechazo (Pivote de 5000 uds) y graficas de Pareto, Tendencia y Turnos.
2.  **Registro (`register.html` & `app.js`)**:
    *   Botones de turnos interactivos y control de fechas por defecto.
    *   Al enviar el formulario, interrumpe el evento nativo (`e.preventDefault()`) y manda un `POST /api/defects` capturando los datos en formato JSON.
3.  **Historial (`history.html` & `history.js`)**:
    *   Realiza un `GET /api/defects` y guarda los registros para realizar filtrados híbridos lado cliente.
    *   Incluye paginación dinámica, búsqueda multi-criterio y la visualización específica por cada fila.
    *   El **Botón Editar**, procesa un modal donde las actualizaciones envían una petición `PUT /api/defects/:id` cambiando el `estado` o `cantidad` del defecto.

---

## 🗄️ Modelo de Base de Datos

La base de datos MySQL requerida usa nombre de base `registro_defectos`.
La herramienta requiere una tabla llamada `defects` con las siguientes columnas principales:

| Columna        | Tipo         | Descripción                                    |
| -------------- | ------------ | ---------------------------------------------- |
| `id`           | INT (PK, AI) | Identificador único del registro               |
| `tipo_defecto` | VARCHAR      | Categoría del defecto (Grumos, Ralladura...)   |
| `cantidad`     | INT          | Número de unidades afectadas                   |
| `linea`        | VARCHAR      | Línea donde ocurrió (Templado, Espejo...)      |
| `turno`        | VARCHAR      | Turno operativo (Matutino, Vespertino, Nocturno)|
| `descripcion`  | TEXT         | Descripción extendida opcional                 |
| `responsable`  | VARCHAR      | Empleado o usuario que hizo el registro        |
| `estado`       | VARCHAR      | 'Registrado' o 'En revisión'                   |
| `fecha_registro`| DATETIME     | Timestamp por defecto `CURRENT_TIMESTAMP`      |

---

## ⚙️ ¿Cómo ejecutar el proyecto?

1.  Asegúrate de tener un servidor MySQL local funcionando, y ejecutar las migraciones/tablas necesarias correspondientes a los credenciales de tu archivo `.env`.
2.  Instala las dependencias del servidor:
    ```bash
    npm install
    ```
3.  Inicia la API backend:
    ```bash
    npm run dev
    # ó usando node directo: node server.js
    ```
4.  Carga el proyecto FrontEnd abriendo `index.html` en un Live Server (ej. extensión de VSCode) o un servidor HTTP local.
