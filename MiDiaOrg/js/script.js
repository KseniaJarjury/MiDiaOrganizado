
const formularioLogin = document.getElementById("form-login");
const campoUsuario = document.getElementById("usuario");
const campoContrasena = document.getElementById("contrasena");
const mensajeLogin = document.getElementById("mensaje-login");
const seccionLogin = document.getElementById("seccion-login");
const panelTareas = document.getElementById("panel-tareas");

const usuarioEsperado = "dara";
const contrasenaEsperada = "1234";

// Inicio de sesión
formularioLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const usuario = campoUsuario.value.trim();
    const contrasena = campoContrasena.value;

    if (
        usuario === usuarioEsperado &&
        contrasena === contrasenaEsperada
    ) {
        const nombreUsuario = usuario.charAt(0).toLocaleUpperCase("es-AR") + usuario.slice(1);
        document.querySelectorAll("[data-nombre-usuario]").forEach(function (elemento) {
            elemento.textContent = nombreUsuario;
        });
        document.getElementById("inicial-usuario").textContent = nombreUsuario.charAt(0);
        document.querySelectorAll("[data-inicial-usuario]").forEach(function (elemento) {
            elemento.textContent = nombreUsuario.charAt(0);
        });
        document.getElementById("anio-actual").textContent = String(new Date().getFullYear());
        seccionLogin.classList.add("d-none");
        panelTareas.classList.remove("d-none");
    } else {
        mensajeLogin.innerHTML = `
            <div class="alert alert-danger">
                Usuario o contraseña incorrectos.
            </div>
        `;
    }
});

document.querySelectorAll("[data-cerrar-sesion]").forEach(function (boton) {
    boton.addEventListener("click", function () {
        panelTareas.classList.add("d-none");
        seccionLogin.classList.remove("d-none");
        const menuMovil = document.getElementById("nav-mobile");
        if (menuMovil.classList.contains("show")) {
            bootstrap.Collapse.getOrCreateInstance(menuMovil).hide();
        }
        campoUsuario.value = "";
        campoContrasena.value = "";
        mensajeLogin.replaceChildren();
        campoUsuario.focus();
    });
});

// Elementos del formulario de tareas
const formularioTarea = document.getElementById("form-tarea");
const campoTituloTarea = document.getElementById("titulo-tarea");
const campoDescripcionTarea = document.getElementById("descripcion-tarea");
const campoCategoriaTarea = document.getElementById("categoria-tarea");
const campoPrioridadTarea = document.getElementById("prioridad-tarea");
const listaTareas = document.getElementById("lista-tareas");
const campoBusquedaTarea = document.getElementById("buscar-tarea");
const filtroCategoriaTarea = document.getElementById("filtrar-categoria");
const filtroPrioridadTarea = document.getElementById("filtrar-prioridad");
const resumenFiltros = document.getElementById("resumen-filtros");
const enlacesNavegacion = document.querySelectorAll(".menu-principal a[href^='#']");

function actualizarNavegacionActiva(destino) {
    const destinoValido = Array.from(enlacesNavegacion).some(function (enlace) {
        return enlace.getAttribute("href") === destino;
    });

    if (!destinoValido) {
        return;
    }

    enlacesNavegacion.forEach(function (enlace) {
        const activo = enlace.getAttribute("href") === destino;
        enlace.classList.toggle("active", activo);
        enlace.classList.toggle("text-body-secondary", !activo);
    });
}

window.addEventListener("hashchange", function () {
    actualizarNavegacionActiva(window.location.hash);
});

enlacesNavegacion.forEach(function (enlace) {
    enlace.addEventListener("click", function () {
        actualizarNavegacionActiva(enlace.getAttribute("href"));

        const menuMovil = document.getElementById("nav-mobile");
        if (menuMovil.classList.contains("show")) {
            bootstrap.Collapse.getOrCreateInstance(menuMovil).hide();
        }
    });
});
const formularioEditarTarea = document.getElementById("form-editar-tarea");
const modalEditarTarea = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("modal-editar-tarea")
);
const modalConfirmarEliminacion = bootstrap.Modal.getOrCreateInstance(
    document.getElementById("modal-confirmar-eliminacion")
);
const toastTareaEliminadaElemento = document.getElementById("toast-tarea-eliminada");
const toastTareaEliminada = bootstrap.Toast.getOrCreateInstance(toastTareaEliminadaElemento, {
    autohide: false
});
let tareaEnEdicion = null;
let tareaAEliminar = null;
let tareaEliminada = null;
let indiceTareaEliminada = -1;

function escaparHTML(texto) {
    return String(texto).replace(/[&<>"']/g, function (caracter) {
        const caracteresEscapados = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return caracteresEscapados[caracter];
    });
}
const campoFechaSeleccionada = document.getElementById("fecha-seleccionada");
const fechaNuevaTarea = document.getElementById("fecha-nueva-tarea");

function obtenerFechaLocal(fecha = new Date()) {
    const anio = fecha.getFullYear();
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const dia = String(fecha.getDate()).padStart(2, "0");

    return `${anio}-${mes}-${dia}`;
}

function formatearFecha(fecha) {
    return new Date(`${fecha}T00:00:00`).toLocaleDateString("es-AR", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric"
    });
}

let fechaActual = obtenerFechaLocal();
campoFechaSeleccionada.value = fechaActual;
fechaNuevaTarea.textContent = formatearFecha(fechaActual);

campoFechaSeleccionada.addEventListener("change", function () {
    fechaActual = campoFechaSeleccionada.value || obtenerFechaLocal();
    fechaNuevaTarea.textContent = formatearFecha(fechaActual);
    mostrarTareas();
});

document.getElementById("boton-hoy").addEventListener("click", function () {
    fechaActual = obtenerFechaLocal();
    campoFechaSeleccionada.value = fechaActual;
    fechaNuevaTarea.textContent = formatearFecha(fechaActual);
    mostrarTareas();
});

campoBusquedaTarea.addEventListener("input", mostrarTareas);
filtroCategoriaTarea.addEventListener("change", mostrarTareas);
filtroPrioridadTarea.addEventListener("change", mostrarTareas);

document.getElementById("limpiar-filtros").addEventListener("click", function () {
    campoBusquedaTarea.value = "";
    filtroCategoriaTarea.value = "";
    filtroPrioridadTarea.value = "";
    filtroActual = "todas";
    mostrarTareas();
});

// Array donde guardaremos las tareas
const tareasGuardadas = localStorage.getItem("misTareas");
const tareas = tareasGuardadas ? JSON.parse(tareasGuardadas) : [];
let tareasMigradas = false;

tareas.forEach(function (tarea) {
    if (!tarea.fecha) {
        tarea.fecha = fechaActual;
        tareasMigradas = true;
    }
});

if (tareasMigradas) {
    guardarTareas();
}

const categoriasProgreso = [
    { nombre: "Estudio", color: "#8b5cf6" },
    { nombre: "Trabajo", color: "#ec4899" },
    { nombre: "Personal", color: "#14b8a6" },
    { nombre: "Hogar", color: "#f59e0b" }
];

const ordenPrioridad = {
    Alta: 0,
    Media: 1,
    Baja: 2
};

// Agregar una tarea
formularioTarea.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const nuevaTarea = {
        id: Date.now(),
        titulo: campoTituloTarea.value.trim(),
        descripcion: campoDescripcionTarea.value.trim(),
        categoria: campoCategoriaTarea.value,
        prioridad: campoPrioridadTarea.value,
        fecha: fechaActual,
        completada: false
    };

    tareas.push(nuevaTarea);
    guardarTareas();
    mostrarTareas();

    formularioTarea.reset();
});

// Mostrar las tareas en pantalla
function mostrarTareas() {
    listaTareas.innerHTML = "";

    const tareasDelDia = tareas.filter(function (tarea) {
        return tarea.fecha === fechaActual;
    });

    const textoBusqueda = campoBusquedaTarea.value.trim().toLocaleLowerCase("es");
    const tareasFiltradas = tareasDelDia.filter(function (tarea) {
        if (filtroActual === "pendientes") {
            if (tarea.completada) {
                return false;
            }
        }

        if (filtroActual === "completadas") {
            if (!tarea.completada) {
                return false;
            }
        }

        const coincideBusqueda = !textoBusqueda ||
            `${tarea.titulo} ${tarea.descripcion || ""}`.toLocaleLowerCase("es").includes(textoBusqueda);
        const coincideCategoria = !filtroCategoriaTarea.value ||
            tarea.categoria === filtroCategoriaTarea.value;
        const coincidePrioridad = !filtroPrioridadTarea.value ||
            tarea.prioridad === filtroPrioridadTarea.value;

        return coincideBusqueda && coincideCategoria && coincidePrioridad;
    });

    tareasFiltradas.sort(function (tareaA, tareaB) {
        const prioridadA = ordenPrioridad[tareaA.prioridad] ?? 3;
        const prioridadB = ordenPrioridad[tareaB.prioridad] ?? 3;
        return prioridadA - prioridadB;
    });

    document.querySelectorAll(".filtro-estado").forEach(function (boton) {
        const activo = boton.dataset.filtro === filtroActual;
        boton.classList.toggle("active", activo);
        boton.classList.toggle("btn-primary", activo);
        boton.classList.toggle("btn-outline-secondary", !activo);
        boton.setAttribute("aria-pressed", String(activo));
    });

    resumenFiltros.textContent = `Mostrando ${tareasFiltradas.length} de ${tareasDelDia.length} tareas`;

    if (tareasFiltradas.length === 0) {
        const hayFiltrosActivos = Boolean(
            textoBusqueda || filtroCategoriaTarea.value || filtroPrioridadTarea.value || filtroActual !== "todas"
        );
        const mensaje = tareasDelDia.length === 0
            ? `No hay tareas para el ${formatearFecha(fechaActual)}. ¡Agregá una para empezar!`
            : hayFiltrosActivos
                ? "No encontramos tareas con esos filtros."
                : "No hay tareas para mostrar.";

        listaTareas.innerHTML = `
            <div class="text-center text-body-secondary py-4">
                <p class="fs-2 mb-2" aria-hidden="true">${hayFiltrosActivos ? "⌕" : "✦"}</p>
                <p class="mb-0">${escaparHTML(mensaje)}</p>
            </div>
        `;
        actualizarEstadisticas();
        return;
    }

    tareasFiltradas.forEach(function (tarea) {
        const categoria = categoriasProgreso.find(function (item) {
            return item.nombre === tarea.categoria;
        });
        const colorCategoria = categoria ? categoria.color : "#a5a1b2";

        listaTareas.innerHTML += `
            <div class="card mb-3 border rounded-3 border-start border-4" style="--bs-card-bg: color-mix(in srgb, ${colorCategoria} 38%, var(--bs-tertiary-bg)); border-left-color: ${colorCategoria} !important; box-shadow: inset 0 0 24px color-mix(in srgb, ${colorCategoria} 12%, transparent), 0 0 14px color-mix(in srgb, ${colorCategoria} 20%, transparent);">
                <div class="card-body p-3 p-md-4">
                    <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                        <div class="flex-grow-1">
                            <span class="badge rounded-pill mb-2" style="color: #fff; background-color: ${colorCategoria}; box-shadow: 0 0 12px color-mix(in srgb, ${colorCategoria} 45%, transparent);">
                                ${escaparHTML(tarea.categoria)}
                            </span>
                            <h5 class="card-title mb-2 ${tarea.completada ? "text-decoration-line-through text-secondary" : ""}">
                                ${escaparHTML(tarea.titulo)}
                            </h5>
                            <div class="d-flex flex-wrap align-items-center gap-2 small text-body-secondary">
                                <span><strong>Prioridad:</strong> ${escaparHTML(tarea.prioridad)}</span>
                                <span aria-hidden="true">·</span>
                                <span>${escaparHTML(formatearFecha(tarea.fecha))}</span>
                            </div>
                        </div>
                        <span class="badge rounded-pill ${tarea.completada ? "bg-success-subtle text-success-emphasis border border-success-subtle" : "bg-warning-subtle text-warning-emphasis border border-warning-subtle"}">
                            ${tarea.completada ? "Completada" : "Pendiente"}
                        </span>
                    </div>

                    ${tarea.descripcion ? `<p class="task-description text-body-secondary small mb-3">${escaparHTML(tarea.descripcion)}</p>` : ""}

                    <div class="d-flex flex-wrap gap-2">
                        <button
                            type="button"
                            class="btn ${tarea.completada ? "btn-outline-secondary" : "btn-primary"} btn-sm rounded-pill px-3"
                            onclick="cambiarEstadoTarea(${tarea.id})"
                        >
                            ${tarea.completada ? "↩ Marcar como pendiente" : "✓ Completar tarea"}
                        </button>
                        <button
                            type="button"
                            class="btn btn-outline-primary btn-sm rounded-pill px-3"
                            onclick="editarTarea(${tarea.id})"
                        >
                            ✎ Editar
                        </button>
                        <button
                            type="button"
                            class="btn btn-outline-danger btn-sm rounded-pill px-3"
                            onclick="eliminarTarea(${tarea.id})"
                        >
                            🗑 Eliminar
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    actualizarEstadisticas();
}

// Cambiar el estado de una tarea
function cambiarEstadoTarea(id) {
    const tareaEncontrada = tareas.find(function (tarea) {
        return tarea.id === id;
    });

    if (tareaEncontrada) {
        tareaEncontrada.completada = !tareaEncontrada.completada;
        guardarTareas();
        mostrarTareas();
    }
}

function editarTarea(id) {
    tareaEnEdicion = tareas.find(function (tarea) {
        return tarea.id === id;
    });

    if (!tareaEnEdicion) {
        return;
    }

    document.getElementById("editar-titulo-tarea").value = tareaEnEdicion.titulo;
    document.getElementById("editar-descripcion-tarea").value = tareaEnEdicion.descripcion || "";
    document.getElementById("editar-categoria-tarea").value = tareaEnEdicion.categoria;
    document.getElementById("editar-prioridad-tarea").value = tareaEnEdicion.prioridad;
    document.getElementById("editar-fecha-tarea").value = tareaEnEdicion.fecha;
    modalEditarTarea.show();
}

formularioEditarTarea.addEventListener("submit", function (evento) {
    evento.preventDefault();

    if (!tareaEnEdicion) {
        return;
    }

    tareaEnEdicion.titulo = document.getElementById("editar-titulo-tarea").value.trim();
    tareaEnEdicion.descripcion = document.getElementById("editar-descripcion-tarea").value.trim();
    tareaEnEdicion.categoria = document.getElementById("editar-categoria-tarea").value;
    tareaEnEdicion.prioridad = document.getElementById("editar-prioridad-tarea").value;
    tareaEnEdicion.fecha = document.getElementById("editar-fecha-tarea").value;

    guardarTareas();
    modalEditarTarea.hide();
    tareaEnEdicion = null;
    mostrarTareas();
});

document.getElementById("modal-editar-tarea").addEventListener("hidden.bs.modal", function () {
    tareaEnEdicion = null;
});

function eliminarTarea(id) {
    const tareaEncontrada = tareas.find(function (tarea) {
        return tarea.id === id;
    });

    if (tareaEncontrada) {
        tareaAEliminar = id;
        document.getElementById("titulo-modal-eliminar").textContent =
            `¿Eliminar "${tareaEncontrada.titulo}"?`;
        modalConfirmarEliminacion.show();
    }
}

document.getElementById("confirmar-eliminar-tarea").addEventListener("click", function () {
    if (tareaAEliminar !== null) {
        const indice = tareas.findIndex(function (tarea) {
            return tarea.id === tareaAEliminar;
        });

        if (indice !== -1) {
            tareaEliminada = tareas.splice(indice, 1)[0];
            indiceTareaEliminada = indice;
            guardarTareas();
            mostrarTareas();
            document.getElementById("mensaje-tarea-eliminada").textContent =
                `"${tareaEliminada.titulo}" se eliminó.`;
            toastTareaEliminada.show();
        }

        tareaAEliminar = null;
        modalConfirmarEliminacion.hide();
    }
});

document.getElementById("modal-confirmar-eliminacion").addEventListener("hidden.bs.modal", function () {
    tareaAEliminar = null;
});

document.getElementById("deshacer-eliminacion").addEventListener("click", function () {
    if (!tareaEliminada) {
        return;
    }

    tareas.splice(indiceTareaEliminada, 0, tareaEliminada);
    tareaEliminada = null;
    indiceTareaEliminada = -1;
    guardarTareas();
    mostrarTareas();
    toastTareaEliminada.hide();
});

toastTareaEliminadaElemento.addEventListener("hidden.bs.toast", function () {
    tareaEliminada = null;
    indiceTareaEliminada = -1;
});

function actualizarEstadisticas() {
    const tareasDelDia = tareas.filter(function (tarea) {
        return tarea.fecha === fechaActual;
    });
    const total = tareasDelDia.length;

    const completadas = tareasDelDia.filter(function (tarea) {
        return tarea.completada;
    }).length;

    const pendientes = total - completadas;

    const elementoTotal = document.getElementById("total-tareas");
    const elementoPendientes = document.getElementById("tareas-pendientes");
    const elementoCompletadas = document.getElementById("tareas-completadas");

    elementoTotal.textContent = total;
    elementoPendientes.textContent = pendientes;
    elementoCompletadas.textContent = completadas;
    const porcentajeEnfoque = total === 0 ? 0 : Math.round((completadas / total) * 100);
    const barraEnfoque = document.getElementById("barra-enfoque");
    const progresoEnfoque = barraEnfoque.parentElement;
    document.getElementById("porcentaje-enfoque").textContent = `${porcentajeEnfoque}%`;
    document.getElementById("resumen-enfoque").textContent =
        `${completadas} de ${total} tareas completadas`;
    document.getElementById("mensaje-enfoque").textContent = total === 0
        ? "Elegí una tarea para empezar y avanzá a tu propio ritmo."
        : pendientes === 0
            ? "¡Lo lograste! Hoy cumpliste todo lo que te propusiste."
            : `Un paso a la vez: te ${pendientes === 1 ? "queda" : "quedan"} ${pendientes} ${pendientes === 1 ? "tarea" : "tareas"} por completar.`;
    barraEnfoque.style.width = `${porcentajeEnfoque}%`;
    progresoEnfoque.setAttribute("aria-valuenow", String(porcentajeEnfoque));
    actualizarProgreso();
    actualizarResumenPeriodos();
}

function actualizarResumenPeriodos() {
    const [anio, mes, dia] = fechaActual.split("-").map(Number);
    const fechaBase = new Date(anio, mes - 1, dia, 12);
    const diaSemana = (fechaBase.getDay() + 6) % 7;
    const inicioSemana = new Date(fechaBase);
    inicioSemana.setDate(fechaBase.getDate() - diaSemana);
    const finSemana = new Date(inicioSemana);
    finSemana.setDate(inicioSemana.getDate() + 6);
    const fechaCorta = function (fecha) {
        return fecha.toLocaleDateString("es-AR", { day: "numeric", month: "short" });
    };
    const tareasSemana = tareas.filter(function (tarea) {
        return tarea.fecha >= obtenerFechaLocal(inicioSemana) &&
            tarea.fecha <= obtenerFechaLocal(finSemana);
    });
    const completadasSemana = tareasSemana.filter(function (tarea) {
        return tarea.completada;
    }).length;

    document.getElementById("rango-semana").textContent =
        `${fechaCorta(inicioSemana)} - ${fechaCorta(finSemana)}`;
    document.getElementById("resumen-semana").textContent =
        `${completadasSemana}/${tareasSemana.length} completadas`;

    const barrasSemana = [];
    for (let indice = 0; indice < 7; indice += 1) {
        const fechaDia = new Date(inicioSemana);
        fechaDia.setDate(inicioSemana.getDate() + indice);
        const fechaDiaTexto = obtenerFechaLocal(fechaDia);
        const tareasDia = tareas.filter(function (tarea) {
            return tarea.fecha === fechaDiaTexto;
        });
        const completadasDia = tareasDia.filter(function (tarea) {
            return tarea.completada;
        }).length;
        const porcentajeDia = tareasDia.length === 0
            ? 0
            : Math.round((completadasDia / tareasDia.length) * 100);
        const nombreDia = fechaDia.toLocaleDateString("es-AR", { weekday: "short" }).replace(".", "");
        const diaActualSeleccionado = fechaDiaTexto === fechaActual;

        barrasSemana.push(`
            <div class="d-flex flex-column align-items-center justify-content-end gap-2 flex-fill h-100">
                <span class="small text-body-secondary">${porcentajeDia}%</span>
                <div
                    class="progress flex-column justify-content-end rounded-pill"
                    role="progressbar"
                    aria-label="${nombreDia}: ${completadasDia} de ${tareasDia.length} tareas completadas"
                    aria-valuemin="0"
                    aria-valuemax="100"
                    aria-valuenow="${porcentajeDia}"
                    style="height: 6rem; width: 1rem;"
                >
                    <div class="progress-bar bg-warning rounded-pill" style="width: 100%; height: ${porcentajeDia}%;"></div>
                </div>
                <span class="small ${diaActualSeleccionado ? "text-primary fw-semibold" : "text-body-secondary"} text-capitalize">
                    ${nombreDia}
                </span>
                <span class="small text-body-secondary">${completadasDia}/${tareasDia.length}</span>
            </div>
        `);
    }

    const graficoSemana = document.getElementById("progreso-semana");
    graficoSemana.innerHTML = barrasSemana.join("");
    graficoSemana.classList.remove("d-grid", "gap-2");
    graficoSemana.classList.add("d-flex", "justify-content-around", "align-items-end", "gap-2");
    graficoSemana.style.height = "10rem";

    const inicioMes = new Date(anio, mes - 1, 1, 12);
    const tareasMes = tareas.filter(function (tarea) {
        return tarea.fecha.startsWith(`${anio}-${String(mes).padStart(2, "0")}-`);
    });
    const completadasMes = tareasMes.filter(function (tarea) {
        return tarea.completada;
    }).length;
    const porcentajeMes = tareasMes.length === 0
        ? 0
        : Math.round((completadasMes / tareasMes.length) * 100);
    const anillosMes = document.getElementById("anillos-mes");
    const resumenCategoriasMes = document.getElementById("resumen-categorias-mes");
    const resumenAnillos = [];

    document.getElementById("rango-mes").textContent =
        inicioMes.toLocaleDateString("es-AR", { month: "long", year: "numeric" });
    document.getElementById("completadas-mes").textContent = completadasMes;
    document.getElementById("total-mes").textContent = tareasMes.length;
    document.getElementById("porcentaje-mes").textContent = porcentajeMes + "%";
    anillosMes.setAttribute(
        "aria-label",
        "Progreso mensual general: " + porcentajeMes + "%. " +
        categoriasProgreso.map(function (categoria) {
            const tareasCategoria = tareasMes.filter(function (tarea) {
                return tarea.categoria === categoria.nombre;
            });
            const completadasCategoria = tareasCategoria.filter(function (tarea) {
                return tarea.completada;
            }).length;
            const porcentajeCategoria = tareasCategoria.length === 0
                ? 0
                : Math.round((completadasCategoria / tareasCategoria.length) * 100);

            return `${categoria.nombre} ${porcentajeCategoria}%`;
        }).join(", ")
    );

    categoriasProgreso.forEach(function (categoria) {
        const anillo = anillosMes.querySelector(
            `.anillo-categoria[data-categoria="${categoria.nombre}"]`
        );
        const tareasCategoria = tareasMes.filter(function (tarea) {
            return tarea.categoria === categoria.nombre;
        });
        const completadasCategoria = tareasCategoria.filter(function (tarea) {
            return tarea.completada;
        }).length;
        const porcentajeCategoria = tareasCategoria.length === 0
            ? 0
            : Math.round((completadasCategoria / tareasCategoria.length) * 100);
        const radio = Number(anillo.getAttribute("r"));
        const circunferencia = 2 * Math.PI * radio;

        anillo.style.strokeDasharray = `${circunferencia}`;
        anillo.style.strokeDashoffset =
            `${circunferencia * (1 - porcentajeCategoria / 100)}`;
        anillo.setAttribute(
            "aria-label",
            `${categoria.nombre}: ${porcentajeCategoria}% completado, ${completadasCategoria} de ${tareasCategoria.length}`
        );

        resumenAnillos.push(`
            <div class="d-flex align-items-center gap-2 small">
                <span class="rounded-circle flex-shrink-0" style="width: 0.6rem; height: 0.6rem; background-color: ${categoria.color};"></span>
                <span class="text-body-secondary flex-grow-1">${categoria.nombre}</span>
                <span class="text-nowrap fw-semibold">${porcentajeCategoria}%</span>
                <span class="text-body-secondary text-nowrap">${completadasCategoria}/${tareasCategoria.length}</span>
            </div>
        `);
    });

    resumenCategoriasMes.innerHTML = resumenAnillos.join("");
}

function actualizarProgreso() {
    const tareasDelDia = tareas.filter(function (tarea) {
        return tarea.fecha === fechaActual;
    });
    const total = tareasDelDia.length;

    const completadas = tareasDelDia.filter(function (tarea) {
        return tarea.completada;
    }).length;

    let porcentaje = 0;

    if (total > 0) {
        porcentaje = Math.round((completadas / total) * 100);
    }

    const circuloProgreso = document.getElementById("circulo-progreso");
    const porcentajeProgreso = document.getElementById("porcentaje-progreso");
    const mensajeProgreso = document.getElementById("mensaje-progreso");

    circuloProgreso.style.background = `conic-gradient(var(--bs-primary) ${porcentaje}%, var(--bs-secondary-bg) ${porcentaje}% 100%)`;
    circuloProgreso.setAttribute("aria-label", porcentaje + "% de tareas completadas");
    porcentajeProgreso.textContent = porcentaje + "%";
    actualizarDistribucionCategorias();

    if (total === 0) {
        mensajeProgreso.textContent = "¡Vamos! Cada tarea completada cuenta.";
    } else if (porcentaje === 100) {
        mensajeProgreso.textContent = "¡Increíble! ¡Completaste todas tus tareas! 🎉";
    } else if (porcentaje >= 50) {
        mensajeProgreso.textContent = "¡Muy bien! Ya avanzaste más de la mitad. 💪";
    } else {
        mensajeProgreso.textContent = "¡Vamos! Cada tarea completada cuenta. ✨";
    }
}

function actualizarDistribucionCategorias() {
    const tareasDelDia = tareas.filter(function (tarea) {
        return tarea.fecha === fechaActual;
    });
    const total = tareasDelDia.length;
    const elementoTotal = document.getElementById("total-categorias");
    const elementoCirculo = document.getElementById("circulo-categorias");
    const elementoDesglose = document.getElementById("desglose-categorias");
    let gradosAcumulados = 0;
    const segmentos = [];
    const estadisticasCategorias = categoriasProgreso.map(function (categoria) {
        const cantidad = tareasDelDia.filter(function (tarea) {
            return tarea.categoria === categoria.nombre;
        }).length;

        return {
            ...categoria,
            cantidad: cantidad,
            porcentaje: total === 0 ? 0 : Math.floor((cantidad / total) * 100),
            resto: total === 0 ? 0 : ((cantidad / total) * 100) % 1
        };
    });

    if (total > 0) {
        const puntosRestantes = 100 - estadisticasCategorias.reduce(function (suma, categoria) {
            return suma + categoria.porcentaje;
        }, 0);

        estadisticasCategorias
            .slice()
            .sort(function (a, b) {
                return b.resto - a.resto;
            })
            .slice(0, puntosRestantes)
            .forEach(function (categoria) {
                estadisticasCategorias.find(function (estadistica) {
                    return estadistica.nombre === categoria.nombre;
                }).porcentaje += 1;
            });
    }

    estadisticasCategorias.forEach(function (categoria) {
        const cantidad = categoria.cantidad;

        if (cantidad > 0) {
            const gradosCategoria = (cantidad / total) * 360;
            segmentos.push(
                `${categoria.color} ${gradosAcumulados}deg ${gradosAcumulados + gradosCategoria}deg`
            );
            gradosAcumulados += gradosCategoria;
        }

    });

    elementoTotal.textContent = total;
    elementoCirculo.style.background = segmentos.length > 0
        ? `conic-gradient(${segmentos.join(", ")})`
        : "conic-gradient(var(--bs-secondary-bg) 0deg 360deg)";
    elementoCirculo.setAttribute(
        "aria-label",
        total === 0 ? "Todavía no hay tareas por categoría" : "Distribución de " + total + " tareas por categoría"
    );
    elementoDesglose.innerHTML = estadisticasCategorias.map(function (categoria) {
        const cantidad = categoria.cantidad;
        const porcentaje = categoria.porcentaje;
        const cantidadTexto = cantidad === 1 ? "tarea" : "tareas";

        return `
            <li class="d-flex align-items-center justify-content-between gap-2 border-top border-secondary-subtle py-2">
                <span class="d-flex align-items-center gap-2 text-body-secondary">
                    <span class="rounded-circle flex-shrink-0" style="width: 0.55rem; height: 0.55rem; background-color: ${categoria.color};"></span>
                    <span>${categoria.nombre}</span>
                </span>
                <span class="text-end">
                    <span class="fw-semibold">${porcentaje}%</span>
                    <span class="d-block text-body-secondary small">${cantidad} ${cantidadTexto}</span>
                </span>
            </li>
        `;
    }).join("");
}

function guardarTareas() {
    localStorage.setItem("misTareas", JSON.stringify(tareas));
}

let filtroActual = "todas";

mostrarTareas();

function filtrarTareas(filtro) {
    filtroActual = filtro;
    mostrarTareas();
}
