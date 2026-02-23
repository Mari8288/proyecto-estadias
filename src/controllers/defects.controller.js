const defectsModel = require("../models/defects.model");

exports.getAll = async (req, res) => {
  try {
    const rows = await defectsModel.getAll();
    res.json({ ok: true, data: rows });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const {
      tipo_defecto,
      cantidad,
      linea,
      turno,
      descripcion,
      responsable,
    } = req.body;

    if (!tipo_defecto || !cantidad || !linea || !turno) {
      return res.status(400).json({
        ok: false,
        message: "Faltan campos requeridos",
      });
    }

    const created = await defectsModel.create({
      tipo_defecto,
      cantidad,
      linea,
      turno,
      descripcion: descripcion || null,
      responsable: responsable || null,
    });

    res.status(201).json({
      ok: true,
      message: "Defecto registrado correctamente",
      data: created,
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, cantidad } = req.body;

    if (!estado || cantidad === undefined) {
      return res.status(400).json({
        ok: false,
        message: "Faltan campos requeridos para actualizar",
      });
    }

    const updated = await defectsModel.update(id, { estado, cantidad });

    if (!updated) {
      return res.status(404).json({
        ok: false,
        message: "Defecto no encontrado",
      });
    }

    res.json({
      ok: true,
      message: "Defecto actualizado correctamente",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
};