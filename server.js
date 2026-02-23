const express = require("express");
const cors = require("cors");
require("dotenv").config();

const defectsRoutes = require("./src/routes/defects.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ ok: true, message: "API Registro de Defectos funcionando ✅" });
});

// Rutas principales
app.use("/api/defects", defectsRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en: http://localhost:${PORT}`);
});