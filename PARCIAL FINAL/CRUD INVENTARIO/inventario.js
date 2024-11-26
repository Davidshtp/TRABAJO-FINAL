//obtenemos los elementos del DOM por medio de id(getElementById) y clases(queryselector)
const iconoAgregar = document.getElementById('iconoAgregar');
const modalArticulo = document.getElementById('modalArticulo');
const cerrarModal = document.getElementById('cerrarModal');
const modalTitulo = document.getElementById('modalTitulo');
const formArticulo = document.getElementById('formArticulo');
const modalBoton = document.getElementById('modalBoton');
const iconsalir= document.querySelector(".iconsalir");

let modo =""//asignamos el modo del modal para sabe si se va a editar o crear un nuevo elemento
let idArticulo = null; //el id del articulo en dado caso de que se quiera editar un elemento

// Función para obtener los productos desde el backend
function obtenerProductos() {
    //realizamos la solicitud al backend u servidor
    fetch('http://localhost:3000/articulos', {//especificamos la ruta del servicio
        method: 'GET', //especificamos el metodo para la consulta
        headers: {
            'Content-Type': 'application/json',
        }
    }) 
        .then(response => response.json())   // Convertimos la respuesta a JSON
        .then(productos => {
            //seleccionamos el contenedor donde van a ir los productos
            const pizarra = document.querySelector('.pizarra');
            // Eliminar solo los elementos con clase 'caja'
            const cajas = pizarra.querySelectorAll('.caja');
            cajas.forEach(caja => caja.remove());

            // Recorremos los productos para mostrarlos en la pagina
            productos.forEach((producto) => {
                const productoDiv = document.createElement('div');
                productoDiv.classList.add('caja');

                
                // Estructura del producto
                productoDiv.innerHTML = `
                    <h2>${producto.producto}</h2>
                    <div class="info">
                        <p>Stock: ${producto.stock}</p>
                        <p>Precio: $${producto.precio}</p>
                    </div>
                    <div class="contenedoriconos">
                        <img src="../assets/images/borrar.png" alt="icono de eliminar" class="icono icono-eliminar">
                        <img src="../assets/images/editar.png" alt="icono de editar" class="icono icono-editar">
                    </div>
                `;
                // Asocia el evento de editar al ícono de edición
                const editarIcono = productoDiv.querySelector('.icono-editar');
                editarIcono.addEventListener('click', () => mostrarEditarArticulo(producto));
                // Asocia el evento de eliminar al ícono de eliminar 
                const eliminarIcono = productoDiv.querySelector('.icono-eliminar');
                eliminarIcono.addEventListener('click', () => eliminarArticulo(producto.id));

                // Agregar el nuevo producto a la pizarra
                pizarra.appendChild(productoDiv);
            });
        })
        .catch(error => {
            console.error('Error al obtener los productos:', error);//dado caso de obtener error en obtener productos se muestra el siguiente error por consola
        });
}

//funcion para agregar articulos
function agregarArticulo(producto, stock, precio) {
    // Realizamos la solicitud al backend
    fetch('http://localhost:3000/articulos', {//especificamos la ruta del servicio
        method: 'POST',//especificamos el metodo a usarsar en la consulta
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({//por medio de un json enviamos la informacion de los campos del formulario de crear un elemento al servidor
            producto,
            stock,
            precio
        })
    })
    .then(response => {
        if (response.ok) {
            return response.json(); // Convertimos la respuesta a JSON 
        } else {
            return response.json().then(errorData => {
                // Manejar errores del servidor
                throw new Error(errorData.message);
            });
        }
    })
    .then(data => {//en dado caso de exito se muestra una alerta de swetalert
        Swal.fire({
            position: "center",
            icon: "success",
            title: "Articulo agregado correctamente",
            showConfirmButton: false,
            timer: 1500
          });
        obtenerProductos(); // Actualizamos la lista de productos en la pizarra
        modalArticulo.style.display = 'none'; // Oculta el modal
    })
    .catch(error => {
        console.error("Error al agregar el artículo:", error); //si sucede algun error en el servidor se indica con una alerta
        alert(`Error: ${error.message || "Error al conectar con el servidor."}`);
    });
}

// Mostrar modal para agregar artículo
iconoAgregar.addEventListener('click', () => {//al icono de agregar se le asigna el modo de agregar para poder crear y asi mismo el evento de click para que cuando se de clic se muestre el modal de agregar y automanticamente se ponga en modo crear
    modo = 'agregar'; // Establece el modo
    idArticulo = null; // No hay ID en modo agregar
    modalTitulo.textContent = 'Agregar Artículo'; // Cambia el título
    modalBoton.textContent = 'Agregar'; // Cambia el texto del botón
    formArticulo.reset(); // Limpia los campos
    modalArticulo.style.display = 'flex'; // Muestra el modal
});
//Mostrar modal para editar articulos
function mostrarEditarArticulo(articulo) {
    modo = 'editar';//establecemos el modo en editar
    idArticulo = articulo.id;//obtenemos el id por medio de la prop de la funcion
    //modificamos algunso titulos y textos del formulario de editar
    modalTitulo.textContent = 'Editar Artículo';
    modalBoton.textContent = 'Guardar Cambios';

    // Asegurarse de que los campos existen antes de usarlos
    const productoInput = document.getElementById('producto');
    const stockInput = document.getElementById('stock');
    const precioInput = document.getElementById('precio');

    if (productoInput && stockInput && precioInput) {
        productoInput.value = articulo.producto || '';
        stockInput.value = articulo.stock || '';
        precioInput.value = articulo.precio || '';
    } else {
        console.error("Campos no encontrados en el DOM.");
    }

    modalArticulo.style.display = 'flex';//mostramos el modal de editar
}

// Manejo del formulario del modal
formArticulo.addEventListener('submit', (event) => {//asignamos a el formulario el evento de submit
    event.preventDefault(); // Prevenir el envío por defecto
    //obtenemos los campos del formulario
    const producto = document.getElementById('producto').value;
    const stock = document.getElementById('stock').value;
    const precio = document.getElementById('precio').value;
    //si el modo es agregar se proceden a hacer las consultar para agregar 
    if (modo === 'agregar') {
        agregarArticulo(producto,stock,precio)//se ejecuta la funcion de agregar articulo
    } else if (modo === 'editar') {//si el modo es editar se procede a realizar las consultar para poder editar
        Swal.fire({//alerta para poder reconfirmar si queremos editar o no
            title: "Estas seguro de editar?",
            text: "Cambiaras el contenido del articulo!!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si,Editar"
          }).then((result) => {
            if (result.isConfirmed) {//si el resultado es confirmado se procede a hacer la consulta de edicion en la base de datos
                 // Llamar a la función para editar
                fetch(`http://localhost:3000/articulos/${idArticulo}`, {//se realiza el fetch pasando la id del articulo a eliminar por medio de los parametros de la url
                    method: 'PUT',//asignamos el metodo para poder editar
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ producto, stock, precio })//enviamos la informacion de los campos por medio de un json
                })
                .then(response => response.json())
                .then(data => {//en dado caso de que ya se halla realizado la edicion correctamente se actualizan los productos y se cierra el modal
                    obtenerProductos(); // Actualiza la lista de productos
                    modalArticulo.style.display = 'none'; // Cierra el modal
                })
                .catch(error => console.error('Error:', error));
              Swal.fire({ //alerta de articulo editado correctamente
                title: "Editado",
                text: "Articulo editado correctamente!!",
                icon: "success"
              });
            }
            modalArticulo.style.display="none";//se cierra el modal
          });
       
    }
});

// Función para eliminar un artículo
function eliminarArticulo(id) {
    Swal.fire({//se realiza una alerta para poder reconfirmar si queremos eliminar o no el elemento
        title: "¿Quieres eliminar el articulo?",
        text: "se eliminara para siempre!!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Si,Eliminar"
      }).then((result) => {//en dado caso de que sea confirmado se realiza el fetch con la url y la id pasada en los paramentros de la url
        if (result.isConfirmed) {
            fetch(`http://localhost:3000/articulos/${id}`, {
                method: 'DELETE',//asignamos el metodo correspondiente para eliminar
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(data => {
                //una vez se elimine se actualiza la lista de productos
                obtenerProductos(); // Actualizamos la lista de productos
            })
            .catch(error => {//en dado caso de error se manda el siguiente mensaje
                console.error('Error al eliminar el artículo:', error);
            });
          Swal.fire({//alerta de articulo eliminado correctamente
            title: "Eliminado",
            text: "El articulo ha sido eliminado correctamente!!",
            icon: "success"
          });
        }

      });
    
}

//asignamos funcion de click para cerrar modal
cerrarModal.addEventListener("click",()=>{
    modalArticulo.style.display="none"
})
//al icono de salir le asignamos un evento clic para que redirija a la pagina de inicio nuevamente
iconsalir.addEventListener("click",()=>{
    window.location.href="../Inicio Sesion/InicioSesion.html"
})
//cargamos todos los productos al cargar la pagina
obtenerProductos()



