const plataformas = {
  "Netflix": {
    url: "https://www.netflix.com/",
    logo: "https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg"
  },
  "Amazon Prime Video": {
    url: "https://www.primevideo.com/",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f1/Prime_Video.png"
  },
  "HBO Max": {
    url: "https://www.hbomax.com/",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/17/HBO_Max_Logo.svg"
  },
  "Disney+": {
    url: "https://www.disneyplus.com/",
    logo: "https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg"
  },
  "Paramount+": {
    url: "https://www.paramountplus.com/",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/57/Paramount_Plus_logo.svg"
  },
  "Star+": {
    url: "https://www.starplus.com/",
    logo: "https://upload.wikimedia.org/wikipedia/commons/2/27/Star%2B_logo.svg"
  }
};

let peliculas = [];

fetch('peliculas.json')
  .then(response => response.json())
  .then(data => {
    peliculas = data;
  });

let historialUsuario = {
  generos: {},
  peliculas: {}
};

function guardarHistorial() {
  localStorage.setItem("historialUsuario", JSON.stringify(historialUsuario));
}

function cargarHistorial() {
  const data = localStorage.getItem("historialUsuario");
  if (data) {
    historialUsuario = JSON.parse(data);
  }
}
cargarHistorial();

function registrarInteraccion(pelicula) {
  historialUsuario.generos[pelicula.genero] = (historialUsuario.generos[pelicula.genero] || 0) + 1;
  historialUsuario.peliculas[pelicula.titulo] = (historialUsuario.peliculas[pelicula.titulo] || 0) + 1;
  guardarHistorial();
}

function recomendar() {
  const generoSeleccionado = document.getElementById("genero").value;
  const resultado = document.getElementById("resultado");
  resultado.innerHTML = "";

  const recomendadas = generoSeleccionado === "todos"
    ? peliculas
    : peliculas.filter(p => p.genero === generoSeleccionado);

  recomendadas.forEach(p => {
    const li = document.createElement("li");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = esVista(p.titulo);
    checkbox.title = "Marcar como vista";
    checkbox.style.marginRight = "6px";
    checkbox.onchange = function () {
      toggleVisto(p.titulo);
      recomendar(); 
    };

    const link = document.createElement("a");
    link.textContent = p.titulo;
    link.href = "#";
    link.onclick = function () {
      mostrarModal(p);
    };

    li.appendChild(checkbox);
    li.appendChild(link);
    resultado.appendChild(li);
  });
}

// 🎬 Películas vistas (localStorage)
function esVista(titulo) {
  const vistas = JSON.parse(localStorage.getItem("peliculasVistas") || "[]");
  return vistas.includes(titulo);
}

function toggleVisto(titulo) {
  let vistas = JSON.parse(localStorage.getItem("peliculasVistas") || "[]");
  if (vistas.includes(titulo)) {
    vistas = vistas.filter(t => t !== titulo);
  } else {
    vistas.push(titulo);
  }
  localStorage.setItem("peliculasVistas", JSON.stringify(vistas));
}

function mostrarModal(pelicula) {
  registrarInteraccion(pelicula);

  const modal = document.getElementById("infoModal");
  document.getElementById("modalTitulo").textContent = pelicula.titulo;
  document.getElementById("modalDescripcion").textContent = pelicula.descripcion;

  const plataforma = plataformas[pelicula.plataforma];
  const link = document.getElementById("modalPlataformaEnlace");
  link.textContent = pelicula.plataforma;
  link.href = plataforma ? plataforma.url : "#";

  const logo = document.getElementById("modalLogo");
  logo.src = plataforma ? plataforma.logo : "";
  logo.alt = "Logo de " + pelicula.plataforma;

  
  let boton = document.getElementById("botonVisto");
  if (!boton) {
    boton = document.createElement("button");
    boton.id = "botonVisto";
    boton.className = "boton-visto";
    document.querySelector(".modal-content").appendChild(boton);
  }

  boton.textContent = esVista(pelicula.titulo) ? "Marcar como NO vista" : "Marcar como vista";
  boton.onclick = function () {
    toggleVisto(pelicula.titulo);
    cerrarModal();
    recomendar();
  };

  modal.style.display = "block";
}

function cerrarModal() {
  document.getElementById("infoModal").style.display = "none";
}

window.onclick = function (event) {
  const modal = document.getElementById("infoModal");
  if (event.target == modal) {
    modal.style.display = "none";
  }
}

function recomendarPersonalizada() {
  const generoFavorito = obtenerGeneroFavorito();
  if (!generoFavorito) {
    alert("Aún no hay suficientes datos. ¡Explora algunas películas!");
    return;
  }

  document.getElementById("genero").value = generoFavorito;
  recomendar();
}

function obtenerGeneroFavorito() {
  const generos = historialUsuario.generos;
  let favorito = null;
  let max = 0;

  for (let g in generos) {
    if (generos[g] > max) {
      max = generos[g];
      favorito = g;
    }
  }

  return favorito;
}

// BOTÓN RECOMENDAR / MOSTRAR / OCULTAR
function toggleRecomendaciones() {
  const lista = document.getElementById("resultado");
  const btn = document.getElementById("toggleRecomendacionesBtn");
  const generoSeleccionado = document.getElementById("genero").value;

  if (btn.dataset.estado === "inicio") {
    if (!generoSeleccionado) {
      alert("Por favor, selecciona un género primero.");
      return;
    }

    recomendar();
    lista.style.display = "block";
    btn.textContent = "Ocultar recomendaciones";
    btn.dataset.estado = "mostrando";
  } else if (btn.dataset.estado === "mostrando") {
    lista.style.display = "none";
    btn.textContent = "Mostrar recomendaciones";
    btn.dataset.estado = "oculto";
  } else if (btn.dataset.estado === "oculto") {
    lista.style.display = "block";
    btn.textContent = "Ocultar recomendaciones";
    btn.dataset.estado = "mostrando";
  }
}
