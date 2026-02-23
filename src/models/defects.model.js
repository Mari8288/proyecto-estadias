const pool = require("../config/db");

exports.getAll = async () => {
  const [rows] = await pool.query(
    "SELECT * FROM defects ORDER BY fecha_registro DESC"
  );
  return rows;
};

exports.create = async (data) => {
  const { tipo_defecto, cantidad, linea, turno, descripcion, responsable } = data;

  const [result] = await pool.query(
    `INSERT INTO defects 
    (tipo_defecto, cantidad, linea, turno, descripcion, responsable)
    VALUES (?, ?, ?, ?, ?, ?)`,
    [tipo_defecto, cantidad, linea, turno, descripcion, responsable]
  );

  const [rows] = await pool.query(
    "SELECT * FROM defects WHERE id = ?",
    [result.insertId]
  );

};

exports.update = async (id, data) => {
  const { estado, cantidad } = data;

  await pool.query(
    "UPDATE defects SET estado = ?, cantidad = ? WHERE id = ?",
    [estado, cantidad, id]
  );

  const [rows] = await pool.query(
    "SELECT * FROM defects WHERE id = ?",
    [id]
  );

  return rows[0];
};