// js/history.js
// UI funcional (sin BD): filtros + tabla + paginación + botones Ver/Editar

const state = {
  all: [],
  filtered: [],
  page: 1,
  pageSize: 5,
};

const $ = (sel) => document.querySelector(sel);

// Inputs
const qInput = $("#q");
const lineaSel = $("#linea");
const turnoSel = $("#turno");
const tipoSel = $("#tipo");
const desdeInput = $("#desde");
const hastaInput = $("#hasta");

// Buttons
const btnBuscar = $("#btnBuscar");
const btnLimpiar = $("#btnLimpiar");
const btnPrev = $("#btnPrev");
const btnNext = $("#btnNext");

// UI targets
const tbody = $("#tbody");
const totalChip = $("#totalChip");
const statusText = $("#statusText");

function normalize(s) {
  return String(s ?? "").toLowerCase().trim();
}

function inRangeDate(dateStr, desde, hasta) {
  // dateStr yyyy-mm-dd
  if (!dateStr) return false;
  const d = new Date(dateStr + "T00:00:00");
  if (desde) {
    const ds = new Date(desde + "T00:00:00");
    if (d < ds) return false;
  }
  if (hasta) {
    const hs = new Date(hasta + "T23:59:59");
    if (d > hs) return false;
  }
  return true;
}

function applyFilters() {
  const q = normalize(qInput.value);
  const linea = lineaSel.value;
  const turno = turnoSel.value;
  const tipo = tipoSel.value;
  const desde = desdeInput.value;
  const hasta = hastaInput.value;

  let rows = [...state.all];

  if (q) {
    rows = rows.filter((r) => {
      const blob = normalize(
        `${r.id} ${r.fecha} ${r.linea} ${r.turno} ${r.tipo_defecto} ${r.cantidad} ${r.responsable} ${r.estado}`
      );
      return blob.includes(q);
    });
  }

  if (linea) rows = rows.filter((r) => r.linea === linea);
  if (turno) rows = rows.filter((r) => r.turno === turno);
  if (tipo) rows = rows.filter((r) => r.tipo_defecto === tipo);

  if (desde || hasta) {
    rows = rows.filter((r) => inRangeDate(r.fecha, desde, hasta));
  }

  state.filtered = rows;
  state.page = 1; // reset
}

function paginate(rows) {
  const start = (state.page - 1) * state.pageSize;
  return rows.slice(start, start + state.pageSize);
}

function render() {
  const rows = state.filtered.length ? state.filtered : state.all;
  const total = rows.length;

  // total chip
  totalChip.textContent = `Total: ${total}`;

  // pagination
  const maxPage = Math.max(1, Math.ceil(total / state.pageSize));
  if (state.page > maxPage) state.page = maxPage;

  const pageRows = paginate(rows);

  // table rows
  tbody.innerHTML = "";
  pageRows.forEach((r) => {
    const estadoClass = r.estado === "Registrado" ? "ok" : "warn";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>#${String(r.id).padStart(3, "0")}</td>
      <td>${r.fecha}</td>
      <td>${r.linea}</td>
      <td><span class="pill">${r.turno}</span></td>
      <td>${r.tipo_defecto}</td>
      <td>${r.cantidad}</td>
      <td>${r.responsable ?? ""}</td>
      <td><span class="pill ${estadoClass}">${r.estado}</span></td>
      <td style="text-align:right;">
        <div class="actions">
          <button class="iconbtn" data-action="view" data-id="${r.id}" title="Ver">👁️</button>
          <button class="iconbtn" data-action="edit" data-id="${r.id}" title="Editar">✏️</button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // footer text
  const from = total === 0 ? 0 : (state.page - 1) * state.pageSize + 1;
  const to = Math.min(total, state.page * state.pageSize);
  statusText.textContent = `Mostrando ${from}–${to} de ${total}  ·  Página ${state.page}/${maxPage}`;

  // enable/disable buttons
  btnPrev.disabled = state.page <= 1;
  btnNext.disabled = state.page >= maxPage;
}

function clearFilters() {
  qInput.value = "";
  lineaSel.value = "";
  turnoSel.value = "";
  tipoSel.value = "";
  desdeInput.value = "";
  hastaInput.value = "";
  state.filtered = [];
  state.page = 1;
}

function showModal(title, content) {
  // Modal simple sin librerías
  const overlay = document.createElement("div");
  overlay.style.cssText = `
    position:fixed; inset:0; background:rgba(0,0,0,.55);
    display:grid; place-items:center; z-index:9999; padding:18px;
  `;

  const box = document.createElement("div");
  box.style.cssText = `
    width:min(720px, 100%);
    border-radius:18px;
    border:1px solid rgba(148,163,184,.18);
    background: rgba(15,23,42,.92);
    color:#e2e8f0;
    box-shadow: 0 18px 60px rgba(0,0,0,.35);
    overflow:hidden;
  `;

  box.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 16px; border-bottom:1px solid rgba(148,163,184,.14);">
      <div style="font-weight:900;">${title}</div>
      <button id="closeModal" class="iconbtn" title="Cerrar">✖️</button>
    </div>
    <div style="padding:16px;">
      ${content}
    </div>
  `;

  overlay.appendChild(box);
  document.body.appendChild(overlay);

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });
  box.querySelector("#closeModal").addEventListener("click", () => overlay.remove());
}

// Events
btnBuscar.addEventListener("click", () => {
  applyFilters();
  render();
});

btnLimpiar.addEventListener("click", () => {
  clearFilters();
  render();
});

btnPrev.addEventListener("click", () => {
  state.page -= 1;
  render();
});

btnNext.addEventListener("click", () => {
  state.page += 1;
  render();
});

// Enter key to search
[qInput, desdeInput, hastaInput].forEach((el) => {
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      applyFilters();
      render();
    }
  });
});

// Delegation for Ver/Editar
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;

  const id = Number(btn.dataset.id);
  const action = btn.dataset.action;
  const row = state.all.find((r) => r.id === id);
  if (!row) return;

  if (action === "view") {
    showModal(
      `Detalle del registro #${String(row.id).padStart(3, "0")}`,
      `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <div><small>Fecha</small><div>${row.fecha}</div></div>
          <div><small>Estado</small><div>${row.estado}</div></div>
          <div><small>Línea</small><div>${row.linea}</div></div>
          <div><small>Turno</small><div>${row.turno}</div></div>
          <div><small>Tipo</small><div>${row.tipo_defecto}</div></div>
          <div><small>Cantidad</small><div>${row.cantidad}</div></div>
          <div style="grid-column:1/-1;"><small>Responsable</small><div>${row.responsable ?? ""}</div></div>
        </div>
      `
    );
  }

  if (action === "edit") {
    showModal(
      `Editar (UI) #${String(row.id).padStart(3, "0")}`,
      `
        <div style="height:10px"></div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px;">
          <label class="field">
            <span class="label">Estado</span>
            <select id="editEstado" class="select">
              <option ${row.estado === "Registrado" ? "selected" : ""}>Registrado</option>
              <option ${row.estado === "En revisión" ? "selected" : ""}>En revisión</option>
            </select>
          </label>
          <label class="field">
            <span class="label">Cantidad</span>
            <input id="editCantidad" class="input" type="number" min="0" value="${row.cantidad}">
          </label>
           <div style="grid-column:1/-1; display:flex; justify-content:flex-end; gap:10px; margin-top:6px;">
            <button id="saveEdit" class="btn">Guardar Cambios</button>
          </div>
        </div>
      `
    );

    // Hook save inside latest modal
    setTimeout(() => {
      const saveBtn = document.getElementById("saveEdit");
      if (!saveBtn) return;

      saveBtn.addEventListener("click", async () => {
        const estado = document.getElementById("editEstado").value;
        const cantidad = Number(document.getElementById("editCantidad").value);

        try {
          const res = await fetch(`http://localhost:3001/api/defects/${row.id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ estado, cantidad })
          });

          const json = await res.json();
          if (json.ok) {
            row.estado = estado;
            row.cantidad = Number.isFinite(cantidad) ? cantidad : row.cantidad;

            // Re-aplica filtros actuales y re-render
            applyFilters();
            render();

            // Cierra modal
            document.querySelector("div[style*='z-index:9999']")?.remove();
          } else {
            alert("Error al actualizar: " + (json.message || "Desconocido"));
          }
        } catch (err) {
          console.error("Error updating defect:", err);
          alert("Error de conexión al guardar cambios");
        }
      });
    }, 0);
  }
});

async function fetchHistory() {
  try {
    const res = await fetch("http://localhost:3001/api/defects");
    const json = await res.json();
    if (json.ok && Array.isArray(json.data)) {
      state.all = json.data.map(item => ({
        id: item.id,
        fecha: item.fecha_registro ? item.fecha_registro.substring(0, 10) : "",
        linea: item.linea,
        turno: item.turno,
        tipo_defecto: item.tipo_defecto,
        cantidad: item.cantidad,
        responsable: item.responsable,
        estado: item.estado || "Registrado",
        descripcion: item.descripcion || ""
      }));
    }
  } catch (err) {
    console.error("Error fetching history:", err);
  }
  applyFilters();
  render();
}

// Init
fetchHistory();