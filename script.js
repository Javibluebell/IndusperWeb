document.addEventListener("DOMContentLoaded", () => {

  const fadeElements = document.querySelectorAll(".fade-in, .fade-in-two");

  const observerOptions = {
    root: null,         // Usa el viewport del navegador
    threshold: 0.15,    // Se activa cuando el 15% del elemento es visible
    rootMargin: "0px 0px -50px 0px" // Margen inferior para que no aparezca tan al borde
  };

  const scrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Añade la clase que activa la animación CSS
        entry.target.classList.add("appear");
        // Una vez que aparece, dejamos de observarlo para mejorar rendimiento
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Decirle al observador que vigile cada elemento seleccionado
  fadeElements.forEach(element => {
    scrollObserver.observe(element);
  });
});

const paginaDetalleTecnico = {

  init: () => {
    document.addEventListener("DOMContentLoaded", () => {
      // Simulación de captura de parámetro de URL (?tipo=perno-normal)
      const params = new URLSearchParams(window.location.search);
      const tipoPerno = params.get("tipo") || "perno-normal";

      const infoPerno = especificacionesPernos[tipoPerno];
      if (!infoPerno) return;

      // Cambiar título de la página
      document.getElementById("titulo-documento").textContent = `Especificación de ${infoPerno.titulo}`;
      document.getElementById("detail-image").src = `img/detalle-tecnico/${infoPerno.image}`;

      const tableContainer = document.querySelector(".table-fixed-height");

      // 1. Crear el esqueleto de la tabla limpia
      tableContainer.innerHTML = `
                 <table class="tech-table font-monospace">
                     <thead id="tbl-thead"></thead>
                     <tbody id="tbl-tbody"></tbody>
                 </table>
             `;

      const thead = document.getElementById("tbl-thead");
      const tbody = document.getElementById("tbl-tbody");

      // --- FUNCIÓN RECURSIVA CORE ---
      // Procesa el nodo del JSON y genera la estructura Flexbox anidada de forma limpia
      function procesarContenido(nodo) {
        if (Array.isArray(nodo.contenido)) {
          // Es un contenedor intermedio. Evaluamos la dirección.
          const claseDireccion = nodo.direction === "row" ? "flex-direction-row" : "flex-direction-column";

          let htmlHijos = "";
          nodo.contenido.forEach(hijo => {
            htmlHijos += `<div class="flex-item">${procesarContenido(hijo)}</div>`;
          });

          return `<div class="flex-container ${claseDireccion}">${htmlHijos}</div>`;
        } else {
          // Es un nodo hoja (Texto plano / HTML String final)
          return nodo.contenido;
        }
      }

      // 2. RENDERIZAR FILAS
      infoPerno.filas.forEach((fila, indexFila) => {
        const esCabecera = (indexFila === 0); // La primera fila del JSON actúa como el thead
        const tr = document.createElement("tr");

        // Si el JSON activa la cabecera fija global, inyectamos la clase a la primera fila
        if (esCabecera && infoPerno.fixedHeader) {
          tr.classList.add("row-sticky");
        }

        fila.columnas.forEach((columna, indexColumna) => {
          const esPrimeraColumna = (indexColumna === 0);

          // Creamos dinámicamente un th o un td según corresponda
          const celda = document.createElement(esCabecera ? "th" : "td");
          celda.classList.add("text-center");

          // ASIGNACIÓN DINÁMICA DE CLASES STICKY CONFIGURADAS EN EL ENCABEZADO DEL JSON
          if (esCabecera && esPrimeraColumna && infoPerno.fixedIntersection) {
            celda.classList.add("intersection");
          } else if (!esCabecera && esPrimeraColumna && infoPerno.fixedFirstColumn) {
            celda.classList.add("col-sticky");
          }

          // Disparamos la recursión para resolver el contenido interno de la celda
          celda.innerHTML = procesarContenido(columna);
          celda.colSpan = columna.colspan || 1; // Permite que el JSON defina un colspan si es necesario
          celda.rowSpan = columna.rowspan || 1;   // Permite que el JSON defina un rowspan si es necesario
          tr.appendChild(celda);
        });

        // Inyectar la fila terminada en su respectivo bloque de la tabla
        if (esCabecera) {
          thead.appendChild(tr);
        } else {
          tbody.appendChild(tr);
        }
      });

      paginaDetalleTecnico.renderizarTarjetasSugeridas(tipoPerno);
    });
  },

  renderizarTarjetasSugeridas: (pernoExcluido) => {
    const contenedorTarjetas = document.getElementById("tarjetas-sugeridas-container");
    if (!contenedorTarjetas) return;

    let htmlTarjetas = "";

    // Recorremos todo el objeto del catálogo usando Object.keys()
    Object.keys(especificacionesPernos).forEach(key => {
        // La magia: excluimos el perno que el usuario está viendo actualmente
        if (key !== pernoExcluido) {
            const perno = especificacionesPernos[key];

            // Creamos la tarjeta dinámicamente con su enlace href correspondiente
            htmlTarjetas += `
                <a href="detalle-tecnico.html?tipo=${key}" class="tech-card">
                <div class="card-image-placeholder"><span>🔩</span></div>
                <div class="card-content">
                <h3>${perno.titulo}</h3>
                </div>
                </a>
            `;
        }
    });

    contenedorTarjetas.innerHTML = htmlTarjetas;
  }

}

const especificacionesPernos = {
  "pernoHexagonalEstandar": {
    "titulo": "Perno Cabeza Hexagonal Estándar",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "perno-cabeza-hexagonal-estandar.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Tamaño Nominal o Diámetro Básico del Producto" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "E" },
              { "contenido": "Diámetro del Cuerpo" },
              { "contenido": "Máx" }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "F" },
              { "contenido": "Ancho Entre Caras" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "G" },
              { "contenido": "Ancho Entre Vértices" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "H" },
              { "contenido": "Altura de la Cabeza" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "R" },
              { "contenido": "Radio del Entallado" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "L<sub>T</sub>" },
              { "contenido": "Longitud de Rosca" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "&le; 6 pulg." },
                  { "contenido": "&gt; 6 pulg." }
                ]
              },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Básico" }
                ]
              }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/4</strong>" }, { "contenido": "0.2500" }] },
          { "contenido": "0.260" }, { "contenido": "7/16" }, { "contenido": "0.438" }, { "contenido": "0.425" },
          { "contenido": "0.505" }, { "contenido": "0.484" }, { "contenido": "11/64" }, { "contenido": "0.188" },
          { "contenido": "0.150" }, { "contenido": "0.03" }, { "contenido": "0.01" }, { "contenido": "0.750" }, { "contenido": "1.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/16</strong>" }, { "contenido": "0.3125" }] },
          { "contenido": "0.324" }, { "contenido": "1/2" }, { "contenido": "0.500" }, { "contenido": "0.484" },
          { "contenido": "0.577" }, { "contenido": "0.552" }, { "contenido": "7/32" }, { "contenido": "0.235" },
          { "contenido": "0.195" }, { "contenido": "0.03" }, { "contenido": "0.01" }, { "contenido": "0.875" }, { "contenido": "1.125" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/8</strong>" }, { "contenido": "0.3750" }] },
          { "contenido": "0.388" }, { "contenido": "9/16" }, { "contenido": "0.562" }, { "contenido": "0.544" },
          { "contenido": "0.650" }, { "contenido": "0.620" }, { "contenido": "1/4" }, { "contenido": "0.268" },
          { "contenido": "0.226" }, { "contenido": "0.03" }, { "contenido": "0.01" }, { "contenido": "1.000" }, { "contenido": "1.250" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/16</strong>" }, { "contenido": "0.4375" }] },
          { "contenido": "0.452" }, { "contenido": "5/8" }, { "contenido": "0.625" }, { "contenido": "0.603" },
          { "contenido": "0.722" }, { "contenido": "0.687" }, { "contenido": "19/64" }, { "contenido": "0.316" },
          { "contenido": "0.272" }, { "contenido": "0.03" }, { "contenido": "0.01" }, { "contenido": "1.125" }, { "contenido": "1.375" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "0.515" }, { "contenido": "3/4" }, { "contenido": "0.750" }, { "contenido": "0.725" },
          { "contenido": "0.866" }, { "contenido": "0.826" }, { "contenido": "11/32" }, { "contenido": "0.364" },
          { "contenido": "0.302" }, { "contenido": "0.03" }, { "contenido": "0.01" }, { "contenido": "1.250" }, { "contenido": "1.500" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "0.642" }, { "contenido": "15/16" }, { "contenido": "0.938" }, { "contenido": "0.906" },
          { "contenido": "1.083" }, { "contenido": "1.033" }, { "contenido": "27/64" }, { "contenido": "0.444" },
          { "contenido": "0.378" }, { "contenido": "0.06" }, { "contenido": "0.02" }, { "contenido": "1.500" }, { "contenido": "1.750" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "0.768" }, { "contenido": "1-1/8" }, { "contenido": "1.125" }, { "contenido": "1.088" },
          { "contenido": "1.299" }, { "contenido": "1.240" }, { "contenido": "1/2" }, { "contenido": "0.524" },
          { "contenido": "0.455" }, { "contenido": "0.06" }, { "contenido": "0.02" }, { "contenido": "1.750" }, { "contenido": "2.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "0.895" }, { "contenido": "1-5/16" }, { "contenido": "1.312" }, { "contenido": "1.269" },
          { "contenido": "1.516" }, { "contenido": "1.447" }, { "contenido": "37/64" }, { "contenido": "0.604" },
          { "contenido": "0.531" }, { "contenido": "0.06" }, { "contenido": "0.02" }, { "contenido": "2.000" }, { "contenido": "2.250" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "1.022" }, { "contenido": "1-1/2" }, { "contenido": "1.500" }, { "contenido": "1.450" },
          { "contenido": "1.732" }, { "contenido": "1.653" }, { "collapse": "43/64", "contenido": "43/64" }, { "contenido": "0.700" },
          { "contenido": "0.591" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "2.250" }, { "contenido": "2.500" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8</strong>" }, { "contenido": "1.1250" }] },
          { "contenido": "1.149" }, { "contenido": "1-11/16" }, { "contenido": "1.688" }, { "contenido": "1.631" },
          { "contenido": "1.949" }, { "contenido": "1.859" }, { "contenido": "3/4" }, { "contenido": "0.780" },
          { "contenido": "0.658" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "2.500" }, { "contenido": "2.750" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/4</strong>" }, { "contenido": "1.2500" }] },
          { "contenido": "1.277" }, { "contenido": "1-7/8" }, { "contenido": "1.875" }, { "contenido": "1.812" },
          { "contenido": "2.165" }, { "contenido": "2.066" }, { "contenido": "27/32" }, { "contenido": "0.876" },
          { "contenido": "0.749" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "2.750" }, { "contenido": "3.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/8</strong>" }, { "contenido": "1.3750" }] },
          { "contenido": "1.404" }, { "contenido": "2-1/16" }, { "contenido": "2.062" }, { "contenido": "1.994" },
          { "contenido": "2.382" }, { "contenido": "2.273" }, { "contenido": "29/32" }, { "contenido": "0.940" },
          { "contenido": "0.810" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "3.000" }, { "contenido": "3.250" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/2</strong>" }, { "contenido": "1.5000" }] },
          { "contenido": "1.531" }, { "contenido": "2-1/4" }, { "contenido": "2.250" }, { "contenido": "2.175" },
          { "contenido": "2.598" }, { "contenido": "2.480" }, { "contenido": "1" }, { "contenido": "1.036" },
          { "contenido": "0.902" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "3.250" }, { "contenido": "3.500" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/4</strong>" }, { "contenido": "1.7500" }] },
          { "contenido": "1.785" }, { "contenido": "2-5/8" }, { "contenido": "2.625" }, { "contenido": "2.538" },
          { "contenido": "3.031" }, { "contenido": "2.893" }, { "contenido": "1-5/32" }, { "contenido": "1.196" },
          { "contenido": "1.054" }, { "contenido": "0.12" }, { "contenido": "0.04" }, { "contenido": "3.750" }, { "contenido": "4.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2</strong>" }, { "contenido": "2.0000" }] },
          { "contenido": "2.039" }, { "contenido": "3" }, { "contenido": "3.000" }, { "contenido": "2.900" },
          { "contenido": "3.464" }, { "contenido": "3.306" }, { "contenido": "1-11/32" }, { "contenido": "1.388" },
          { "contenido": "1.175" }, { "contenido": "0.12" }, { "contenido": "0.04" }, { "contenido": "4.250" }, { "contenido": "4.500" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-1/4</strong>" }, { "contenido": "2.2500" }] },
          { "contenido": "2.305" }, { "bits": "3-3/8", "contenido": "3-3/8" }, { "contenido": "3.375" }, { "contenido": "3.262" },
          { "contenido": "3.897" }, { "contenido": "3.719" }, { "contenido": "1-1/2" }, { "contenido": "1.548" },
          { "contenido": "1.327" }, { "contenido": "0.19" }, { "contenido": "0.06" }, { "contenido": "4.750" }, { "contenido": "5.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-1/2</strong>" }, { "contenido": "2.5000" }] },
          { "contenido": "2.559" }, { "contenido": "3-3/4" }, { "contenido": "3.750" }, { "contenido": "3.625" },
          { "contenido": "4.330" }, { "contenido": "4.133" }, { "contenido": "1-21/32" }, { "contenido": "1.708" },
          { "contenido": "1.479" }, { "contenido": "0.19" }, { "contenido": "0.06" }, { "contenido": "5.250" }, { "contenido": "5.500" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-3/4</strong>" }, { "contenido": "2.7500" }] },
          { "contenido": "2.827" }, { "contenido": "4-1/8" }, { "contenido": "4.125" }, { "contenido": "3.988" },
          { "contenido": "4.763" }, { "contenido": "4.546" }, { "contenido": "1-13/16" }, { "contenido": "1.869" },
          { "contenido": "1.632" }, { "contenido": "0.19" }, { "contenido": "0.06" }, { "contenido": "5.750" }, { "contenido": "6.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3</strong>" }, { "contenido": "3.0000" }] },
          { "contenido": "3.081" }, { "contenido": "4-1/2" }, { "contenido": "4.500" }, { "contenido": "4.350" },
          { "contenido": "5.196" }, { "contenido": "4.959" }, { "contenido": "2" }, { "contenido": "2.060" },
          { "contenido": "1.815" }, { "contenido": "0.19" }, { "contenido": "0.06" }, { "contenido": "6.250" }, { "contenido": "6.500" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3-1/4</strong>" }, { "contenido": "3.2500" }] },
          { "contenido": "3.335" }, { "contenido": "4-7/8" }, { "contenido": "4.875" }, { "contenido": "4.712" },
          { "contenido": "5.629" }, { "contenido": "5.372" }, { "contenido": "2-3/16" }, { "contenido": "2.251" },
          { "contenido": "1.936" }, { "contenido": "0.19" }, { "contenido": "0.06" }, { "contenido": "6.750" }, { "contenido": "7.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3-1/2</strong>" }, { "contenido": "3.5000" }] },
          { "contenido": "3.589" }, { "contenido": "5-1/4" }, { "contenido": "5.250" }, { "contenido": "5.075" },
          { "contenido": "6.062" }, { "contenido": "5.786" }, { "contenido": "2-5/16" }, { "contenido": "2.380" },
          { "contenido": "2.057" }, { "contenido": "0.19" }, { "contenido": "0.06" }, { "contenido": "7.250" }, { "contenido": "7.500" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3-3/4</strong>" }, { "contenido": "3.7500" }] },
          { "contenido": "3.858" }, { "contenido": "5-5/8" }, { "contenido": "5.625" }, { "contenido": "5.437" },
          { "contenido": "6.495" }, { "contenido": "6.198" }, { "contenido": "2-1/2" }, { "contenido": "2.572" },
          { "contenido": "2.241" }, { "contenido": "0.19" }, { "contenido": "0.06" }, { "contenido": "7.750" }, { "contenido": "8.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>4</strong>" }, { "contenido": "4.0000" }] },
          { "contenido": "4.111" }, { "contenido": "6" }, { "contenido": "6.000" }, { "contenido": "5.800" },
          { "contenido": "6.928" }, { "contenido": "6.612" }, { "contenido": "2-11/16" }, { "contenido": "2.764" },
          { "contenido": "2.424" }, { "contenido": "0.19" }, { "contenido": "0.06" }, { "contenido": "8.250" }, { "contenido": "8.500" }
        ]
      }
    ]
  }
  ,
  "pernoHexagonalReforzado": {
    "titulo": "Perno Hexagonal Reforzado / Pesado",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "perno-cabeza-hexagonal-reforzada.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Tamaño Nominal o Diámetro Básico del Producto" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "E" },
              { "contenido": "Diámetro del Cuerpo" },
              { "contenido": "Máx" }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "F" },
              { "contenido": "Ancho Entre Caras" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "G" },
              { "contenido": "Ancho Entre Vértices" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "H" },
              { "contenido": "Altura de la Cabeza" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "R" },
              { "contenido": "Radio del Entallado" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "L<sub>T</sub>" },
              { "contenido": "Longitud de Rosca" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "&le; 6 pulg." },
                  { "contenido": "&gt; 6 pulg." }
                ]
              },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Básico" }
                ]
              }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "0.515" }, { "contenido": "7/8" }, { "contenido": "0.875" }, { "contenido": "0.850" },
          { "contenido": "1.010" }, { "contenido": "0.969" }, { "contenido": "11/32" }, { "contenido": "0.364" },
          { "contenido": "0.302" }, { "contenido": "0.03" }, { "contenido": "0.01" }, { "contenido": "1.250" }, { "contenido": "1.500" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "0.642" }, { "contenido": "1-1/16" }, { "contenido": "1.062" }, { "contenido": "1.031" },
          { "contenido": "1.227" }, { "contenido": "1.175" }, { "contenido": "27/64" }, { "contenido": "0.444" },
          { "contenido": "0.378" }, { "contenido": "0.06" }, { "contenido": "0.02" }, { "contenido": "1.500" }, { "contenido": "1.750" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "0.768" }, { "contenido": "1-1/4" }, { "contenido": "1.250" }, { "contenido": "1.212" },
          { "contenido": "1.443" }, { "contenido": "1.383" }, { "contenido": "1/2" }, { "contenido": "0.524" },
          { "contenido": "0.455" }, { "contenido": "0.06" }, { "contenido": "0.02" }, { "contenido": "1.750" }, { "contenido": "2.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "0.895" }, { "contenido": "1-7/16" }, { "contenido": "1.438" }, { "contenido": "1.394" },
          { "contenido": "1.660" }, { "contenido": "1.589" }, { "contenido": "37/64" }, { "contenido": "0.604" },
          { "contenido": "0.531" }, { "contenido": "0.06" }, { "contenido": "0.02" }, { "contenido": "2.000" }, { "contenido": "2.250" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "1.022" }, { "contenido": "1-5/8" }, { "contenido": "1.625" }, { "contenido": "1.575" },
          { "contenido": "1.876" }, { "contenido": "1.796" }, { "contenido": "43/64" }, { "contenido": "0.700" },
          { "contenido": "0.591" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "2.250" }, { "contenido": "2.500" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8</strong>" }, { "contenido": "1.1250" }] },
          { "contenido": "1.149" }, { "contenido": "1-13/16" }, { "contenido": "1.812" }, { "contenido": "1.756" },
          { "contenido": "2.093" }, { "contenido": "2.002" }, { "contenido": "3/4" }, { "contenido": "0.780" },
          { "contenido": "0.658" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "2.500" }, { "contenido": "2.750" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/4</strong>" }, { "contenido": "1.2500" }] },
          { "contenido": "1.277" }, { "contenido": "2" }, { "contenido": "2.000" }, { "contenido": "1.938" },
          { "contenido": "2.309" }, { "contenido": "2.209" }, { "contenido": "27/32" }, { "contenido": "0.876" },
          { "contenido": "0.749" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "2.750" }, { "contenido": "3.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/8</strong>" }, { "contenido": "1.3750" }] },
          { "contenido": "1.404" }, { "contenido": "2-3/16" }, { "contenido": "2.188" }, { "contenido": "2.119" },
          { "contenido": "2.526" }, { "contenido": "2.416" }, { "contenido": "29/32" }, { "contenido": "0.940" },
          { "contenido": "0.810" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "3.000" }, { "contenido": "3.250" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/2</strong>" }, { "contenido": "1.5000" }] },
          { "contenido": "1.531" }, { "contenido": "2-3/8" }, { "contenido": "2.375" }, { "contenido": "2.300" },
          { "contenido": "2.742" }, { "contenido": "2.622" }, { "contenido": "1" }, { "contenido": "1.036" },
          { "contenido": "0.902" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "3.250" }, { "contenido": "3.500" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/4</strong>" }, { "contenido": "1.7500" }] },
          { "contenido": "1.785" }, { "contenido": "2-3/4" }, { "contenido": "2.750" }, { "contenido": "2.662" },
          { "contenido": "3.175" }, { "contenido": "3.035" }, { "contenido": "1-5/32" }, { "contenido": "1.196" },
          { "contenido": "1.054" }, { "contenido": "0.12" }, { "contenido": "0.04" }, { "contenido": "3.750" }, { "contenido": "4.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2</strong>" }, { "contenido": "2.0000" }] },
          { "contenido": "2.039" }, { "contenido": "3-1/8" }, { "contenido": "3.125" }, { "contenido": "3.025" },
          { "contenido": "3.608" }, { "contenido": "3.449" }, { "contenido": "1-11/32" }, { "contenido": "1.388" },
          { "contenido": "1.175" }, { "contenido": "0.12" }, { "contenido": "0.04" }, { "contenido": "4.250" }, { "contenido": "4.500" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-1/4</strong>" }, { "contenido": "2.2500" }] },
          { "contenido": "2.305" }, { "contenido": "3-1/2" }, { "contenido": "3.500" }, { "contenido": "3.388" },
          { "contenido": "4.041" }, { "contenido": "3.862" }, { "contenido": "1-1/2" }, { "contenido": "1.548" },
          { "contenido": "1.327" }, { "contenido": "0.19" }, { "contenido": "0.06" }, { "contenido": "4.750" }, { "contenido": "5.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-1/2</strong>" }, { "contenido": "2.5000" }] },
          { "contenido": "2.559" }, { "contenido": "3-7/8" }, { "contenido": "3.875" }, { "contenido": "3.750" },
          { "contenido": "4.474" }, { "contenido": "4.275" }, { "contenido": "1-21/32" }, { "contenido": "1.708" },
          { "contenido": "1.479" }, { "contenido": "0.19" }, { "contenido": "0.06" }, { "contenido": "5.250" }, { "contenido": "5.500" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-3/4</strong>" }, { "contenido": "2.7500" }] },
          { "contenido": "2.827" }, { "contenido": "4-1/8" }, { "contenido": "4.125" }, { "contenido": "3.988" },
          { "contenido": "4.907" }, { "contenido": "4.688" }, { "contenido": "1-13/16" }, { "contenido": "1.869" },
          { "contenido": "1.632" }, { "contenido": "0.19" }, { "contenido": "0.06" }, { "contenido": "5.750" }, { "contenido": "6.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3</strong>" }, { "contenido": "3.0000" }] },
          { "contenido": "3.081" }, { "contenido": "4-5/8" }, { "contenido": "4.625" }, { "contenido": "4.475" },
          { "contenido": "5.340" }, { "contenido": "5.102" }, { "contenido": "2" }, { "contenido": "2.060" },
          { "contenido": "1.815" }, { "contenido": "0.19" }, { "contenido": "0.06" }, { "contenido": "6.250" }, { "contenido": "6.500" }
        ]
      }
    ]
  },

  "pernoHexagonalEstructural": {
    "titulo": "Perno Cabeza Hexagonal Estructural",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "perno-cabeza-hexagonal-estructural.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Tamaño Nominal o Diámetro Básico del Producto" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "E" },
              { "contenido": "Diámetro del Cuerpo" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "F" },
              { "contenido": "Ancho Entre Caras" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "G" },
              { "contenido": "Ancho Entre Vértices" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "H" },
              { "contenido": "Altura de la Cabeza" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "R" },
              { "contenido": "Radio del Entallado" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "L<sub>T</sub>" },
              { "contenido": "Longitud de Rosca" },
              { "contenido": "Básico" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "Y" },
              { "contenido": "Rosca de Transición" },
              { "contenido": "Máx" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "Descentramiento" },
              { "contenido": "Superficie de Apoyo (FIM)" },
              { "contenido": "Máx" }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "0.515" }, { "contenido": "0.482" }, { "contenido": "7/8" }, { "contenido": "0.875" }, { "contenido": "0.850" },
          { "contenido": "1.010" }, { "contenido": "0.969" }, { "contenido": "5/16" }, { "contenido": "0.323" }, { "contenido": "0.302" },
          { "contenido": "0.031" }, { "contenido": "0.009" }, { "contenido": "1.00" }, { "contenido": "0.19" }, { "contenido": "0.016" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "0.642" }, { "contenido": "0.605" }, { "contenido": "1-1/16" }, { "contenido": "1.062" }, { "contenido": "1.031" },
          { "contenido": "1.227" }, { "contenido": "1.175" }, { "contenido": "25/64" }, { "contenido": "0.403" }, { "contenido": "0.378" },
          { "contenido": "0.062" }, { "contenido": "0.021" }, { "contenido": "1.25" }, { "contenido": "0.22" }, { "contenido": "0.019" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "0.768" }, { "contenido": "0.729" }, { "contenido": "1-1/4" }, { "contenido": "1.250" }, { "contenido": "1.212" },
          { "contenido": "1.443" }, { "contenido": "1.383" }, { "contenido": "15/32" }, { "contenido": "0.483" }, { "contenido": "0.455" },
          { "contenido": "0.062" }, { "contenido": "0.021" }, { "contenido": "1.38" }, { "contenido": "0.25" }, { "contenido": "0.022" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "0.895" }, { "contenido": "0.852" }, { "contenido": "1-7/16" }, { "contenido": "1.438" }, { "contenido": "1.394" },
          { "contenido": "1.660" }, { "contenido": "1.589" }, { "contenido": "35/64" }, { "contenido": "0.563" }, { "contenido": "0.531" },
          { "contenido": "0.062" }, { "contenido": "0.031" }, { "contenido": "1.50" }, { "contenido": "0.28" }, { "contenido": "0.025" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "1.022" }, { "contenido": "0.976" }, { "contenido": "1-5/8" }, { "contenido": "1.625" }, { "contenido": "1.575" },
          { "contenido": "1.876" }, { "contenido": "1.796" }, { "contenido": "39/64" }, { "contenido": "0.627" }, { "contenido": "0.591" },
          { "contenido": "0.093" }, { "contenido": "0.062" }, { "contenido": "1.75" }, { "contenido": "0.31" }, { "contenido": "0.028" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8</strong>" }, { "contenido": "1.1250" }] },
          { "contenido": "1.149" }, { "contenido": "1.098" }, { "contenido": "1-13/16" }, { "contenido": "1.812" }, { "contenido": "1.756" },
          { "contenido": "2.093" }, { "contenido": "2.002" }, { "contenido": "11/16" }, { "contenido": "0.718" }, { "contenido": "0.658" },
          { "contenido": "0.093" }, { "contenido": "0.062" }, { "contenido": "2.00" }, { "contenido": "0.34" }, { "contenido": "0.032" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/4</strong>" }, { "contenido": "1.2500" }] },
          { "contenido": "1.277" }, { "contenido": "1.223" }, { "contenido": "2" }, { "contenido": "2.000" }, { "contenido": "1.938" },
          { "contenido": "2.309" }, { "contenido": "2.209" }, { "contenido": "25/32" }, { "contenido": "0.813" }, { "contenido": "0.749" },
          { "contenido": "0.093" }, { "contenido": "0.062" }, { "contenido": "2.00" }, { "contenido": "0.38" }, { "contenido": "0.035" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/8</strong>" }, { "contenido": "1.3750" }] },
          { "contenido": "1.404" }, { "contenido": "1.345" }, { "contenido": "2-3/16" }, { "contenido": "2.188" }, { "contenido": "2.119" },
          { "contenido": "2.526" }, { "contenido": "2.416" }, { "contenido": "27/32" }, { "contenido": "0.878" }, { "contenido": "0.810" },
          { "contenido": "0.093" }, { "contenido": "0.062" }, { "contenido": "2.25" }, { "contenido": "0.44" }, { "contenido": "0.038" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/2</strong>" }, { "contenido": "1.5000" }] },
          { "contenido": "1.531" }, { "contenido": "1.470" }, { "contenido": "2-3/8" }, { "contenido": "2.375" }, { "contenido": "2.300" },
          { "contenido": "2.742" }, { "contenido": "2.622" }, { "contenido": "15/16" }, { "contenido": "0.974" }, { "contenido": "0.902" },
          { "contenido": "0.093" }, { "contenido": "0.062" }, { "contenido": "2.25" }, { "contenido": "0.44" }, { "contenido": "0.041" }
        ]
      }
    ]
  },

  "pernoCabezaCuadrada": {
    "titulo": "Perno de Cabeza Cuadrada",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "perno-cabeza-cuadrada.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Tamaño Nominal o Diámetro Básico del Producto" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "E" },
              { "contenido": "Diámetro del Cuerpo" },
              { "contenido": "Máx" }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "F" },
              { "contenido": "Ancho Entre Caras" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "G" },
              { "contenido": "Ancho Entre Vértices" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "H" },
              { "contenido": "Altura de la Cabeza" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "R" },
              { "contenido": "Radio del Entallado" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "L<sub>T</sub>" },
              { "contenido": "Longitud de Rosca" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "&le; 6 pulg." },
                  { "contenido": "&gt; 6 pulg." }
                ]
              },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Básico" }
                ]
              }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/4</strong>" }, { "contenido": "0.2500" }] },
          { "contenido": "0.260" }, { "contenido": "3/8" }, { "contenido": "0.375" }, { "contenido": "0.362" },
          { "contenido": "0.530" }, { "contenido": "0.498" }, { "contenido": "11/64" }, { "contenido": "0.188" },
          { "contenido": "0.156" }, { "contenido": "0.03" }, { "contenido": "0.01" }, { "contenido": "0.750" }, { "contenido": "1.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/16</strong>" }, { "contenido": "0.3125" }] },
          { "contenido": "0.324" }, { "contenido": "1/2" }, { "contenido": "0.500" }, { "contenido": "0.484" },
          { "contenido": "0.707" }, { "contenido": "0.665" }, { "contenido": "13/64" }, { "contenido": "0.220" },
          { "contenido": "0.186" }, { "contenido": "0.03" }, { "contenido": "0.01" }, { "contenido": "0.875" }, { "contenido": "1.125" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/8</strong>" }, { "contenido": "0.3750" }] },
          { "contenido": "0.388" }, { "contenido": "9/16" }, { "contenido": "0.562" }, { "contenido": "0.544" },
          { "contenido": "0.795" }, { "contenido": "0.747" }, { "contenido": "1/4" }, { "contenido": "0.268" },
          { "contenido": "0.232" }, { "contenido": "0.03" }, { "contenido": "0.01" }, { "contenido": "1.000" }, { "contenido": "1.250" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/16</strong>" }, { "contenido": "0.4375" }] },
          { "contenido": "0.452" }, { "contenido": "5/8" }, { "contenido": "0.625" }, { "contenido": "0.603" },
          { "contenido": "0.884" }, { "contenido": "0.828" }, { "contenido": "19/64" }, { "contenido": "0.316" },
          { "contenido": "0.278" }, { "contenido": "0.03" }, { "contenido": "0.01" }, { "contenido": "1.125" }, { "contenido": "1.375" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "0.515" }, { "contenido": "3/4" }, { "contenido": "0.750" }, { "contenido": "0.725" },
          { "contenido": "1.061" }, { "contenido": "0.995" }, { "contenido": "21/64" }, { "contenido": "0.348" },
          { "contenido": "0.308" }, { "contenido": "0.03" }, { "contenido": "0.01" }, { "contenido": "1.250" }, { "contenido": "1.500" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "0.642" }, { "contenido": "15/16" }, { "contenido": "0.938" }, { "contenido": "0.906" },
          { "contenido": "1.326" }, { "contenido": "1.244" }, { "contenido": "27/64" }, { "contenido": "0.444" },
          { "contenido": "0.400" }, { "contenido": "0.06" }, { "contenido": "0.02" }, { "contenido": "1.500" }, { "contenido": "1.750" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "0.768" }, { "contenido": "1-1/8" }, { "contenido": "1.125" }, { "contenido": "1.088" },
          { "contenido": "1.591" }, { "contenido": "1.494" }, { "contenido": "1/2" }, { "contenido": "0.524" },
          { "contenido": "0.476" }, { "contenido": "0.06" }, { "contenido": "0.02" }, { "contenido": "1.750" }, { "contenido": "2.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "0.895" }, { "contenido": "1-5/16" }, { "contenido": "1.312" }, { "contenido": "1.269" },
          { "contenido": "1.856" }, { "contenido": "1.742" }, { "contenido": "19/32" }, { "contenido": "0.620" },
          { "contenido": "0.568" }, { "contenido": "0.06" }, { "contenido": "0.02" }, { "contenido": "2.000" }, { "contenido": "2.250" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "1.022" }, { "contenido": "1-1/2" }, { "contenido": "1.500" }, { "contenido": "1.450" },
          { "contenido": "2.121" }, { "contenido": "1.991" }, { "contenido": "21/32" }, { "contenido": "0.684" },
          { "contenido": "0.628" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "2.250" }, { "contenido": "2.500" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8</strong>" }, { "contenido": "1.1250" }] },
          { "contenido": "1.149" }, { "contenido": "1-11/16" }, { "contenido": "1.688" }, { "contenido": "1.631" },
          { "contenido": "2.386" }, { "contenido": "2.239" }, { "contenido": "3/4" }, { "contenido": "0.780" },
          { "contenido": "0.720" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "2.500" }, { "contenido": "2.750" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/4</strong>" }, { "contenido": "1.2500" }] },
          { "contenido": "1.277" }, { "contenido": "1-7/8" }, { "contenido": "1.875" }, { "contenido": "1.812" },
          { "contenido": "2.652" }, { "indigo": "2.489", "contenido": "2.489" }, { "contenido": "27/32" }, { "contenido": "0.876" },
          { "contenido": "0.812" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "2.750" }, { "contenido": "3.000" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/8</strong>" }, { "contenido": "1.3750" }] },
          { "contenido": "1.404" }, { "contenido": "2-1/16" }, { "contenido": "2.062" }, { "contenido": "1.994" },
          { "contenido": "2.917" }, { "contenido": "2.738" }, { "contenido": "29/32" }, { "contenido": "0.940" },
          { "contenido": "0.872" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "3.000" }, { "contenido": "3.250" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/2</strong>" }, { "contenido": "1.5000" }] },
          { "contenido": "1.531" }, { "contenido": "2-1/4" }, { "contenido": "2.250" }, { "contenido": "2.175" },
          { "contenido": "3.182" }, { "contenido": "2.986" }, { "contenido": "1" }, { "contenido": "1.036" },
          { "contenido": "0.964" }, { "contenido": "0.09" }, { "contenido": "0.03" }, { "contenido": "3.250" }, { "contenido": "3.500" }
        ]
      }
    ]
  },

  "pernoCoche": {
    "titulo": "Perno Coche",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "perno-coche.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Tamaño Nominal o Diámetro Básico del Perno" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "E" },
              { "contenido": "Diámetro del Cuerpo" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "A" },
              { "contenido": "Diámetro de la Cabeza" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "H" },
              { "contenido": "Altura de la Cabeza" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "O" },
              { "contenido": "Ancho del Cuello Cuadrado" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "AC" },
              { "contenido": "Ancho Entre Vértices del Cuadrado<br><small>Mín</small>" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "P" },
              { "contenido": "Profundidad del Cuadrado" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "S" },
              { "contenido": "Altura del Cuadrado<br><small>Mín</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "Q" },
              { "contenido": "Radio de Arista en el Cuadrado<br><small>Máx</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "R" },
              { "contenido": "Radio del Entallado<br><small>Máx</small>" }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>No. 10</strong>" }, { "contenido": "0.1900" }] },
          { "contenido": "0.199" }, { "contenido": "0.159" }, { "contenido": "0.469" }, { "contenido": "0.436" },
          { "contenido": "0.114" }, { "contenido": "0.094" }, { "contenido": "0.199" }, { "contenido": "0.185" },
          { "contenido": "0.236" }, { "contenido": "0.125" }, { "contenido": "0.094" }, { "contenido": "0.069" },
          { "contenido": "0.031" }, { "contenido": "0.031" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/4</strong>" }, { "contenido": "0.2500" }] },
          { "contenido": "0.260" }, { "contenido": "0.213" }, { "contenido": "0.594" }, { "contenido": "0.563" },
          { "contenido": "0.145" }, { "contenido": "0.125" }, { "contenido": "0.260" }, { "contenido": "0.245" },
          { "contenido": "0.321" }, { "contenido": "0.156" }, { "contenido": "0.125" }, { "contenido": "0.087" },
          { "contenido": "0.031" }, { "contenido": "0.031" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/16</strong>" }, { "contenido": "0.3125" }] },
          { "contenido": "0.324" }, { "contenido": "0.272" }, { "contenido": "0.719" }, { "contenido": "0.688" },
          { "contenido": "0.176" }, { "contenido": "0.156" }, { "contenido": "0.324" }, { "contenido": "0.307" },
          { "contenido": "0.408" }, { "contenido": "0.187" }, { "contenido": "0.156" }, { "contenido": "0.105" },
          { "contenido": "0.031" }, { "contenido": "0.031" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/8</strong>" }, { "contenido": "0.3750" }] },
          { "contenido": "0.388" }, { "contenido": "0.329" }, { "contenido": "0.844" }, { "contenido": "0.782" },
          { "contenido": "0.208" }, { "contenido": "0.188" }, { "contenido": "0.388" }, { "contenido": "0.368" },
          { "contenido": "0.481" }, { "contenido": "0.219" }, { "contenido": "0.188" }, { "contenido": "0.131" },
          { "contenido": "0.047" }, { "contenido": "0.031" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/16</strong>" }, { "contenido": "0.4375" }] },
          { "contenido": "0.452" }, { "contenido": "0.385" }, { "contenido": "0.969" }, { "contenido": "0.907" },
          { "contenido": "0.239" }, { "contenido": "0.219" }, { "contenido": "0.452" }, { "contenido": "0.431" },
          { "contenido": "0.571" }, { "contenido": "0.250" }, { "contenido": "0.219" }, { "contenido": "0.149" },
          { "contenido": "0.047" }, { "contenido": "0.031" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "0.515" }, { "contenido": "0.444" }, { "contenido": "1.094" }, { "contenido": "1.032" },
          { "contenido": "0.270" }, { "contenido": "0.250" }, { "contenido": "0.515" }, { "contenido": "0.492" },
          { "contenido": "0.657" }, { "contenido": "0.281" }, { "contenido": "0.250" }, { "contenido": "0.168" },
          { "contenido": "0.047" }, { "contenido": "0.031" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "0.642" }, { "contenido": "0.559" }, { "contenido": "1.344" }, { "contenido": "1.219" },
          { "contenido": "0.344" }, { "contenido": "0.313" }, { "contenido": "0.642" }, { "contenido": "0.616" },
          { "contenido": "0.807" }, { "contenido": "0.344" }, { "contenido": "0.313" }, { "contenido": "0.218" },
          { "contenido": "0.078" }, { "contenido": "0.062" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "0.768" }, { "contenido": "0.678" }, { "contenido": "1.594" }, { "contenido": "1.469" },
          { "contenido": "0.406" }, { "contenido": "0.375" }, { "contenido": "0.768" }, { "contenido": "0.741" },
          { "contenido": "0.983" }, { "contenido": "0.406" }, { "contenido": "0.375" }, { "contenido": "0.254" },
          { "contenido": "0.078" }, { "contenido": "0.062" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "0.895" }, { "contenido": "0.795" }, { "contenido": "1.844" }, { "contenido": "1.719" },
          { "contenido": "0.459" }, { "contenido": "0.438" }, { "contenido": "0.895" }, { "contenido": "0.865" },
          { "contenido": "1.145" }, { "contenido": "0.469" }, { "contenido": "0.438" }, { "contenido": "0.298" },
          { "contenido": "0.094" }, { "contenido": "0.062" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "1.022" }, { "contenido": "0.910" }, { "contenido": "2.094" }, { "contenido": "1.969" },
          { "contenido": "0.531" }, { "contenido": "0.500" }, { "contenido": "1.022" }, { "contenido": "0.990" },
          { "contenido": "1.322" }, { "contenido": "0.531" }, { "contenido": "0.500" }, { "contenido": "0.334" },
          { "contenido": "0.094" }, { "contenido": "0.062" }
        ]
      }
    ]
  },

  "pernoCabezaPlana": {
    "titulo": "Perno de Cabeza Plana",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "perno-cabeza-plana.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Tamaño Nominal o Diámetro Básico del Perno" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "E" },
              { "contenido": "Diámetro del Cuerpo" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "A" },
              { "contenido": "Diámetro de la Cabeza (Nota 2)" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Borde Afilado Máx" },
                  { "contenido": "Borde Afilado Mín" },
                  { "contenido": "Mín Absoluto Redondeado o Plano" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "F" },
              { "contenido": "Plano Máximo en Cabeza de Diámetro Mín" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "H" },
              { "contenido": "Altura de la Cabeza" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "J" },
              { "contenido": "Ancho de la Ranura" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "T" },
              { "contenido": "Profundidad de la Ranura" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/4</strong>" }, { "contenido": "0.2500" }] },
          { "contenido": "0.260" }, { "contenido": "0.237" }, { "contenido": "0.493" }, { "contenido": "0.477" }, { "contenido": "0.445" },
          { "contenido": "0.018" }, { "contenido": "0.150" }, { "contenido": "0.131" }, { "contenido": "0.075" }, { "contenido": "0.064" },
          { "contenido": "0.068" }, { "contenido": "0.045" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/16</strong>" }, { "contenido": "0.3125" }] },
          { "contenido": "0.324" }, { "contenido": "0.298" }, { "contenido": "0.618" }, { "contenido": "0.598" }, { "contenido": "0.558" },
          { "contenido": "0.023" }, { "contenido": "0.189" }, { "contenido": "0.164" }, { "contenido": "0.084" }, { "contenido": "0.072" },
          { "contenido": "0.086" }, { "contenido": "0.057" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/8</strong>" }, { "contenido": "0.3750" }] },
          { "contenido": "0.388" }, { "contenido": "0.360" }, { "contenido": "0.740" }, { "contenido": "0.715" }, { "contenido": "0.668" },
          { "contenido": "0.027" }, { "contenido": "0.225" }, { "contenido": "0.196" }, { "contenido": "0.094" }, { "contenido": "0.081" },
          { "contenido": "0.103" }, { "contenido": "0.068" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/16</strong>" }, { "contenido": "0.4375" }] },
          { "contenido": "0.452" }, { "contenido": "0.421" }, { "contenido": "0.803" }, { "contenido": "0.778" }, { "contenido": "0.726" },
          { "contenido": "0.030" }, { "contenido": "0.226" }, { "contenido": "0.196" }, { "contenido": "0.094" }, { "contenido": "0.081" },
          { "contenido": "0.103" }, { "contenido": "0.068" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "0.515" }, { "contenido": "0.483" }, { "contenido": "0.935" }, { "contenido": "0.905" }, { "contenido": "0.845" },
          { "contenido": "0.035" }, { "contenido": "0.269" }, { "contenido": "0.233" }, { "contenido": "0.106" }, { "contenido": "0.091" },
          { "contenido": "0.103" }, { "contenido": "0.068" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "0.642" }, { "contenido": "0.605" }, { "contenido": "1.169" }, { "contenido": "1.132" }, { "contenido": "1.066" },
          { "contenido": "0.038" }, { "contenido": "0.336" }, { "contenido": "0.292" }, { "contenido": "0.133" }, { "contenido": "0.116" },
          { "contenido": "0.137" }, { "contenido": "0.091" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "0.768" }, { "contenido": "0.729" }, { "contenido": "1.402" }, { "contenido": "1.357" }, { "contenido": "1.285" },
          { "contenido": "0.041" }, { "contenido": "0.403" }, { "contenido": "0.349" }, { "contenido": "0.149" }, { "contenido": "0.131" },
          { "contenido": "0.171" }, { "contenido": "0.115" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "0.895" }, { "contenido": "0.852" }, { "contenido": "1.637" }, { "contenido": "1.584" }, { "contenido": "1.511" },
          { "contenido": "0.042" }, { "contenido": "0.470" }, { "contenido": "0.408" }, { "contenido": "0.167" }, { "contenido": "0.147" },
          { "contenido": "0.206" }, { "contenido": "0.138" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "1.022" }, { "contenido": "0.976" }, { "contenido": "1.869" }, { "contenido": "1.810" }, { "contenido": "1.735" },
          { "contenido": "0.043" }, { "contenido": "0.537" }, { "contenido": "0.466" }, { "contenido": "0.188" }, { "contenido": "0.166" },
          { "contenido": "0.240" }, { "contenido": "0.162" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8</strong>" }, { "contenido": "1.1250" }] },
          { "contenido": "1.149" }, { "contenido": "1.098" }, { "contenido": "2.104" }, { "contenido": "2.037" }, { "contenido": "1.962" },
          { "contenido": "0.043" }, { "contenido": "0.604" }, { "contenido": "0.525" }, { "contenido": "0.196" }, { "contenido": "0.178" },
          { "contenido": "0.257" }, { "contenido": "0.173" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/4</strong>" }, { "contenido": "1.2500" }] },
          { "contenido": "1.277" }, { "contenido": "1.223" }, { "contenido": "2.337" }, { "contenido": "2.262" }, { "contenido": "2.187" },
          { "contenido": "0.043" }, { "contenido": "0.671" }, { "contenido": "0.582" }, { "contenido": "0.211" }, { "contenido": "0.193" },
          { "contenido": "0.291" }, { "contenido": "0.197" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/8</strong>" }, { "contenido": "1.3750" }] },
          { "contenido": "1.404" }, { "contenido": "1.345" }, { "contenido": "2.571" }, { "contenido": "2.489" }, { "contenido": "2.414" },
          { "contenido": "0.043" }, { "contenido": "0.738" }, { "contenido": "0.641" }, { "contenido": "0.226" }, { "contenido": "0.208" },
          { "contenido": "0.326" }, { "contenido": "0.220" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/2</strong>" }, { "contenido": "1.5000" }] },
          { "contenido": "1.531" }, { "contenido": "1.470" }, { "contenido": "2.804" }, { "contenido": "2.715" }, { "contenido": "2.640" },
          { "contenido": "0.043" }, { "contenido": "0.805" }, { "contenido": "0.698" }, { "contenido": "0.258" }, { "contenido": "0.240" },
          { "contenido": "0.360" }, { "contenido": "0.244" }
        ]
      }
    ]
  },

  "pernoCuelloOvalado": {
    "titulo": "Perno Cuello Ovalado",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "perno-cuello-ovalado.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Diámetro Nominal y Hilos por Pulgada" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "E" },
              { "contenido": "Diámetro del Cuerpo Entero" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Mín" },
                  { "contenido": "Máx" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "A" },
              { "contenido": "Diámetro de la Cabeza" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Nom" },
                  { "contenido": "Mín" },
                  { "contenido": "Máx" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "H" },
              { "contenido": "Altura de la Cabeza" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Nom" },
                  { "contenido": "Mín" },
                  { "contenido": "Máx" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "r<sub>1</sub>" },
              { "contenido": "Radio de Curvatura de la Cabeza" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "r<sub>2</sub>" },
              { "contenido": "Radio del Borde de la Cabeza" }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "O" },
              { "contenido": "Ancho del Cuello" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Nom" },
                  { "contenido": "Mín" },
                  { "contenido": "Máx" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "R" },
              { "contenido": "Longitud del Cuello" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Nom" },
                  { "contenido": "Mín" },
                  { "contenido": "Máx" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "P" },
              { "contenido": "Profundidad del Cuello<br><small>Nom</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "r<sub>3</sub>" },
              { "contenido": "Radio de Arista del Cuello" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "V" },
              { "contenido": "Ancho de la Elipse" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "L" },
              { "contenido": "Longitud Bajo la Cabeza" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "L<sub>T</sub>" },
              { "contenido": "Longitud de Rosca Mín" }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2-13</strong>" }] },
          { "contenido": "0.482" }, { "contenido": "0.515" }, { "contenido": "7/8" }, { "contenido": "0.8125" }, { "contenido": "0.9375" },
          { "contenido": "5/16" }, { "contenido": "0.2500" }, { "contenido": "0.3750" }, { "contenido": "11/16" }, { "contenido": "9/32" },
          { "contenido": "5/8" }, { "contenido": "0.5938" }, { "contenido": "0.6563" }, { "contenido": "19/32" }, { "contenido": "0.5625" }, { "contenido": "0.6250" },
          { "contenido": "5/16" }, { "contenido": "1/2 diám. del perno" }, { "contenido": "Igual al diám. del perno" },
          { "contenido": "Bajo 7 pulg. en pasos de 1/4 pulg." }, { "contenido": "1-1/8" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8-11</strong>" }] },
          { "contenido": "0.605" }, { "contenido": "0.642" }, { "contenido": "1-5/64" }, { "contenido": "1.0156" }, { "contenido": "1.1406" },
          { "contenido": "25/64" }, { "contenido": "0.3281" }, { "contenido": "0.4531" }, { "contenido": "59/64" }, { "contenido": "23/64" },
          { "contenido": "13/16" }, { "contenido": "0.7813" }, { "contenido": "0.8438" }, { "contenido": "25/32" }, { "contenido": "0.7500" }, { "contenido": "0.8125" },
          { "contenido": "3/8" }, { "contenido": "1/2 diám. del perno" }, { "contenido": "Igual al diám. del perno" },
          { "contenido": "Bajo 7 pulg. en pasos de 1/4 pulg." }, { "contenido": "1-1/4" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4-10</strong>" }] },
          { "contenido": "0.729" }, { "contenido": "0.768" }, { "contenido": "1-9/32" }, { "contenido": "1.2188" }, { "contenido": "1.3438" },
          { "contenido": "15/32" }, { "contenido": "0.4063" }, { "contenido": "0.5313" }, { "contenido": "1-5/32" }, { "contenido": "7/16" },
          { "contenido": "1-1/16" }, { "contenido": "1.0313" }, { "contenido": "1.0938" }, { "contenido": "1-1/32" }, { "contenido": "1.0000" }, { "contenido": "1.0625" },
          { "contenido": "7/16" }, { "contenido": "1/2 diám. del perno" }, { "contenido": "Igual al diám. del perno" },
          { "contenido": "Bajo 7 pulg. en pasos de 1/4 pulg." }, { "contenido": "1-3/4" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8-9</strong>" }] },
          { "contenido": "0.852" }, { "contenido": "0.895" }, { "contenido": "1-31/64" }, { "contenido": "1.4219" }, { "contenido": "1.5469" },
          { "contenido": "35/64" }, { "contenido": "0.4844" }, { "contenido": "0.6094" }, { "contenido": "1-25/64" }, { "contenido": "33/64" },
          { "contenido": "1-7/32" }, { "contenido": "1.1875" }, { "contenido": "1.2500" }, { "contenido": "1-3/16" }, { "contenido": "1.1563" }, { "contenido": "1.2188" },
          { "contenido": "1/2" }, { "contenido": "1/2 diám. del perno" }, { "contenido": "Igual al diám. del perno" },
          { "contenido": "De 7 pulg. a 10 pulg. en pasos de 1/2 pulg." }, { "contenido": "2" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-8</strong>" }] },
          { "contenido": "0.976" }, { "contenido": "1.022" }, { "contenido": "1-11/16" }, { "contenido": "1.6250" }, { "contenido": "1.7500" },
          { "contenido": "5/8" }, { "contenido": "0.5625" }, { "contenido": "0.6875" }, { "contenido": "1-5/8" }, { "contenido": "19/32" },
          { "contenido": "1-3/8" }, { "contenido": "1.3438" }, { "contenido": "1.4063" }, { "contenido": "1-11/32" }, { "contenido": "1.3125" }, { "contenido": "1.3750" },
          { "contenido": "9/16" }, { "contenido": "1/2 diám. del perno" }, { "contenido": "Igual al diám. del perno" },
          { "contenido": "De 7 pulg. a 10 pulg. en pasos de 1/2 pulg." }, { "contenido": "2-1/4" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8-7</strong>" }] },
          { "contenido": "1.098" }, { "contenido": "1.149" }, { "contenido": "1-57/64" }, { "contenido": "1.8281" }, { "contenido": "1.9531" },
          { "contenido": "45/64" }, { "contenido": "0.6406" }, { "contenido": "0.7656" }, { "contenido": "1-55/64" }, { "contenido": "43/64" },
          { "contenido": "1-17/32" }, { "contenido": "1.5000" }, { "contenido": "1.5625" }, { "contenido": "1-1/2" }, { "contenido": "1.4688" }, { "contenido": "1.5313" },
          { "contenido": "5/8" }, { "contenido": "1/2 diám. del perno" }, { "contenido": "Igual al diám. del perno" },
          { "contenido": "De 7 pulg. a 10 pulg. en pasos de 1/2 pulg." }, { "contenido": "2-1/2" }
        ]
      }
    ]
  },

  "pernoDocePuntas": {
    "titulo": "Perno de 12 Puntas (Brida)",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "perno-12-puntas.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Tamaño Nominal o Diámetro Mayor Básico de la Rosca" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "E" },
              { "contenido": "Diámetro Mín del Cuerpo<br><small>(Máx Igual al Nominal)</small>" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "C" },
              { "contenido": "Diámetro de la Brida" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "F" },
              { "contenido": "Ancho Entre Caras" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "G" },
              { "contenido": "Ancho Entre Vértices<br><small>Mín</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "H" },
              { "contenido": "Altura de la Cabeza<br><small>Máx</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "J" },
              { "contenido": "Altura del Agarre<br><small>Mín</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "K" },
              { "contenido": "Espesor de la Brida<br><small>Mín</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "Descentramiento" },
              { "contenido": "Superficie de Apoyo (FIM)<br><small>Máx</small>" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "M" },
              { "contenido": "Extensión del Entallado" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "L<sub>a</sub>" },
              { "contenido": "Longitud del Entallado<br><small>Máx</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "Radio" },
              { "contenido": "Unión de la Superficie de Apoyo<br><small>Mín</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "X" },
              { "contenido": "Radio o Chaflán<br><small>Máx</small>" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "A" },
              { "contenido": "Espesor del Anillo de Calibre" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "T" },
              { "contenido": "Diámetro del Anillo de Calibre" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "L<sub>T</sub>" },
              { "contenido": "Longitud de Rosca<br><small>Básico</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "Y" },
              { "contenido": "Rosca de Transición<br><small>Máx</small>" }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/4</strong>" }, { "contenido": "0.2500" }] },
          { "contenido": "0.2435" }, { "contenido": "0.375" }, { "contenido": "0.365" }, { "contenido": "0.252" }, { "contenido": "0.244" },
          { "contenido": "0.278" }, { "contenido": "0.260" }, { "contenido": "0.15" }, { "contenido": "0.058" }, { "contenido": "0.007" },
          { "contenido": "0.014" }, { "contenido": "0.009" }, { "contenido": "0.087" }, { "contenido": "0.007" }, { "contenido": "0.020" },
          { "contenido": "0.0525" }, { "contenido": "0.0522" }, { "contenido": "0.2783" }, { "contenido": "0.2780" }, { "contenido": "1.000" }, { "contenido": "0.25" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/16</strong>" }, { "contenido": "0.3125" }] },
          { "contenido": "0.3053" }, { "contenido": "0.469" }, { "contenido": "0.457" }, { "contenido": "0.315" }, { "contenido": "0.306" },
          { "contenido": "0.348" }, { "contenido": "0.312" }, { "contenido": "0.18" }, { "contenido": "0.074" }, { "contenido": "0.008" },
          { "contenido": "0.017" }, { "contenido": "0.012" }, { "contenido": "0.087" }, { "contenido": "0.009" }, { "contenido": "0.020" },
          { "contenido": "0.0600" }, { "contenido": "0.0597" }, { "contenido": "0.3483" }, { "contenido": "0.3480" }, { "contenido": "1.125" }, { "contenido": "0.28" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/8</strong>" }, { "contenido": "0.3750" }] },
          { "contenido": "0.3678" }, { "contenido": "0.562" }, { "contenido": "0.550" }, { "contenido": "0.377" }, { "contenido": "0.368" },
          { "contenido": "0.420" }, { "contenido": "0.375" }, { "contenido": "0.21" }, { "contenido": "0.095" }, { "contenido": "0.010" },
          { "contenido": "0.020" }, { "contenido": "0.015" }, { "contenido": "0.087" }, { "contenido": "0.012" }, { "contenido": "0.020" },
          { "contenido": "0.0711" }, { "contenido": "0.0708" }, { "contenido": "0.4203" }, { "contenido": "0.4200" }, { "contenido": "1.250" }, { "contenido": "0.31" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/16</strong>" }, { "contenido": "0.4375" }] },
          { "contenido": "0.4294" }, { "contenido": "0.656" }, { "contenido": "0.642" }, { "contenido": "0.438" }, { "contenido": "0.429" },
          { "contenido": "0.489" }, { "contenido": "0.438" }, { "contenido": "0.26" }, { "contenido": "0.109" }, { "contenido": "0.011" },
          { "contenido": "0.023" }, { "contenido": "0.018" }, { "contenido": "0.087" }, { "contenido": "0.014" }, { "contenido": "0.030" },
          { "contenido": "0.0840" }, { "contenido": "0.0837" }, { "contenido": "0.4893" }, { "contenido": "0.4890" }, { "contenido": "1.375" }, { "contenido": "0.36" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "0.4919" }, { "contenido": "0.750" }, { "contenido": "0.735" }, { "contenido": "0.502" }, { "contenido": "0.493" },
          { "contenido": "0.562" }, { "contenido": "0.500" }, { "contenido": "0.29" }, { "contenido": "0.129" }, { "contenido": "0.013" },
          { "contenido": "0.026" }, { "contenido": "0.020" }, { "contenido": "0.087" }, { "contenido": "0.016" }, { "contenido": "0.030" },
          { "contenido": "0.0948" }, { "contenido": "0.0945" }, { "contenido": "0.5623" }, { "contenido": "0.5620" }, { "contenido": "1.500" }, { "contenido": "0.38" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>9/16</strong>" }, { "contenido": "0.5625" }] },
          { "contenido": "0.5538" }, { "contenido": "0.844" }, { "contenido": "0.828" }, { "contenido": "0.564" }, { "contenido": "0.555" },
          { "contenido": "0.633" }, { "contenido": "0.563" }, { "contenido": "0.33" }, { "contenido": "0.145" }, { "contenido": "0.015" },
          { "contenido": "0.029" }, { "contenido": "0.022" }, { "contenido": "0.157" }, { "contenido": "0.018" }, { "contenido": "0.030" },
          { "contenido": "0.1071" }, { "contenido": "0.1068" }, { "contenido": "0.6333" }, { "contenido": "0.6330" }, { "contenido": "1.625" }, { "contenido": "0.42" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "0.6163" }, { "contenido": "0.938" }, { "contenido": "0.921" }, { "contenido": "0.627" }, { "contenido": "0.618" },
          { "contenido": "0.705" }, { "contenido": "0.625" }, { "contenido": "0.36" }, { "contenido": "0.166" }, { "contenido": "0.016" },
          { "contenido": "0.032" }, { "contenido": "0.024" }, { "contenido": "0.157" }, { "contenido": "0.021" }, { "contenido": "0.040" },
          { "contenido": "0.1179" }, { "contenido": "0.1176" }, { "contenido": "0.7053" }, { "contenido": "0.7050" }, { "contenido": "1.750" }, { "contenido": "0.46" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "0.7406" }, { "contenido": "1.125" }, { "contenido": "1.107" }, { "contenido": "0.752" }, { "contenido": "0.743" },
          { "contenido": "0.847" }, { "contenido": "0.750" }, { "contenido": "0.44" }, { "contenido": "0.200" }, { "contenido": "0.020" },
          { "contenido": "0.039" }, { "contenido": "0.030" }, { "contenido": "0.157" }, { "contenido": "0.025" }, { "contenido": "0.040" },
          { "contenido": "0.1416" }, { "contenido": "0.1413" }, { "contenido": "0.8473" }, { "contenido": "0.8470" }, { "contenido": "2.000" }, { "contenido": "0.50" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "0.8647" }, { "contenido": "1.312" }, { "contenido": "1.293" }, { "contenido": "0.877" }, { "contenido": "0.866" },
          { "contenido": "0.987" }, { "contenido": "0.875" }, { "contenido": "0.51" }, { "contenido": "0.234" }, { "contenido": "0.023" },
          { "contenido": "0.044" }, { "contenido": "0.034" }, { "contenido": "0.227" }, { "contenido": "0.031" }, { "contenido": "0.040" },
          { "contenido": "0.1656" }, { "contenido": "0.1653" }, { "block": "0.9873", "contenido": "0.9873" }, { "contenido": "0.9870" }, { "contenido": "2.250" }, { "contenido": "0.56" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "0.9886" }, { "contenido": "1.500" }, { "contenido": "1.479" }, { "contenido": "1.003" }, { "contenido": "0.991" },
          { "contenido": "1.130" }, { "contenido": "1.000" }, { "contenido": "0.60" }, { "contenido": "0.268" }, { "contenido": "0.026" },
          { "contenido": "0.050" }, { "contenido": "0.045" }, { "contenido": "0.332" }, { "contenido": "0.034" }, { "contenido": "0.040" },
          { "contenido": "0.1893" }, { "contenido": "0.1890" }, { "contenido": "1.1303" }, { "contenido": "1.1300" }, { "contenido": "2.500" }, { "contenido": "0.62" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8</strong>" }, { "contenido": "1.1250" }] },
          { "contenido": "1.1086" }, { "contenido": "1.688" }, { "contenido": "1.665" }, { "contenido": "1.128" }, { "contenido": "1.115" },
          { "contenido": "1.271" }, { "contenido": "1.125" }, { "contenido": "0.66" }, { "contenido": "0.310" }, { "contenido": "0.029" },
          { "contenido": "0.055" }, { "contenido": "0.045" }, { "contenido": "0.332" }, { "contenido": "0.039" }, { "contenido": "0.050" },
          { "contenido": "0.2109" }, { "contenido": "0.2106" }, { "contenido": "1.2713" }, { "contenido": "1.2710" }, { "contenido": "2.750" }, { "contenido": "0.71" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/4</strong>" }, { "contenido": "1.2500" }] },
          { "contenido": "1.2336" }, { "contenido": "1.875" }, { "contenido": "1.852" }, { "contenido": "1.253" }, { "contenido": "1.240" },
          { "contenido": "1.414" }, { "contenido": "1.250" }, { "contenido": "0.73" }, { "contenido": "0.350" }, { "contenido": "0.033" },
          { "contenido": "0.060" }, { "contenido": "0.050" }, { "contenido": "0.332" }, { "contenido": "0.044" }, { "contenido": "0.050" },
          { "contenido": "0.2331" }, { "contenido": "0.2328" }, { "contenido": "1.4143" }, { "contenido": "1.4140" }, { "contenido": "3.000" }, { "contenido": "0.71" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/8</strong>" }, { "contenido": "1.3750" }] },
          { "contenido": "1.3568" }, { "contenido": "2.062" }, { "contenido": "2.038" }, { "contenido": "1.378" }, { "contenido": "1.365" },
          { "contenido": "1.556" }, { "contenido": "1.375" }, { "contenido": "0.80" }, { "contenido": "0.392" }, { "contenido": "0.036" },
          { "contenido": "0.065" }, { "contenido": "0.055" }, { "contenido": "0.332" }, { "contenido": "0.048" }, { "contenido": "0.050" },
          { "contenido": "0.2544" }, { "contenido": "0.2541" }, { "contenido": "1.5563" }, { "contenido": "1.5560" }, { "contenido": "3.250" }, { "contenido": "0.83" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/2</strong>" }, { "contenido": "1.5000" }] },
          { "contenido": "1.4818" }, { "contenido": "2.250" }, { "contenido": "2.224" }, { "contenido": "1.503" }, { "contenido": "1.489" },
          { "contenido": "1.697" }, { "contenido": "1.500" }, { "contenido": "0.87" }, { "contenido": "0.433" }, { "contenido": "0.039" },
          { "contenido": "0.070" }, { "contenido": "0.060" }, { "contenido": "0.332" }, { "contenido": "0.052" }, { "contenido": "0.050" },
          { "contenido": "0.2763" }, { "contenido": "0.2760" }, { "contenido": "1.6973" }, { "contenido": "1.6970" }, { "contenido": "3.500" }, { "contenido": "0.83" }
        ]
      }
    ]
  },

  "pernoParkerCilindrico": {
    "titulo": "Perno Parker de Cabeza Cilíndrica (Hexágono Interior)",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "perno-parker-cabeza-cilindrica.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Tamaño Nominal (Diámetro Básico del Tornillo)" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "D" },
              { "contenido": "Diámetro del Cuerpo" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "A" },
              { "contenido": "Diámetro de la Cabeza" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "H" },
              { "contenido": "Altura de la Cabeza" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "C" },
              { "contenido": "Chaflán o Radio de Cabeza<br><small>Máx</small>" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "J" },
              { "contenido": "Tamaño del Hexágono Interior" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Nom (Frac)" },
                  { "contenido": "Nom (Dec)" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "T" },
              { "contenido": "Penetración de la Llave<br><small>Mín</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "G" },
              { "contenido": "Espesor de Pared del Hexágono<br><small>Mín</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "K" },
              { "contenido": "Chaflán o Radio de Salida<br><small>Máx</small>" }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>0</strong>" }, { "contenido": "0.0600" }] },
          { "contenido": "0.0600" }, { "contenido": "0.0568" }, { "contenido": "0.096" }, { "contenido": "0.091" },
          { "contenido": "0.060" }, { "contenido": "0.057" }, { "contenido": "0.004" }, { "contenido": "..." }, { "contenido": "0.050" },
          { "contenido": "0.025" }, { "contenido": "0.020" }, { "contenido": "0.007" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "0.0730" }] },
          { "contenido": "0.0730" }, { "contenido": "0.0695" }, { "contenido": "0.118" }, { "contenido": "0.112" },
          { "contenido": "0.073" }, { "contenido": "0.070" }, { "contenido": "0.005" }, { "contenido": "1/16" }, { "contenido": "0.062" },
          { "contenido": "0.031" }, { "contenido": "0.025" }, { "contenido": "0.007" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2</strong>" }, { "contenido": "0.0860" }] },
          { "contenido": "0.0860" }, { "contenido": "0.0822" }, { "contenido": "0.140" }, { "contenido": "0.134" },
          { "contenido": "0.086" }, { "contenido": "0.083" }, { "contenido": "0.008" }, { "contenido": "5/64" }, { "contenido": "0.078" },
          { "contenido": "0.038" }, { "contenido": "0.029" }, { "contenido": "0.007" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3</strong>" }, { "contenido": "0.0990" }] },
          { "contenido": "0.0990" }, { "contenido": "0.0949" }, { "contenido": "0.161" }, { "contenido": "0.154" },
          { "contenido": "0.099" }, { "contenido": "0.095" }, { "contenido": "0.008" }, { "contenido": "5/64" }, { "contenido": "0.078" },
          { "contenido": "0.044" }, { "contenido": "0.034" }, { "contenido": "0.007" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>4</strong>" }, { "contenido": "0.1120" }] },
          { "contenido": "0.1120" }, { "contenido": "0.1075" }, { "contenido": "0.183" }, { "contenido": "0.176" },
          { "contenido": "0.112" }, { "contenido": "0.108" }, { "contenido": "0.009" }, { "contenido": "3/32" }, { "contenido": "0.094" },
          { "contenido": "0.051" }, { "contenido": "0.038" }, { "contenido": "0.008" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5</strong>" }, { "contenido": "0.1250" }] },
          { "contenido": "0.1250" }, { "contenido": "0.1202" }, { "contenido": "0.205" }, { "contenido": "0.198" },
          { "contenido": "0.125" }, { "contenido": "0.121" }, { "contenido": "0.012" }, { "contenido": "3/32" }, { "contenido": "0.094" },
          { "contenido": "0.057" }, { "contenido": "0.043" }, { "contenido": "0.008" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>6</strong>" }, { "contenido": "0.1380" }] },
          { "contenido": "0.1380" }, { "contenido": "0.1329" }, { "contenido": "0.226" }, { "contenido": "0.216" },
          { "contenido": "0.138" }, { "contenido": "0.134" }, { "contenido": "0.013" }, { "contenido": "7/64" }, { "contenido": "0.109" },
          { "contenido": "0.064" }, { "contenido": "0.047" }, { "contenido": "0.008" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>8</strong>" }, { "contenido": "0.1640" }] },
          { "contenido": "0.1640" }, { "contenido": "0.1585" }, { "contenido": "0.270" }, { "contenido": "0.257" },
          { "contenido": "0.164" }, { "contenido": "0.159" }, { "contenido": "0.014" }, { "contenido": "9/64" }, { "contenido": "0.141" },
          { "contenido": "0.077" }, { "contenido": "0.056" }, { "contenido": "0.008" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>10</strong>" }, { "contenido": "0.1900" }] },
          { "contenido": "0.1900" }, { "contenido": "0.1840" }, { "contenido": "0.312" }, { "contenido": "0.298" },
          { "contenido": "0.190" }, { "contenido": "0.185" }, { "contenido": "0.018" }, { "contenido": "5/32" }, { "contenido": "0.156" },
          { "contenido": "0.090" }, { "contenido": "0.065" }, { "contenido": "0.008" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>12</strong>" }, { "contenido": "0.2160" }] },
          { "contenido": "0.2160" }, { "contenido": "0.2095" }, { "contenido": "0.324" }, { "contenido": "0.314" },
          { "contenido": "0.216" }, { "contenido": "0.210" }, { "contenido": "0.022" }, { "contenido": "5/32" }, { "contenido": "0.156" },
          { "contenido": "0.103" }, { "contenido": "0.082" }, { "contenido": "0.010" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/4</strong>" }, { "contenido": "0.2500" }] },
          { "contenido": "0.2500" }, { "contenido": "0.2435" }, { "contenido": "0.375" }, { "contenido": "0.354" },
          { "contenido": "0.250" }, { "contenido": "0.244" }, { "contenido": "0.025" }, { "contenido": "3/16" }, { "contenido": "0.188" },
          { "contenido": "0.120" }, { "contenido": "0.095" }, { "contenido": "0.010" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/16</strong>" }, { "contenido": "0.3125" }] },
          { "contenido": "0.3125" }, { "contenido": "0.3053" }, { "contenido": "0.469" }, { "contenido": "0.446" },
          { "contenido": "0.312" }, { "contenido": "0.306" }, { "contenido": "0.033" }, { "contenido": "1/4" }, { "contenido": "0.250" },
          { "contenido": "0.151" }, { "contenido": "0.119" }, { "contenido": "0.010" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/8</strong>" }, { "contenido": "0.3750" }] },
          { "contenido": "0.3750" }, { "contenido": "0.3678" }, { "contenido": "0.562" }, { "contenido": "0.540" },
          { "contenido": "0.375" }, { "contenido": "0.368" }, { "contenido": "0.040" }, { "contenido": "5/16" }, { "contenido": "0.312" },
          { "contenido": "0.182" }, { "contenido": "0.143" }, { "contenido": "0.010" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/16</strong>" }, { "contenido": "0.4375" }] },
          { "contenido": "0.4375" }, { "contenido": "0.4294" }, { "contenido": "0.656" }, { "contenido": "0.631" },
          { "contenido": "0.438" }, { "contenido": "0.430" }, { "contenido": "0.047" }, { "contenido": "3/8" }, { "contenido": "0.375" },
          { "contenido": "0.213" }, { "contenido": "0.166" }, { "contenido": "0.015" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "0.5000" }, { "contenido": "0.4919" }, { "contenido": "0.750" }, { "contenido": "0.725" },
          { "contenido": "0.500" }, { "contenido": "0.492" }, { "contenido": "0.055" }, { "contenido": "3/8" }, { "contenido": "0.375" },
          { "contenido": "0.245" }, { "contenido": "0.190" }, { "contenido": "0.015" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>9/16</strong>" }, { "contenido": "0.5625" }] },
          { "contenido": "0.5625" }, { "contenido": "0.5538" }, { "contenido": "0.843" }, { "contenido": "0.827" },
          { "contenido": "0.562" }, { "contenido": "0.554" }, { "contenido": "0.062" }, { "contenido": "7/16" }, { "contenido": "0.437" },
          { "contenido": "0.276" }, { "contenido": "0.214" }, { "contenido": "0.015" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "0.6250" }, { "contenido": "0.6163" }, { "contenido": "0.938" }, { "contenido": "0.914" },
          { "contenido": "0.625" }, { "contenido": "0.616" }, { "contenido": "0.070" }, { "contenido": "1/2" }, { "contenido": "0.500" },
          { "contenido": "0.307" }, { "contenido": "0.238" }, { "contenido": "0.015" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "0.7500" }, { "contenido": "0.7406" }, { "contenido": "1.125" }, { "contenido": "1.094" },
          { "contenido": "0.750" }, { "contenido": "0.740" }, { "contenido": "0.085" }, { "contenido": "5/8" }, { "contenido": "0.625" },
          { "contenido": "0.370" }, { "contenido": "0.285" }, { "contenido": "0.015" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "0.8750" }, { "contenido": "0.8647" }, { "contenido": "1.312" }, { "contenido": "1.291" },
          { "contenido": "0.875" }, { "contenido": "0.864" }, { "contenido": "0.100" }, { "contenido": "3/4" }, { "contenido": "0.750" },
          { "contenido": "0.432" }, { "contenido": "0.333" }, { "contenido": "0.020" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "1.0000" }, { "contenido": "0.9886" }, { "contenido": "1.500" }, { "contenido": "1.476" },
          { "contenido": "1.000" }, { "contenido": "0.988" }, { "contenido": "0.114" }, { "contenido": "3/4" }, { "contenido": "0.750" },
          { "contenido": "0.495" }, { "contenido": "0.380" }, { "contenido": "0.020" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8</strong>" }, { "contenido": "1.1250" }] },
          { "contenido": "1.1250" }, { "contenido": "1.1086" }, { "contenido": "1.688" }, { "contenido": "1.665" },
          { "contenido": "1.125" }, { "contenido": "1.111" }, { "contenido": "0.129" }, { "contenido": "7/8" }, { "contenido": "0.875" },
          { "contenido": "0.557" }, { "contenido": "0.428" }, { "contenido": "0.020" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/4</strong>" }, { "contenido": "1.2500" }] },
          { "contenido": "1.2500" }, { "contenido": "1.2336" }, { "contenido": "1.875" }, { "contenido": "1.852" },
          { "contenido": "1.250" }, { "contenido": "1.236" }, { "contenido": "0.144" }, { "contenido": "7/8" }, { "contenido": "0.875" },
          { "contenido": "0.620" }, { "contenido": "0.475" }, { "contenido": "0.020" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/8</strong>" }, { "contenido": "1.3750" }] },
          { "contenido": "1.3750" }, { "contenido": "1.3568" }, { "contenido": "2.062" }, { "contenido": "2.038" },
          { "contenido": "1.375" }, { "contenido": "1.360" }, { "contenido": "0.160" }, { "contenido": "1" }, { "contenido": "1.000" },
          { "contenido": "0.682" }, { "contenido": "0.523" }, { "contenido": "0.020" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/2</strong>" }, { "contenido": "1.5000" }] },
          { "contenido": "1.5000" }, { "contenido": "1.4818" }, { "contenido": "2.250" }, { "contenido": "2.224" },
          { "contenido": "1.500" }, { "contenido": "1.485" }, { "contenido": "0.176" }, { "contenido": "1" }, { "contenido": "1.000" },
          { "contenido": "0.745" }, { "contenido": "0.570" }, { "contenido": "0.020" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/4</strong>" }, { "contenido": "1.7500" }] },
          { "contenido": "1.7500" }, { "contenido": "1.7295" }, { "contenido": "2.625" }, { "contenido": "2.597" },
          { "contenido": "1.750" }, { "contenido": "1.734" }, { "contenido": "0.207" }, { "contenido": "1-1/4" }, { "contenido": "1.250" },
          { "contenido": "0.870" }, { "contenido": "0.665" }, { "contenido": "0.020" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2</strong>" }, { "contenido": "2.0000" }] },
          { "contenido": "2.0000" }, { "contenido": "1.9780" }, { "contenido": "3.000" }, { "contenido": "2.970" },
          { "contenido": "2.000" }, { "contenido": "1.983" }, { "contenido": "0.238" }, { "contenido": "1-1/2" }, { "contenido": "1.500" },
          { "contenido": "0.995" }, { "contenido": "0.760" }, { "contenido": "0.020" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-1/4</strong>" }, { "contenido": "2.2500" }] },
          { "contenido": "2.2500" }, { "contenido": "2.2280" }, { "contenido": "3.375" }, { "contenido": "3.344" },
          { "contenido": "2.250" }, { "contenido": "2.232" }, { "contenido": "0.269" }, { "direction": "column", "contenido": [{ "contenido": "1-3/4" }, { "contenido": "1.750" }] },
          { "contenido": "1.120" }, { "contenido": "0.855" }, { "contenido": "0.036" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-1/2</strong>" }, { "contenido": "2.5000" }] },
          { "contenido": "2.5000" }, { "contenido": "2.4762" }, { "contenido": "3.750" }, { "contenido": "3.717" },
          { "contenido": "2.500" }, { "contenido": "2.481" }, { "contenido": "0.300" }, { "direction": "column", "contenido": [{ "contenido": "1-3/4" }, { "contenido": "1.750" }] },
          { "contenido": "1.245" }, { "contenido": "0.950" }, { "contenido": "0.036" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-3/4</strong>" }, { "contenido": "2.7500" }] },
          { "contenido": "2.7500" }, { "contenido": "2.7262" }, { "contenido": "4.125" }, { "contenido": "4.090" },
          { "contenido": "2.750" }, { "contenido": "2.730" }, { "contenido": "0.332" }, { "direction": "column", "contenido": [{ "contenido": "2" }, { "contenido": "2.000" }] },
          { "contenido": "1.370" }, { "contenido": "1.045" }, { "contenido": "0.036" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3</strong>" }, { "contenido": "3.0000" }] },
          { "contenido": "3.0000" }, { "contenido": "2.9762" }, { "contenido": "4.500" }, { "contenido": "4.464" },
          { "contenido": "3.000" }, { "contenido": "2.979" }, { "contenido": "0.363" }, { "direction": "column", "contenido": [{ "contenido": "2-1/4" }, { "contenido": "2.250" }] },
          { "contenido": "1.495" }, { "contenido": "1.140" }, { "contenido": "0.036" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3-1/4</strong>" }, { "contenido": "3.2500" }] },
          { "contenido": "3.2500" }, { "contenido": "3.2262" }, { "contenido": "4.875" }, { "contenido": "4.837" },
          { "contenido": "3.250" }, { "contenido": "3.228" }, { "contenido": "0.394" }, { "direction": "column", "contenido": [{ "contenido": "2-1/4" }, { "contenido": "2.250" }] },
          { "contenido": "1.620" }, { "contenido": "1.235" }, { "contenido": "0.036" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3-1/2</strong>" }, { "contenido": "3.5000" }] },
          { "contenido": "3.5000" }, { "contenido": "3.4762" }, { "contenido": "5.250" }, { "contenido": "5.211" },
          { "contenido": "3.500" }, { "contenido": "3.478" }, { "contenido": "0.426" }, { "direction": "column", "contenido": [{ "contenido": "2-3/4" }, { "contenido": "2.750" }] },
          { "contenido": "1.745" }, { "contenido": "1.330" }, { "contenido": "0.036" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3-3/4</strong>" }, { "contenido": "3.7500" }] },
          { "contenido": "3.7500" }, { "contenido": "3.7262" }, { "contenido": "5.625" }, { "contenido": "5.584" },
          { "contenido": "3.750" }, { "contenido": "3.727" }, { "contenido": "0.458" }, { "direction": "column", "contenido": [{ "contenido": "2-3/4" }, { "contenido": "2.750" }] },
          { "contenido": "1.870" }, { "contenido": "1.425" }, { "contenido": "0.036" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>4</strong>" }, { "contenido": "4.0000" }] },
          { "contenido": "4.0000" }, { "contenido": "3.9762" }, { "contenido": "6.000" }, { "contenido": "5.958" },
          { "contenido": "4.000" }, { "contenido": "3.976" }, { "contenido": "0.489" }, { "direction": "column", "contenido": [{ "contenido": "3" }, { "contenido": "3.000" }] },
          { "contenido": "1.995" }, { "contenido": "1.520" }, { "contenido": "0.036" }
        ]
      }
    ]
  },

  "pernoParkerCabezaPlana": {
    "titulo": "Perno Parker de Cabeza Plana (Hexágono Interior)",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "perno-parker-cabeza-plana.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Tamaño Nominal (Diámetro Básico del Tornillo)" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "D" },
              { "contenido": "Diámetro del Cuerpo" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "A" },
              { "contenido": "Diámetro de la Cabeza" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "H" },
              { "contenido": "Altura de la Cabeza<br><small>Ref</small>" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "G" },
              { "contenido": "Diámetro del Calibre de Protuberancia" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "P" },
              { "contenido": "Protuberancia" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "J" },
              { "contenido": "Tamaño del Hexágono Interior" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Nom (Frac)" },
                  { "contenido": "Nom (Dec)" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "T" },
              { "contenido": "Penetración de la Llave<br><small>Mín</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "F" },
              { "contenido": "Diámetro de Transición del Entallado<br><small>Máx</small>" }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>0</strong>" }, { "contenido": "0.0600" }] },
          { "contenido": "0.0600" }, { "contenido": "0.0568" }, { "contenido": "0.138" }, { "contenido": "0.117" },
          { "contenido": "0.044" }, { "contenido": "0.078" }, { "contenido": "0.077" }, { "contenido": "0.044" }, { "contenido": "0.026" },
          { "contenido": "..." }, { "contenido": "0.035" }, { "contenido": "0.025" }, { "contenido": "0.072" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "0.0730" }] },
          { "contenido": "0.0730" }, { "contenido": "0.0695" }, { "contenido": "0.168" }, { "contenido": "0.143" },
          { "contenido": "0.054" }, { "contenido": "0.101" }, { "contenido": "0.100" }, { "contenido": "0.048" }, { "contenido": "0.028" },
          { "contenido": "..." }, { "contenido": "0.050" }, { "contenido": "0.031" }, { "contenido": "0.089" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2</strong>" }, { "contenido": "0.0860" }] },
          { "contenido": "0.0860" }, { "contenido": "0.0822" }, { "contenido": "0.197" }, { "contenido": "0.168" },
          { "contenido": "0.064" }, { "contenido": "0.124" }, { "contenido": "0.123" }, { "contenido": "0.051" }, { "contenido": "0.031" },
          { "contenido": "..." }, { "contenido": "0.050" }, { "contenido": "0.038" }, { "contenido": "0.106" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3</strong>" }, { "contenido": "0.0990" }] },
          { "contenido": "0.0990" }, { "contenido": "0.0949" }, { "contenido": "0.226" }, { "contenido": "0.193" },
          { "contenido": "0.073" }, { "contenido": "0.148" }, { "contenido": "0.147" }, { "contenido": "0.054" }, { "contenido": "0.033" },
          { "contenido": "1/16" }, { "contenido": "0.062" }, { "contenido": "0.044" }, { "contenido": "0.119" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>4</strong>" }, { "contenido": "0.1120" }] },
          { "contenido": "0.1120" }, { "contenido": "0.1075" }, { "contenido": "0.255" }, { "contenido": "0.218" },
          { "contenido": "0.083" }, { "contenido": "0.172" }, { "contenido": "0.171" }, { "contenido": "0.057" }, { "contenido": "0.036" },
          { "contenido": "1/16" }, { "contenido": "0.062" }, { "contenido": "0.055" }, { "contenido": "0.136" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5</strong>" }, { "contenido": "0.1250" }] },
          { "contenido": "0.1250" }, { "contenido": "0.1202" }, { "contenido": "0.281" }, { "contenido": "0.240" },
          { "contenido": "0.090" }, { "contenido": "0.196" }, { "contenido": "0.195" }, { "contenido": "0.059" }, { "contenido": "0.037" },
          { "contenido": "5/64" }, { "contenido": "0.078" }, { "contenido": "0.061" }, { "contenido": "0.153" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>6</strong>" }, { "contenido": "0.1380" }] },
          { "contenido": "0.1380" }, { "contenido": "0.1329" }, { "contenido": "0.307" }, { "contenido": "0.263" },
          { "contenido": "0.097" }, { "contenido": "0.220" }, { "contenido": "0.219" }, { "contenido": "0.060" }, { "contenido": "0.037" },
          { "contenido": "5/64" }, { "contenido": "0.078" }, { "contenido": "0.066" }, { "contenido": "0.168" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>8</strong>" }, { "contenido": "0.1640" }] },
          { "contenido": "0.1640" }, { "contenido": "0.1585" }, { "contenido": "0.359" }, { "contenido": "0.311" },
          { "contenido": "0.112" }, { "contenido": "0.267" }, { "contenido": "0.266" }, { "contenido": "0.063" }, { "contenido": "0.039" },
          { "contenido": "3/32" }, { "contenido": "0.094" }, { "contenido": "0.076" }, { "contenido": "0.194" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>10</strong>" }, { "contenido": "0.1900" }] },
          { "contenido": "0.1900" }, { "contenido": "0.1840" }, { "contenido": "0.411" }, { "contenido": "0.359" },
          { "contenido": "0.127" }, { "contenido": "0.313" }, { "contenido": "0.312" }, { "contenido": "0.066" }, { "contenido": "0.041" },
          { "contenido": "1/8" }, { "contenido": "0.125" }, { "contenido": "0.087" }, { "contenido": "0.220" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>12</strong>" }, { "contenido": "0.2158" }] },
          { "contenido": "0.2158" }, { "contenido": "0.2102" }, { "contenido": "0.450" }, { "contenido": "0.410" },
          { "contenido": "0.135" }, { "contenido": "0.360" }, { "contenido": "0.359" }, { "contenido": "0.069" }, { "contenido": "0.042" },
          { "contenido": "1/8" }, { "contenido": "0.125" }, { "contenido": "0.094" }, { "contenido": "0.246" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/4</strong>" }, { "contenido": "0.2500" }] },
          { "contenido": "0.2500" }, { "contenido": "0.2435" }, { "contenido": "0.531" }, { "contenido": "0.480" },
          { "contenido": "0.161" }, { "contenido": "0.424" }, { "contenido": "0.423" }, { "contenido": "0.072" }, { "contenido": "0.043" },
          { "contenido": "5/32" }, { "contenido": "0.156" }, { "contenido": "0.111" }, { "contenido": "0.280" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/16</strong>" }, { "contenido": "0.3125" }] },
          { "contenido": "0.3125" }, { "contenido": "0.3053" }, { "contenido": "0.656" }, { "contenido": "0.600" },
          { "contenido": "0.198" }, { "contenido": "0.539" }, { "contenido": "0.538" }, { "contenido": "0.078" }, { "contenido": "0.047" },
          { "contenido": "3/16" }, { "contenido": "0.188" }, { "contenido": "0.135" }, { "contenido": "0.343" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/8</strong>" }, { "contenido": "0.3750" }] },
          { "contenido": "0.3750" }, { "contenido": "0.3678" }, { "contenido": "0.781" }, { "contenido": "0.720" },
          { "contenido": "0.234" }, { "contenido": "0.653" }, { "contenido": "0.652" }, { "contenido": "0.088" }, { "contenido": "0.050" },
          { "contenido": "7/32" }, { "contenido": "0.219" }, { "contenido": "0.159" }, { "contenido": "0.405" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/16</strong>" }, { "contenido": "0.4375" }] },
          { "contenido": "0.4375" }, { "contenido": "0.4294" }, { "contenido": "0.844" }, { "contenido": "0.781" },
          { "contenido": "0.234" }, { "contenido": "0.690" }, { "contenido": "0.689" }, { "contenido": "0.104" }, { "contenido": "0.063" },
          { "contenido": "1/4" }, { "contenido": "0.250" }, { "contenido": "0.159" }, { "contenido": "0.468" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "0.5000" }, { "contenido": "0.4919" }, { "contenido": "0.938" }, { "contenido": "0.872" },
          { "contenido": "0.251" }, { "contenido": "0.739" }, { "contenido": "0.738" }, { "contenido": "0.131" }, { "contenido": "0.087" },
          { "contenido": "5/16" }, { "contenido": "0.312" }, { "contenido": "0.172" }, { "contenido": "0.530" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "0.6250" }, { "contenido": "0.6163" }, { "contenido": "1.188" }, { "contenido": "1.112" },
          { "contenido": "0.324" }, { "contenido": "0.962" }, { "contenido": "0.961" }, { "contenido": "0.146" }, { "contenido": "0.096" },
          { "contenido": "3/8" }, { "contenido": "0.375" }, { "contenido": "0.220" }, { "contenido": "0.655" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "0.7500" }, { "contenido": "0.7406" }, { "contenido": "1.438" }, { "contenido": "1.355" },
          { "contenido": "0.396" }, { "contenido": "1.186" }, { "contenido": "1.185" }, { "contenido": "0.170" }, { "contenido": "0.105" },
          { "contenido": "1/2" }, { "contenido": "0.500" }, { "contenido": "0.220" }, { "contenido": "0.780" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "0.8750" }, { "contenido": "0.8647" }, { "contenido": "1.688" }, { "contenido": "1.604" },
          { "contenido": "0.468" }, { "contenido": "1.411" }, { "contenido": "1.410" }, { "contenido": "0.165" }, { "contenido": "0.118" },
          { "contenido": "9/16" }, { "contenido": "0.562" }, { "contenido": "0.248" }, { "contenido": "0.905" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "1.0000" }, { "contenido": "0.9886" }, { "contenido": "1.938" }, { "contenido": "1.841" },
          { "contenido": "0.540" }, { "contenido": "1.635" }, { "contenido": "1.634" }, { "contenido": "0.181" }, { "contenido": "0.130" },
          { "contenido": "5/8" }, { "contenido": "0.625" }, { "contenido": "0.297" }, { "contenido": "1.030" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8</strong>" }, { "contenido": "1.1250" }] },
          { "contenido": "1.1250" }, { "contenido": "1.1086" }, { "contenido": "2.188" }, { "contenido": "2.079" },
          { "contenido": "0.611" }, { "contenido": "1.859" }, { "contenido": "1.858" }, { "contenido": "0.196" }, { "contenido": "0.140" },
          { "contenido": "3/4" }, { "contenido": "0.750" }, { "contenido": "0.325" }, { "contenido": "1.187" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/4</strong>" }, { "contenido": "1.2500" }] },
          { "contenido": "1.2500" }, { "contenido": "1.2336" }, { "contenido": "2.438" }, { "contenido": "2.316" },
          { "contenido": "0.683" }, { "contenido": "2.083" }, { "contenido": "2.082" }, { "contenido": "0.212" }, { "contenido": "0.150" },
          { "contenido": "7/8" }, { "contenido": "0.875" }, { "contenido": "0.358" }, { "contenido": "1.312" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/8</strong>" }, { "contenido": "1.3750" }] },
          { "contenido": "1.3750" }, { "contenido": "1.3568" }, { "contenido": "2.688" }, { "contenido": "2.553" },
          { "contenido": "0.755" }, { "contenido": "2.306" }, { "contenido": "2.305" }, { "contenido": "0.228" }, { "contenido": "0.162" },
          { "contenido": "7/8" }, { "contenido": "0.875" }, { "contenido": "0.402" }, { "contenido": "1.437" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/2</strong>" }, { "contenido": "1.5000" }] },
          { "contenido": "1.5000" }, { "contenido": "1.4818" }, { "contenido": "2.938" }, { "contenido": "2.791" },
          { "contenido": "0.827" }, { "contenido": "2.530" }, { "contenido": "2.529" }, { "contenido": "0.243" }, { "contenido": "0.173" },
          { "contenido": "1" }, { "contenido": "1.000" }, { "contenido": "0.435" }, { "contenido": "1.562" }
        ]
      }
    ]
  },

  "prisioneroAllen": {
    "titulo": "Prisionero Allen",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "prisionero-allen.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Tamaño Nominal (Diámetro Básico del Tornillo)" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "J" },
              { "contenido": "Tamaño del Hexágono Interior" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Nom (Frac)" },
                  { "contenido": "Nom (Dec)" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "T" },
              { "contenido": "Penetración Mín de la Llave para Capacidad Funcional<br><small>Hex. Socket T<sub>H</sub> Mín</small>" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "C" },
              { "contenido": "Diámetros de Punta Cóncava y Plana" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "R" },
              { "contenido": "Radio de Punta Ovalada<br><small>Básico</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "Y" },
              { "contenido": "Ángulo de Punta Cónica<br><small>90° ±2° para Long. Nominales o Mayores; 118° ±2° para Long. Cortas</small>" }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>0</strong>" }, { "contenido": "0.0600" }] },
          { "contenido": "..." }, { "contenido": "0.028" }, { "contenido": "0.050" }, { "contenido": "0.033" }, { "contenido": "0.027" }, { "contenido": "0.045" }, { "contenido": "0.09" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "0.0730" }] },
          { "contenido": "..." }, { "contenido": "0.035" }, { "contenido": "0.060" }, { "contenido": "0.040" }, { "contenido": "0.033" }, { "contenido": "0.055" }, { "contenido": "0.09" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2</strong>" }, { "contenido": "0.0860" }] },
          { "contenido": "..." }, { "contenido": "0.035" }, { "contenido": "0.060" }, { "contenido": "0.047" }, { "contenido": "0.039" }, { "contenido": "0.064" }, { "contenido": "0.13" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3</strong>" }, { "contenido": "0.0990" }] },
          { "contenido": "..." }, { "contenido": "0.050" }, { "contenido": "0.070" }, { "contenido": "0.054" }, { "contenido": "0.045" }, { "contenido": "0.074" }, { "contenido": "0.13" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>4</strong>" }, { "contenido": "0.1120" }] },
          { "contenido": "..." }, { "contenido": "0.050" }, { "contenido": "0.070" }, { "contenido": "0.061" }, { "contenido": "0.051" }, { "contenido": "0.084" }, { "contenido": "0.19" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5</strong>" }, { "contenido": "0.1250" }] },
          { "contenido": "1/16" }, { "contenido": "0.062" }, { "contenido": "0.080" }, { "contenido": "0.067" }, { "contenido": "0.057" }, { "contenido": "0.094" }, { "contenido": "0.19" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5</strong>" }, { "contenido": "0.1250" }] },
          { "contenido": "1/16" }, { "contenido": "0.062" }, { "contenido": "0.080" }, { "contenido": "0.067" }, { "contenido": "0.057" }, { "contenido": "0.094" }, { "contenido": "0.19" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>6</strong>" }, { "contenido": "0.1380" }] },
          { "contenido": "1/16" }, { "contenido": "0.062" }, { "contenido": "0.080" }, { "contenido": "0.074" }, { "contenido": "0.064" }, { "contenido": "0.104" }, { "contenido": "0.19" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>6</strong>" }, { "contenido": "0.1380" }] },
          { "contenido": "1/16" }, { "contenido": "0.062" }, { "contenido": "0.080" }, { "contenido": "0.074" }, { "contenido": "0.064" }, { "contenido": "0.104" }, { "contenido": "0.19" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>6</strong>" }, { "contenido": "0.1380" }] },
          { "contenido": "..." }, { "contenido": "..." }, { "contenido": "0.080" }, { "contenido": "0.087" }, { "contenido": "0.076" }, { "contenido": "0.123" }, { "contenido": "0.25" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>8</strong>" }, { "contenido": "0.1640" }] },
          { "contenido": "5/64" }, { "contenido": "0.078" }, { "contenido": "0.090" }, { "contenido": "0.091" }, { "contenido": "0.081" }, { "contenido": "0.123" }, { "contenido": "0.25" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>10</strong>" }, { "contenido": "0.1900" }] },
          { "contenido": "3/32" }, { "contenido": "0.094" }, { "contenido": "0.100" }, { "contenido": "0.102" }, { "contenido": "0.088" }, { "contenido": "0.142" }, { "contenido": "0.25" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/4</strong>" }, { "contenido": "0.2500" }] },
          { "contenido": "1/8" }, { "contenido": "0.125" }, { "contenido": "0.125" }, { "contenido": "0.132" }, { "contenido": "0.118" }, { "contenido": "0.188" }, { "contenido": "0.31" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/16</strong>" }, { "contenido": "0.3125" }] },
          { "contenido": "5/32" }, { "contenido": "0.156" }, { "contenido": "0.156" }, { "contenido": "0.172" }, { "contenido": "0.156" }, { "contenido": "0.234" }, { "contenido": "0.38" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/8</strong>" }, { "contenido": "0.3750" }] },
          { "contenido": "3/16" }, { "contenido": "0.188" }, { "contenido": "0.188" }, { "contenido": "0.212" }, { "contenido": "0.194" }, { "contenido": "0.281" }, { "contenido": "0.44" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/16</strong>" }, { "contenido": "0.4375" }] },
          { "contenido": "7/32" }, { "contenido": "0.219" }, { "contenido": "0.219" }, { "contenido": "0.252" }, { "contenido": "0.232" }, { "contenido": "0.328" }, { "contenido": "0.50" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "1/4" }, { "contenido": "0.250" }, { "contenido": "0.250" }, { "contenido": "0.291" }, { "contenido": "0.270" }, { "contenido": "0.375" }, { "contenido": "0.57" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "5/16" }, { "contenido": "0.312" }, { "contenido": "0.312" }, { "contenido": "0.371" }, { "contenido": "0.347" }, { "contenido": "0.469" }, { "contenido": "0.75" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "3/8" }, { "contenido": "0.375" }, { "contenido": "0.375" }, { "contenido": "0.450" }, { "contenido": "0.425" }, { "contenido": "0.562" }, { "contenido": "0.88" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "1/2" }, { "contenido": "0.500" }, { "contenido": "0.500" }, { "contenido": "0.530" }, { "contenido": "0.502" }, { "contenido": "0.656" }, { "contenido": "1.00" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "9/16" }, { "contenido": "0.562" }, { "contenido": "0.562" }, { "contenido": "0.609" }, { "contenido": "0.579" }, { "contenido": "0.750" }, { "contenido": "1.13" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8</strong>" }, { "contenido": "1.1250" }] },
          { "contenido": "9/16" }, { "contenido": "0.562" }, { "contenido": "0.562" }, { "contenido": "0.689" }, { "contenido": "0.655" }, { "contenido": "0.844" }, { "contenido": "1.25" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/4</strong>" }, { "contenido": "1.2500" }] },
          { "contenido": "5/8" }, { "contenido": "0.625" }, { "contenido": "0.625" }, { "contenido": "0.767" }, { "contenido": "0.733" }, { "contenido": "0.938" }, { "contenido": "1.50" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/8</strong>" }, { "contenido": "1.3750" }] },
          { "contenido": "5/8" }, { "contenido": "0.625" }, { "contenido": "0.625" }, { "contenido": "0.848" }, { "contenido": "0.808" }, { "contenido": "1.031" }, { "contenido": "1.63" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/2</strong>" }, { "contenido": "1.5000" }] },
          { "contenido": "3/4" }, { "contenido": "0.750" }, { "contenido": "0.750" }, { "contenido": "0.926" }, { "contenido": "0.886" }, { "contenido": "1.125" }, { "contenido": "1.75" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/4</strong>" }, { "contenido": "1.7500" }] },
          { "contenido": "1" }, { "contenido": "1.000" }, { "contenido": "1.000" }, { "contenido": "1.086" }, { "contenido": "1.039" }, { "contenido": "1.312" }, { "contenido": "2.00" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2</strong>" }, { "contenido": "2.0000" }] },
          { "contenido": "1" }, { "contenido": "1.000" }, { "contenido": "1.000" }, { "contenido": "1.244" }, { "contenido": "1.193" }, { "contenido": "1.500" }, { "contenido": "2.25" }
        ]
      }
    ]
  },

  "tuercaCuadrada": {
    "titulo": "Tuerca Cuadrada",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "tuerca-cuadrada.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Tamaño Nominal o Diámetro Mayor Básico de la Rosca" }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "F" },
              { "contenido": "Ancho Entre Caras" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "G" },
              { "contenido": "Ancho Entre Vértices" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "Espesor" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "Descentramiento" },
              { "contenido": "Superficie de Apoyo al Eje de la Rosca (FIM)<br><small>Máx</small>" }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/4</strong>" }, { "contenido": "0.2500" }] },
          { "contenido": "7/16" }, { "contenido": "0.438" }, { "contenido": "0.425" },
          { "contenido": "0.619" }, { "contenido": "0.554" },
          { "contenido": "7/32" }, { "contenido": "0.235" }, { "contenido": "0.203" },
          { "contenido": "0.011" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/16</strong>" }, { "contenido": "0.3125" }] },
          { "contenido": "9/16" }, { "contenido": "0.562" }, { "contenido": "0.547" },
          { "contenido": "0.795" }, { "contenido": "0.721" },
          { "contenido": "17/64" }, { "contenido": "0.283" }, { "contenido": "0.249" },
          { "contenido": "0.015" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/8</strong>" }, { "contenido": "0.3750" }] },
          { "contenido": "5/8" }, { "contenido": "0.625" }, { "contenido": "0.606" },
          { "contenido": "0.884" }, { "contenido": "0.802" },
          { "contenido": "21/64" }, { "contenido": "0.346" }, { "contenido": "0.310" },
          { "contenido": "0.016" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/16</strong>" }, { "contenido": "0.4375" }] },
          { "contenido": "3/4" }, { "contenido": "0.750" }, { "contenido": "0.728" },
          { "contenido": "1.061" }, { "contenido": "0.970" },
          { "contenido": "3/8" }, { "contenido": "0.394" }, { "contenido": "0.356" },
          { "contenido": "0.019" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "13/16" }, { "contenido": "0.812" }, { "contenido": "0.788" },
          { "contenido": "1.149" }, { "contenido": "1.052" },
          { "contenido": "7/16" }, { "contenido": "0.458" }, { "contenido": "0.418" },
          { "contenido": "0.022" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "1" }, { "contenido": "1.000" }, { "contenido": "0.969" },
          { "contenido": "1.414" }, { "contenido": "1.300" },
          { "contenido": "35/64" }, { "contenido": "0.569" }, { "contenido": "0.525" },
          { "contenido": "0.026" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "1-1/8" }, { "contenido": "1.125" }, { "contenido": "1.088" },
          { "contenido": "1.591" }, { "contenido": "1.464" },
          { "contenido": "21/32" }, { "contenido": "0.680" }, { "contenido": "0.632" },
          { "contenido": "0.029" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "1-5/16" }, { "contenido": "1.312" }, { "contenido": "1.269" },
          { "contenido": "1.856" }, { "contenido": "1.712" },
          { "contenido": "49/64" }, { "contenido": "0.792" }, { "contenido": "0.740" },
          { "contenido": "0.034" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "1-1/2" }, { "contenido": "1.500" }, { "contenido": "1.450" },
          { "contenido": "2.121" }, { "contenido": "1.961" },
          { "contenido": "7/8" }, { "contenido": "0.903" }, { "contenido": "0.847" },
          { "contenido": "0.039" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8</strong>" }, { "contenido": "1.1250" }] },
          { "contenido": "1-11/16" }, { "contenido": "1.688" }, { "contenido": "1.631" },
          { "contenido": "2.386" }, { "contenido": "2.209" },
          { "contenido": "1" }, { "contenido": "1.030" }, { "contenido": "0.970" },
          { "contenido": "0.029" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/4</strong>" }, { "contenido": "1.2500" }] },
          { "contenido": "1-7/8" }, { "contenido": "1.875" }, { "contenido": "1.812" },
          { "contenido": "2.652" }, { "contenido": "2.458" },
          { "contenido": "1-3/32" }, { "contenido": "1.126" }, { "contenido": "1.062" },
          { "contenido": "0.032" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/8</strong>" }, { "contenido": "1.3750" }] },
          { "contenido": "2-1/16" }, { "contenido": "2.062" }, { "contenido": "1.994" },
          { "contenido": "2.917" }, { "contenido": "2.708" },
          { "contenido": "1-13/64" }, { "contenido": "1.237" }, { "contenido": "1.169" },
          { "contenido": "0.035" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/2</strong>" }, { "contenido": "1.5000" }] },
          { "contenido": "2-1/4" }, { "contenido": "2.250" }, { "contenido": "2.175" },
          { "contenido": "3.182" }, { "contenido": "2.956" },
          { "contenido": "1-5/16" }, { "contenido": "1.348" }, { "contenido": "1.276" },
          { "contenido": "0.039" }
        ]
      }
    ]
  },

  "tuercaHexagonal": {
    "titulo": "Tuerca Hexagonal",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "tuerca-hexagonal.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Tamaño Nominal o Diámetro Mayor Básico de la Rosca" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "F" },
              { "contenido": "Ancho Entre Caras" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "G" },
              { "contenido": "Ancho Entre Vértices" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "H" },
              { "contenido": "Espesor de Tuerca Hexagonal Estándar" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "H<sup>1</sup>" },
              { "contenido": "Espesor de Tuerca Hexagonal de Seguridad (Perfil Bajo)" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "Descentramiento de la Superficie de Apoyo al Eje de la Rosca (FIM)" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Tuerca Estándar - Carga de Prueba Hasta 150,000 psi (Máx)" },
                  { "contenido": "Tuerca Estándar - Carga de Prueba Mayor a 150,000 psi (Máx)" },
                  { "contenido": "Tuerca de Seguridad - Todos los Niveles de Resistencia (Máx)" }
                ]
              }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/4</strong>" }, { "contenido": "0.2500" }] },
          { "contenido": "0.438" }, { "contenido": "0.428" }, { "contenido": "0.505" }, { "contenido": "0.488" },
          { "contenido": "0.226" }, { "contenido": "0.212" }, { "contenido": "0.163" }, { "contenido": "0.150" },
          { "contenido": "0.015" }, { "contenido": "0.010" }, { "contenido": "0.015" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/16</strong>" }, { "contenido": "0.3125" }] },
          { "contenido": "0.500" }, { "contenido": "0.489" }, { "contenido": "0.577" }, { "contenido": "0.557" },
          { "contenido": "0.273" }, { "contenido": "0.258" }, { "contenido": "0.195" }, { "contenido": "0.180" },
          { "contenido": "0.016" }, { "contenido": "0.011" }, { "contenido": "0.016" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/8</strong>" }, { "contenido": "0.3750" }] },
          { "contenido": "0.563" }, { "contenido": "0.551" }, { "contenido": "0.650" }, { "contenido": "0.628" },
          { "contenido": "0.337" }, { "contenido": "0.320" }, { "contenido": "0.227" }, { "contenido": "0.210" },
          { "contenido": "0.017" }, { "contenido": "0.012" }, { "contenido": "0.017" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/16</strong>" }, { "contenido": "0.4375" }] },
          { "contenido": "0.688" }, { "contenido": "0.675" }, { "contenido": "0.794" }, { "contenido": "0.768" },
          { "contenido": "0.385" }, { "contenido": "0.365" }, { "contenido": "0.260" }, { "contenido": "0.240" },
          { "contenido": "0.018" }, { "contenido": "0.013" }, { "contenido": "0.018" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "0.750" }, { "contenido": "0.736" }, { "contenido": "0.866" }, { "contenido": "0.840" },
          { "contenido": "0.448" }, { "contenido": "0.427" }, { "contenido": "0.323" }, { "contenido": "0.302" },
          { "contenido": "0.019" }, { "contenido": "0.014" }, { "contenido": "0.019" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>9/16</strong>" }, { "contenido": "0.5625" }] },
          { "contenido": "0.875" }, { "contenido": "0.861" }, { "contenido": "1.010" }, { "contenido": "0.982" },
          { "contenido": "0.496" }, { "contenido": "0.473" }, { "contenido": "0.324" }, { "contenido": "0.301" },
          { "contenido": "0.020" }, { "contenido": "0.015" }, { "contenido": "0.020" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "0.938" }, { "contenido": "0.922" }, { "contenido": "1.083" }, { "contenido": "1.051" },
          { "contenido": "0.559" }, { "contenido": "0.535" }, { "contenido": "0.387" }, { "contenido": "0.363" },
          { "contenido": "0.021" }, { "contenido": "0.016" }, { "contenido": "0.021" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "1.125" }, { "contenido": "1.088" }, { "contenido": "1.299" }, { "contenido": "1.240" },
          { "contenido": "0.625" }, { "contenido": "0.617" }, { "contenido": "0.446" }, { "contenido": "0.398" },
          { "contenido": "0.023" }, { "contenido": "0.018" }, { "contenido": "0.023" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "1.312" }, { "contenido": "1.269" }, { "contenido": "1.516" }, { "contenido": "1.447" },
          { "contenido": "0.776" }, { "contenido": "0.724" }, { "contenido": "0.510" }, { "contenido": "0.458" },
          { "contenido": "0.025" }, { "contenido": "0.020" }, { "contenido": "0.025" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "1.500" }, { "contenido": "1.450" }, { "contenido": "1.732" }, { "contenido": "1.653" },
          { "contenido": "0.887" }, { "contenido": "0.831" }, { "contenido": "0.575" }, { "contenido": "0.519" },
          { "contenido": "0.027" }, { "contenido": "0.022" }, { "contenido": "0.027" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8</strong>" }, { "contenido": "1.1250" }] },
          { "contenido": "1.688" }, { "contenido": "1.631" }, { "contenido": "1.949" }, { "contenido": "1.859" },
          { "contenido": "0.999" }, { "contenido": "0.939" }, { "contenido": "0.639" }, { "contenido": "0.579" },
          { "contenido": "0.030" }, { "contenido": "0.025" }, { "contenido": "0.030" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/4</strong>" }, { "contenido": "1.2500" }] },
          { "contenido": "1.875" }, { "contenido": "1.812" }, { "contenido": "2.165" }, { "contenido": "2.066" },
          { "contenido": "1.094" }, { "contenido": "1.030" }, { "contenido": "0.751" }, { "contenido": "0.687" },
          { "contenido": "0.033" }, { "contenido": "0.028" }, { "contenido": "0.033" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/8</strong>" }, { "contenido": "1.3750" }] },
          { "contenido": "2.062" }, { "contenido": "1.994" }, { "contenido": "2.382" }, { "contenido": "2.273" },
          { "contenido": "1.206" }, { "contenido": "1.138" }, { "contenido": "0.815" }, { "contenido": "0.747" },
          { "contenido": "0.036" }, { "contenido": "0.031" }, { "contenido": "0.036" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/2</strong>" }, { "contenido": "1.5000" }] },
          { "contenido": "2.250" }, { "contenido": "2.175" }, { "contenido": "2.598" }, { "contenido": "2.480" },
          { "contenido": "1.317" }, { "contenido": "1.245" }, { "contenido": "0.880" }, { "contenido": "0.808" },
          { "contenido": "0.039" }, { "contenido": "0.034" }, { "contenido": "0.039" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-5/8</strong>" }, { "contenido": "1.6250" }] },
          { "contenido": "2.43" }, { "contenido": "2.35" }, { "contenido": "2.805" }, { "contenido": "2.679" },
          { "contenido": "1.416" }, { "contenido": "1.364" }, { "contenido": "0.944" }, { "contenido": "0.868" },
          { "contenido": "0.044" }, { "contenido": "0.034" }, { "contenido": "0.044" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/4</strong>" }, { "contenido": "1.7500" }] },
          { "contenido": "2.625" }, { "contenido": "2.538" }, { "contenido": "3.031" }, { "contenido": "2.893" },
          { "contenido": "1.540" }, { "contenido": "1.460" }, { "contenido": "1.009" }, { "contenido": "0.929" },
          { "contenido": "0.048" }, { "contenido": "0.041" }, { "contenido": "0.048" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-7/8</strong>" }, { "contenido": "1.8750" }] },
          { "contenido": "2.813" }, { "contenido": "2.722" }, { "contenido": "3.247" }, { "contenido": "3.103" },
          { "contenido": "1.651" }, { "contenido": "1.567" }, { "contenido": "1.073" }, { "contenido": "0.989" },
          { "contenido": "0.051" }, { "contenido": "0.044" }, { "contenido": "0.051" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2</strong>" }, { "contenido": "2.0000" }] },
          { "contenido": "3.000" }, { "contenido": "2.900" }, { "contenido": "3.464" }, { "contenido": "3.306" },
          { "contenido": "1.763" }, { "contenido": "1.675" }, { "contenido": "1.138" }, { "contenido": "1.050" },
          { "contenido": "0.055" }, { "contenido": "0.047" }, { "contenido": "0.055" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-1/4</strong>" }, { "contenido": "2.2500" }] },
          { "contenido": "3.375" }, { "contenido": "3.263" }, { "contenido": "3.897" }, { "contenido": "3.719" },
          { "contenido": "1.986" }, { "contenido": "1.890" }, { "contenido": "1.267" }, { "contenido": "1.155" },
          { "contenido": "0.061" }, { "contenido": "0.052" }, { "contenido": "0.061" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-1/2</strong>" }, { "contenido": "2.5000" }] },
          { "contenido": "3.750" }, { "contenido": "3.625" }, { "contenido": "4.330" }, { "contenido": "4.133" },
          { "contenido": "2.209" }, { "contenido": "2.105" }, { "contenido": "1.427" }, { "contenido": "1.401" },
          { "contenido": "0.068" }, { "contenido": "0.058" }, { "contenido": "0.068" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-3/4</strong>" }, { "contenido": "2.7500" }] },
          { "contenido": "4.125" }, { "contenido": "3.988" }, { "contenido": "4.763" }, { "contenido": "4.546" },
          { "contenido": "2.431" }, { "contenido": "2.319" }, { "contenido": "1.556" }, { "contenido": "1.522" },
          { "contenido": "0.074" }, { "contenido": "0.064" }, { "contenido": "0.074" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3</strong>" }, { "contenido": "3.0000" }] },
          { "contenido": "4.500" }, { "contenido": "4.350" }, { "contenido": "5.196" }, { "contenido": "4.959" },
          { "contenido": "2.654" }, { "contenido": "2.534" }, { "contenido": "1.685" }, { "contenido": "1.643" },
          { "contenido": "0.081" }, { "contenido": "0.070" }, { "contenido": "0.081" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3-1/4</strong>" }, { "contenido": "3.2500" }] },
          { "contenido": "4.875" }, { "contenido": "4.713" }, { "contenido": "5.629" }, { "contenido": "5.373" },
          { "contenido": "2.877" }, { "contenido": "2.749" }, { "contenido": "1.814" }, { "contenido": "1.748" },
          { "contenido": "0.087" }, { "contenido": "0.075" }, { "contenido": "0.087" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3-1/2</strong>" }, { "contenido": "3.5000" }] },
          { "contenido": "5.250" }, { "contenido": "5.075" }, { "contenido": "6.062" }, { "contenido": "5.786" },
          { "contenido": "3.100" }, { "contenido": "2.964" }, { "contenido": "1.943" }, { "contenido": "1.870" },
          { "contenido": "0.094" }, { "contenido": "0.081" }, { "contenido": "0.094" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3-3/4</strong>" }, { "contenido": "3.7500" }] },
          { "contenido": "5.625" }, { "contenido": "5.438" }, { "contenido": "6.495" }, { "contenido": "6.199" },
          { "contenido": "3.322" }, { "contenido": "3.178" }, { "contenido": "2.072" }, { "contenido": "1.990" },
          { "contenido": "0.100" }, { "contenido": "0.087" }, { "contenido": "0.100" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>4</strong>" }, { "contenido": "4.0000" }] },
          { "contenido": "6.000" }, { "contenido": "5.800" }, { "contenido": "6.928" }, { "contenido": "6.612" },
          { "contenido": "3.545" }, { "contenido": "3.393" }, { "contenido": "2.201" }, { "contenido": "2.112" },
          { "contenido": "0.107" }, { "contenido": "0.093" }, { "contenido": "0.107" }
        ]
      }
    ]
  },

  "tuercaCuadradaHeavy": {
    "titulo": "Tuerca Cuadrada Reforzada (Heavy)",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "tuerca-cuadrada.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Tamaño Nominal o Diámetro Mayor Básico de la Rosca" }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "F" },
              { "contenido": "Ancho Entre Caras" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "G" },
              { "contenido": "Ancho Entre Vértices" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "H" },
              { "contenido": "Espesor" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "Descentramiento" },
              { "contenido": "Superficie de Apoyo al Eje de la Rosca (FIM)<br><small>Máx</small>" }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/4</strong>" }, { "contenido": "0.2500" }] },
          { "contenido": "1/2" }, { "contenido": "0.500" }, { "contenido": "0.488" },
          { "contenido": "0.707" }, { "contenido": "0.640" },
          { "contenido": "1/4" }, { "contenido": "0.266" }, { "contenido": "0.218" },
          { "contenido": "0.026" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/16</strong>" }, { "contenido": "0.3125" }] },
          { "contenido": "9/16" }, { "contenido": "0.562" }, { "contenido": "0.546" },
          { "contenido": "0.795" }, { "contenido": "0.720" },
          { "contenido": "5/16" }, { "contenido": "0.330" }, { "contenido": "0.280" },
          { "contenido": "0.030" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/8</strong>" }, { "contenido": "0.3750" }] },
          { "contenido": "11/16" }, { "contenido": "0.688" }, { "contenido": "0.669" },
          { "contenido": "0.973" }, { "contenido": "0.889" },
          { "contenido": "3/8" }, { "contenido": "0.393" }, { "contenido": "0.341" },
          { "contenido": "0.036" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/16</strong>" }, { "contenido": "0.4375" }] },
          { "contenido": "3/4" }, { "contenido": "0.750" }, { "contenido": "0.728" },
          { "contenido": "1.060" }, { "contenido": "0.970" },
          { "contenido": "7/16" }, { "contenido": "0.456" }, { "contenido": "0.403" },
          { "contenido": "0.039" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "7/8" }, { "contenido": "0.875" }, { "contenido": "0.850" },
          { "contenido": "1.237" }, { "contenido": "1.137" },
          { "contenido": "1/2" }, { "contenido": "0.520" }, { "contenido": "0.464" },
          { "contenido": "0.046" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "1-1/16" }, { "contenido": "1.062" }, { "contenido": "1.031" },
          { "contenido": "1.503" }, { "contenido": "1.386" },
          { "contenido": "5/8" }, { "contenido": "0.647" }, { "contenido": "0.587" },
          { "contenido": "0.056" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "1-1/4" }, { "contenido": "1.250" }, { "contenido": "1.212" },
          { "contenido": "1.768" }, { "contenido": "1.635" },
          { "contenido": "3/4" }, { "contenido": "0.774" }, { "contenido": "0.710" },
          { "contenido": "0.065" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "1-7/16" }, { "contenido": "1.438" }, { "contenido": "1.394" },
          { "contenido": "2.033" }, { "contenido": "1.884" },
          { "contenido": "7/8" }, { "contenido": "0.901" }, { "contenido": "0.833" },
          { "contenido": "0.075" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "1-5/8" }, { "contenido": "1.625" }, { "contenido": "1.575" },
          { "contenido": "2.298" }, { "contenido": "2.132" },
          { "contenido": "1" }, { "contenido": "1.028" }, { "contenido": "0.956" },
          { "contenido": "0.082" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8</strong>" }, { "contenido": "1.1250" }] },
          { "contenido": "1-13/16" }, { "contenido": "1.812" }, { "contenido": "1.756" },
          { "contenido": "2.563" }, { "contenido": "2.381" },
          { "contenido": "1-1/8" }, { "contenido": "1.155" }, { "contenido": "1.079" },
          { "contenido": "0.063" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/4</strong>" }, { "contenido": "1.2500" }] },
          { "contenido": "2" }, { "contenido": "2.000" }, { "contenido": "1.938" },
          { "contenido": "2.828" }, { "contenido": "2.631" },
          { "contenido": "1-1/4" }, { "contenido": "1.282" }, { "contenido": "1.187" },
          { "contenido": "0.070" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/8</strong>" }, { "contenido": "1.3750" }] },
          { "contenido": "2-3/16" }, { "contenido": "2.188" }, { "contenido": "2.119" },
          { "contenido": "3.094" }, { "contenido": "2.879" },
          { "contenido": "1-3/8" }, { "contenido": "1.409" }, { "contenido": "1.310" },
          { "contenido": "0.076" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/2</strong>" }, { "contenido": "1.5000" }] },
          { "contenido": "2-3/8" }, { "contenido": "2.375" }, { "contenido": "2.300" },
          { "contenido": "3.359" }, { "contenido": "3.128" },
          { "contenido": "1-1/2" }, { "contenido": "1.536" }, { "contenido": "1.433" },
          { "contenido": "0.082" }
        ]
      }
    ]
  },

  "tuercaHexagonalHeavy": {
    "titulo": "Tuerca Hexagonal Reoforzada (Heavy)",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "tuerca-hexagonal.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Tamaño Nominal o Diámetro Mayor Básico de la Rosca" }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "F" },
              { "contenido": "Ancho Entre Caras" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "G" },
              { "contenido": "Ancho Entre Vértices" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "H" },
              { "contenido": "Espesor de Tuerca Hexagonal Pesada" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "H<sub>1</sub>" },
              { "contenido": "Espesor de Tuerca Hexagonal Pesada de Seguridad" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Básico" },
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 3,
            "direction": "row",
            "contenido": [
              { "contenido": "Descentramiento de la Superficie de Apoyo al Eje de la Rosca (FIM)" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Tuerca Pesada - Carga de Prueba Hasta 150,000 psi (Máx)" },
                  { "contenido": "Tuerca Pesada - Carga de Prueba Mayor a 150,000 psi (Máx)" },
                  { "contenido": "Tuerca Pesada de Seguridad - Todos los Niveles de Resistencia (Máx)" }
                ]
              }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/4</strong>" }, { "contenido": "0.2500" }] },
          { "contenido": "1/2" }, { "contenido": "0.500" }, { "contenido": "0.488" }, { "contenido": "0.577" }, { "contenido": "0.556" },
          { "contenido": "15/64" }, { "contenido": "0.250" }, { "contenido": "0.218" }, { "contenido": "11/64" }, { "contenido": "0.188" }, { "contenido": "0.156" },
          { "contenido": "0.017" }, { "contenido": "0.011" }, { "contenido": "0.017" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/16</strong>" }, { "contenido": "0.3125" }] },
          { "contenido": "9/16" }, { "contenido": "0.562" }, { "contenido": "0.546" }, { "contenido": "0.650" }, { "contenido": "0.622" },
          { "contenido": "19/64" }, { "contenido": "0.314" }, { "contenido": "0.280" }, { "contenido": "13/64" }, { "contenido": "0.220" }, { "contenido": "0.186" },
          { "contenido": "0.020" }, { "contenido": "0.012" }, { "contenido": "0.020" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/8</strong>" }, { "contenido": "0.3750" }] },
          { "contenido": "11/16" }, { "contenido": "0.688" }, { "contenido": "0.669" }, { "contenido": "0.794" }, { "contenido": "0.763" },
          { "contenido": "23/64" }, { "contenido": "0.377" }, { "contenido": "0.341" }, { "contenido": "15/64" }, { "contenido": "0.252" }, { "contenido": "0.216" },
          { "contenido": "0.021" }, { "contenido": "0.014" }, { "contenido": "0.021" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/16</strong>" }, { "contenido": "0.4375" }] },
          { "contenido": "3/4" }, { "contenido": "0.750" }, { "contenido": "0.728" }, { "contenido": "0.866" }, { "contenido": "0.830" },
          { "contenido": "27/64" }, { "contenido": "0.441" }, { "contenido": "0.403" }, { "contenido": "17/64" }, { "contenido": "0.285" }, { "contenido": "0.247" },
          { "contenido": "0.022" }, { "contenido": "0.015" }, { "contenido": "0.022" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "7/8" }, { "contenido": "0.875" }, { "contenido": "0.850" }, { "contenido": "1.010" }, { "contenido": "0.969" },
          { "contenido": "31/64" }, { "contenido": "0.504" }, { "contenido": "0.464" }, { "contenido": "19/64" }, { "contenido": "0.317" }, { "contenido": "0.277" },
          { "contenido": "0.023" }, { "contenido": "0.016" }, { "contenido": "0.023" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>9/16</strong>" }, { "contenido": "0.5625" }] },
          { "contenido": "15/16" }, { "contenido": "0.938" }, { "contenido": "0.909" }, { "contenido": "1.083" }, { "contenido": "1.037" },
          { "contenido": "35/64" }, { "contenido": "0.568" }, { "contenido": "0.526" }, { "contenido": "21/64" }, { "contenido": "0.349" }, { "contenido": "0.307" },
          { "contenido": "0.024" }, { "contenido": "0.017" }, { "contenido": "0.024" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "1-1/16" }, { "contenido": "1.062" }, { "contenido": "1.031" }, { "contenido": "1.227" }, { "contenido": "1.175" },
          { "contenido": "39/64" }, { "contenido": "0.631" }, { "contenido": "0.587" }, { "contenido": "23/64" }, { "contenido": "0.381" }, { "contenido": "0.337" },
          { "contenido": "0.025" }, { "contenido": "0.018" }, { "contenido": "0.025" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "1-1/4" }, { "contenido": "1.250" }, { "contenido": "1.212" }, { "contenido": "1.443" }, { "contenido": "1.382" },
          { "contenido": "47/64" }, { "contenido": "0.758" }, { "contenido": "0.710" }, { "contenido": "27/64" }, { "contenido": "0.446" }, { "contenido": "0.398" },
          { "contenido": "0.027" }, { "contenido": "0.020" }, { "contenido": "0.027" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "1-7/16" }, { "contenido": "1.438" }, { "contenido": "1.394" }, { "contenido": "1.660" }, { "contenido": "1.589" },
          { "contenido": "55/64" }, { "contenido": "0.885" }, { "contenido": "0.833" }, { "contenido": "31/64" }, { "contenido": "0.510" }, { "contenido": "0.458" },
          { "contenido": "0.029" }, { "contenido": "0.022" }, { "contenido": "0.029" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "1-5/8" }, { "contenido": "1.625" }, { "contenido": "1.575" }, { "contenido": "1.876" }, { "contenido": "1.796" },
          { "contenido": "63/64" }, { "contenido": "1.012" }, { "contenido": "0.956" }, { "contenido": "35/64" }, { "contenido": "0.575" }, { "contenido": "0.519" },
          { "contenido": "0.031" }, { "contenido": "0.024" }, { "contenido": "0.031" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8</strong>" }, { "contenido": "1.1250" }] },
          { "contenido": "1-13/16" }, { "contenido": "1.812" }, { "contenido": "1.756" }, { "contenido": "2.093" }, { "contenido": "2.002" },
          { "contenido": "1-7/64" }, { "contenido": "1.139" }, { "contenido": "1.079" }, { "contenido": "39/64" }, { "contenido": "0.639" }, { "contenido": "0.579" },
          { "contenido": "0.033" }, { "contenido": "0.027" }, { "contenido": "0.033" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/4</strong>" }, { "contenido": "1.2500" }] },
          { "contenido": "2" }, { "contenido": "2.000" }, { "contenido": "1.938" }, { "contenido": "2.309" }, { "contenido": "2.209" },
          { "contenido": "1-7/32" }, { "contenido": "1.251" }, { "contenido": "1.187" }, { "contenido": "23/32" }, { "contenido": "0.751" }, { "contenido": "0.687" },
          { "contenido": "0.035" }, { "contenido": "0.030" }, { "contenido": "0.035" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/8</strong>" }, { "contenido": "1.3750" }] },
          { "contenido": "2-3/16" }, { "contenido": "2.188" }, { "contenido": "2.119" }, { "contenido": "2.526" }, { "contenido": "2.416" },
          { "contenido": "1-11/32" }, { "contenido": "1.378" }, { "contenido": "1.310" }, { "contenido": "25/32" }, { "contenido": "0.815" }, { "contenido": "0.747" },
          { "contenido": "0.038" }, { "contenido": "0.033" }, { "contenido": "0.038" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/2</strong>" }, { "contenido": "1.5000" }] },
          { "contenido": "2-3/8" }, { "contenido": "2.375" }, { "contenido": "2.300" }, { "contenido": "2.742" }, { "contenido": "2.622" },
          { "contenido": "1-15/32" }, { "contenido": "1.505" }, { "contenido": "1.433" }, { "contenido": "27/32" }, { "contenido": "0.880" }, { "contenido": "0.808" },
          { "contenido": "0.041" }, { "contenido": "0.036" }, { "contenido": "0.041" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-5/8</strong>" }, { "contenido": "1.6250" }] },
          { "contenido": "2-9/16" }, { "contenido": "2.562" }, { "contenido": "2.481" }, { "contenido": "2.959" }, { "contenido": "2.828" },
          { "contenido": "1-19/32" }, { "contenido": "1.632" }, { "contenido": "1.556" }, { "contenido": "29/32" }, { "contenido": "0.944" }, { "contenido": "0.868" },
          { "contenido": "0.044" }, { "contenido": "0.038" }, { "contenido": "0.044" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/4</strong>" }, { "contenido": "1.7500" }] },
          { "contenido": "2-3/4" }, { "contenido": "2.750" }, { "contenido": "2.662" }, { "contenido": "3.175" }, { "contenido": "3.035" },
          { "contenido": "1-23/32" }, { "contenido": "1.759" }, { "contenido": "1.679" }, { "contenido": "31/32" }, { "contenido": "1.009" }, { "contenido": "0.929" },
          { "contenido": "0.048" }, { "contenido": "0.041" }, { "contenido": "0.048" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-7/8</strong>" }, { "contenido": "1.8750" }] },
          { "contenido": "2-15/16" }, { "contenido": "2.938" }, { "contenido": "2.844" }, { "contenido": "3.392" }, { "contenido": "3.242" },
          { "contenido": "1-27/32" }, { "contenido": "1.886" }, { "contenido": "1.802" }, { "contenido": "1-1/32" }, { "contenido": "1.073" }, { "contenido": "0.989" },
          { "contenido": "0.051" }, { "contenido": "0.044" }, { "contenido": "0.051" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2</strong>" }, { "contenido": "2.0000" }] },
          { "contenido": "3-1/8" }, { "contenido": "3.125" }, { "contenido": "3.025" }, { "contenido": "3.608" }, { "contenido": "3.449" },
          { "contenido": "1-31/32" }, { "contenido": "2.013" }, { "contenido": "1.925" }, { "contenido": "1-3/32" }, { "contenido": "1.138" }, { "contenido": "1.050" },
          { "contenido": "0.055" }, { "contenido": "0.047" }, { "contenido": "0.055" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-1/4</strong>" }, { "contenido": "2.2500" }] },
          { "contenido": "3-1/2" }, { "contenido": "3.500" }, { "contenido": "3.388" }, { "contenido": "4.041" }, { "contenido": "3.862" },
          { "contenido": "2-13/64" }, { "contenido": "2.251" }, { "contenido": "2.155" }, { "contenido": "1-13/64" }, { "contenido": "1.251" }, { "contenido": "1.155" },
          { "contenido": "0.061" }, { "contenido": "0.052" }, { "contenido": "0.061" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-1/2</strong>" }, { "contenido": "2.5000" }] },
          { "contenido": "3-7/8" }, { "contenido": "3.750" }, { "contenido": "3.750" }, { "contenido": "4.474" }, { "contenido": "4.275" },
          { "contenido": "2-29/64" }, { "contenido": "2.505" }, { "contenido": "2.401" }, { "contenido": "1-29/64" }, { "contenido": "1.505" }, { "contenido": "1.401" },
          { "contenido": "0.068" }, { "contenido": "0.058" }, { "contenido": "0.068" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-3/4</strong>" }, { "contenido": "2.7500" }] },
          { "contenido": "4-1/4" }, { "contenido": "4.250" }, { "contenido": "4.112" }, { "contenido": "4.907" }, { "contenido": "4.688" },
          { "contenido": "2-45/64" }, { "contenido": "2.759" }, { "contenido": "2.647" }, { "contenido": "1-37/64" }, { "contenido": "1.634" }, { "contenido": "1.522" },
          { "contenido": "0.074" }, { "contenido": "0.064" }, { "contenido": "0.074" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3</strong>" }, { "contenido": "3.0000" }] },
          { "contenido": "4-5/8" }, { "contenido": "4.625" }, { "contenido": "4.475" }, { "contenido": "5.340" }, { "contenido": "5.102" },
          { "contenido": "2-61/64" }, { "contenido": "3.013" }, { "contenido": "2.893" }, { "contenido": "1-45/64" }, { "contenido": "1.763" }, { "contenido": "1.643" },
          { "contenido": "0.081" }, { "contenido": "0.070" }, { "contenido": "0.081" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3-1/4</strong>" }, { "contenido": "3.2500" }] },
          { "contenido": "5" }, { "contenido": "5.000" }, { "contenido": "4.838" }, { "contenido": "5.774" }, { "contenido": "5.515" },
          { "contenido": "3-3/16" }, { "contenido": "3.252" }, { "contenido": "3.124" }, { "contenido": "1-13/16" }, { "contenido": "1.876" }, { "contenido": "1.748" },
          { "contenido": "0.087" }, { "contenido": "0.075" }, { "contenido": "0.087" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3-1/2</strong>" }, { "contenido": "3.5000" }] },
          { "contenido": "5-3/8" }, { "contenido": "5.375" }, { "contenido": "5.200" }, { "contenido": "6.207" }, { "contenido": "5.928" },
          { "contenido": "3-7/16" }, { "contenido": "3.506" }, { "contenido": "3.370" }, { "contenido": "1-15/16" }, { "contenido": "2.006" }, { "contenido": "1.870" },
          { "contenido": "0.094" }, { "contenido": "0.081" }, { "contenido": "0.094" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3-3/4</strong>" }, { "contenido": "3.7500" }] },
          { "contenido": "5-3/4" }, { "contenido": "5.750" }, { "contenido": "5.562" }, { "contenido": "6.640" }, { "contenido": "6.341" },
          { "contenido": "3-11/16" }, { "contenido": "3.760" }, { "contenido": "3.616" }, { "contenido": "2-1/16" }, { "contenido": "2.134" }, { "contenido": "1.990" },
          { "contenido": "0.100" }, { "contenido": "0.087" }, { "contenido": "0.100" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>4</strong>" }, { "contenido": "4.0000" }] },
          { "contenido": "6-1/8" }, { "contenido": "6.125" }, { "contenido": "5.925" }, { "contenido": "7.073" }, { "contenido": "6.755" },
          { "contenido": "3-15/16" }, { "contenido": "4.014" }, { "contenido": "3.862" }, { "contenido": "2-3/16" }, { "contenido": "2.264" }, { "contenido": "2.112" },
          { "contenido": "0.107" }, { "contenido": "0.093" }, { "contenido": "0.107" }
        ]
      }
    ]
  },

  "tuercaSeguroNylon": {
    "titulo": "Tuerca de Seguridad con Inserto de Nylon",
    "fixedHeader": true,
    "fixedFirstColumn": true,
    "fixedIntersection": true,
    "image": "tuerca-seguro-nylon.png",
    "filas": [
      {
        "columnas": [
          {
            "colspan": 1,
            "direction": "column",
            "contenido": [
              { "contenido": "Denominación (Tamaño y Diámetro Nominal)" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "A" },
              { "contenido": "Ancho Entre Caras" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "B" },
              { "contenido": "Ancho Entre Vértices<br><small>Mín</small>" }
            ]
          },
          {
            "colspan": 2,
            "direction": "row",
            "contenido": [
              { "contenido": "C" },
              { "contenido": "Espesor Total" },
              {
                "direction": "column",
                "contenido": [
                  { "contenido": "Máx" },
                  { "contenido": "Mín" }
                ]
              }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "D" },
              { "contenido": "Altura del Hexágono<br><small>Mín</small>" }
            ]
          },
          {
            "colspan": 1,
            "direction": "row",
            "contenido": [
              { "contenido": "Descentramiento" },
              { "contenido": "Superficie de Apoyo al Diámetro de Paso de la Rosca (FIM)<br><small>Máx</small>" }
            ]
          }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/4</strong>" }, { "contenido": "0.2500" }] },
          { "contenido": "0.506" }, { "contenido": "0.489" }, { "contenido": "0.556" },
          { "contenido": "0.390" }, { "contenido": "0.360" }, { "contenido": "0.290" }, { "contenido": "0.010" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/16</strong>" }, { "contenido": "0.3125" }] },
          { "contenido": "0.566" }, { "contenido": "0.551" }, { "contenido": "0.624" },
          { "contenido": "0.453" }, { "contenido": "0.423" }, { "contenido": "0.335" }, { "contenido": "0.011" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/8</strong>" }, { "contenido": "0.3750" }] },
          { "contenido": "0.691" }, { "contenido": "0.675" }, { "contenido": "0.763" },
          { "contenido": "0.562" }, { "contenido": "0.532" }, { "contenido": "0.392" }, { "contenido": "0.012" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/16</strong>" }, { "contenido": "0.4375" }] },
          { "contenido": "0.754" }, { "contenido": "0.736" }, { "contenido": "0.829" },
          { "contenido": "0.609" }, { "contenido": "0.579" }, { "contenido": "0.464" }, { "contenido": "0.013" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1/2</strong>" }, { "contenido": "0.5000" }] },
          { "contenido": "0.879" }, { "contenido": "0.861" }, { "contenido": "0.969" },
          { "contenido": "0.718" }, { "contenido": "0.688" }, { "contenido": "0.544" }, { "contenido": "0.014" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>9/16</strong>" }, { "contenido": "0.5625" }] },
          { "contenido": "0.942" }, { "contenido": "0.922" }, { "contenido": "1.037" },
          { "contenido": "0.812" }, { "contenido": "0.782" }, { "contenido": "0.655" }, { "contenido": "0.015" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>5/8</strong>" }, { "contenido": "0.6250" }] },
          { "contenido": "1.067" }, { "contenido": "1.045" }, { "contenido": "1.175" },
          { "contenido": "0.874" }, { "contenido": "0.844" }, { "contenido": "0.677" }, { "contenido": "0.016" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3/4</strong>" }, { "contenido": "0.7500" }] },
          { "contenido": "1.255" }, { "contenido": "1.231" }, { "contenido": "1.382" },
          { "contenido": "1.015" }, { "contenido": "0.985" }, { "contenido": "0.790" }, { "contenido": "0.018" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>7/8</strong>" }, { "contenido": "0.8750" }] },
          { "contenido": "1.444" }, { "contenido": "1.417" }, { "contenido": "1.589" },
          { "contenido": "1.140" }, { "contenido": "1.110" }, { "contenido": "0.883" }, { "contenido": "0.020" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1</strong>" }, { "contenido": "1.0000" }] },
          { "contenido": "1.632" }, { "contenido": "1.602" }, { "contenido": "1.796" },
          { "contenido": "1.312" }, { "contenido": "1.250" }, { "contenido": "1.000" }, { "contenido": "0.022" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/8</strong>" }, { "contenido": "1.1250" }] },
          { "contenido": "1.820" }, { "contenido": "1.788" }, { "contenido": "2.002" },
          { "contenido": "1.469" }, { "contenido": "1.407" }, { "contenido": "1.096" }, { "contenido": "0.025" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/4</strong>" }, { "contenido": "1.2500" }] },
          { "contenido": "2.008" }, { "contenido": "1.973" }, { "contenido": "2.209" },
          { "contenido": "1.672" }, { "contenido": "1.610" }, { "contenido": "1.250" }, { "contenido": "0.028" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/8</strong>" }, { "contenido": "1.3750" }] },
          { "contenido": "2.197" }, { "contenido": "2.159" }, { "contenido": "2.416" },
          { "contenido": "1.828" }, { "contenido": "1.766" }, { "contenido": "1.376" }, { "contenido": "0.031" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-1/2</strong>" }, { "contenido": "1.5000" }] },
          { "contenido": "2.384" }, { "contenido": "2.344" }, { "contenido": "2.622" },
          { "contenido": "1.953" }, { "contenido": "1.891" }, { "contenido": "1.413" }, { "contenido": "0.034" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-5/8</strong>" }, { "contenido": "1.6250" }] },
          { "contenido": "2.572" }, { "contenido": "2.530" }, { "contenido": "2.886" },
          { "contenido": "2.172" }, { "contenido": "2.110" }, { "contenido": "1.637" }, { "contenido": "0.038" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-3/4</strong>" }, { "contenido": "1.7500" }] },
          { "contenido": "2.762" }, { "contenido": "2.715" }, { "contenido": "3.035" },
          { "contenido": "2.376" }, { "contenido": "2.250" }, { "contenido": "1.830" }, { "contenido": "0.041" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>1-7/8</strong>" }, { "contenido": "1.8750" }] },
          { "contenido": "2.950" }, { "contenido": "2.901" }, { "contenido": "3.242" },
          { "contenido": "2.422" }, { "contenido": "2.296" }, { "contenido": "1.875" }, { "contenido": "0.044" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2</strong>" }, { "contenido": "2.0000" }] },
          { "contenido": "3.137" }, { "contenido": "3.086" }, { "contenido": "3.449" },
          { "contenido": "2.469" }, { "contenido": "2.343" }, { "contenido": "1.750" }, { "contenido": "0.047" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-1/4</strong>" }, { "contenido": "2.2500" }] },
          { "contenido": "3.514" }, { "contenido": "3.457" }, { "contenido": "3.862" },
          { "contenido": "2.876" }, { "contenido": "2.750" }, { "contenido": "2.063" }, { "contenido": "0.052" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-1/2</strong>" }, { "contenido": "2.5000" }] },
          { "contenido": "4.015" }, { "contenido": "3.875" }, { "contenido": "4.618" },
          { "contenido": "3.204" }, { "contenido": "3.078" }, { "contenido": "2.475" }, { "contenido": "0.058" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>2-3/4</strong>" }, { "contenido": "2.7500" }] },
          { "contenido": "4.015" }, { "contenido": "3.875" }, { "contenido": "4.618" },
          { "contenido": "3.204" }, { "contenido": "3.078" }, { "contenido": "2.350" }, { "contenido": "0.064" }
        ]
      },
      {
        "columnas": [
          { "direction": "column", "contenido": [{ "contenido": "<strong>3</strong>" }, { "contenido": "3.0000" }] },
          { "contenido": "4.640" }, { "contenido": "4.500" }, { "contenido": "5.102" },
          { "contenido": "3.704" }, { "contenido": "3.578" }, { "contenido": "2.750" }, { "contenido": "0.070" }
        ]
      }
    ]
  }
}