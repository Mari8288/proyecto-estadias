// Turno buttons
const turnoInput = document.getElementById("turno");
const btns = document.querySelectorAll(".turnos button");

btns.forEach(btn => {
  btn.addEventListener("click", () => {
    btns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    turnoInput.value = btn.dataset.turno;
  });
});

// Fecha por defecto hoy
const fecha = document.getElementById("fecha");
if (fecha) {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  fecha.value = `${yyyy}-${mm}-${dd}`;
}

// Envío del formulario de registro de defectos
const defectForm = document.getElementById("defectForm");
if (defectForm) {
  defectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const data = {
      tipo_defecto: document.getElementById("tipo_defecto").value,
      cantidad: parseInt(document.getElementById("cantidad").value, 10) || 0,
      linea: document.getElementById("linea").value,
      turno: document.getElementById("turno").value,
      descripcion: document.getElementById("descripcion").value,
      responsable: document.getElementById("responsable").value
    };

    try {
      const response = await fetch("http://localhost:3001/api/defects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        alert("Defecto registrado exitosamente");
        defectForm.reset();

        // Restaurar estado visual y valor oculto del turno por defecto
        document.querySelectorAll(".turnos button").forEach(b => b.classList.remove("active"));
        const btnNocturno = document.querySelector('.turnos button[data-turno="Noche"]');
        if (btnNocturno) {
          btnNocturno.classList.add("active");
          document.getElementById("turno").value = "Noche";
        }

        // Restaurar la fecha por defecto de nuevo
        const d = new Date();
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        document.getElementById("fecha").value = `${yyyy}-${mm}-${dd}`;

      } else {
        alert("Error al registrar el defecto. Intente revisar los datos.");
      }
    } catch (error) {
      console.error("Error de red:", error);
      alert("No se pudo conectar con el servidor (verifique que esté corriendo en http://localhost:3001).");
    }
  });
}
