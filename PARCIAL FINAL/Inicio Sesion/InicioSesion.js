const images=["../assets/images/imagen1.jpg","../assets/images/imagen2.jpg","../assets/images/imagen3.jpg","../assets/images/imagen4.jpeg"];//array que contiene todas las imagenes del carrusel de imagenes del inicio de sesion
var index=0;//indice de la imagen que se esta mostrando en pantalla
// Obtener los elementos del formulario y del mensaje
const loginForm = document.getElementById('login');
const identificacionInput = document.getElementById('identificacion');
const contrasenaInput = document.getElementById('contrasena');
const message = document.getElementById('message');

//funcion de carrusel de imagenes
function carrusel(){
    if(index==images.length){//si el index es igual al tamaño del vector de imagenes entonces se reinicia a 0 para que se vuelva a mostrar la primera imagen y asi sucesivamente en ciclo secuencial
        index=0;
    }
    document.body.style.backgroundImage = `url(${images[index]})`;//se asigna la imagen que tiene el index a el fondo de pantalla
    index++;//se incrementa en uno el index para que se muestre la siguiente imagen del vector
}

// Escuchar el evento de envío del formulario
loginForm.addEventListener('submit', async (event) => {//se le agrega al formulario de inicio de sesion el evento de submit
    event.preventDefault(); // Prevenir el comportamiento por defecto de envío del formulario

    // Obtenemos los valores de los campos de inicio de sesion
    const identificacion = identificacionInput.value;
    const contrasena = contrasenaInput.value;

    try {
        // Realizar la solicitud al backend usando fetch
        const response = await fetch('http://localhost:3000/login', {//hacemos la solicitu fetch indicando la url del servicio 
            method: 'POST',//especificamos el metodo a usar
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({//en cel cuerpo de la solicitud mandamos la informacion obtenida de los campos en formato JSON
                identificacion:identificacion,
                contrasena:contrasena
            })
        });

        // Si la respuesta es exitosa
        if (response.ok) {
            const data = await response.json();
            // Mostrar mensaje de éxito
            message.style.color = 'green';//si la respuesta es exitosa se pone el mensaje de color verde
            message.textContent = data.message;//si la respuesta es exitosa se imprime un mensaje de exito 
            // Redirigir a la página de inventario despues de 2 segundos
            setTimeout(()=>{
                window.location.href = "../CRUD INVENTARIO/inventario.html";//redireccionamiento a la siguiente pagina
                //limpiamos campos de inputs
                identificacionInput.value="";
                contrasenaInput.value="";
            },2000)
            
        } else {//en caso de cualquier error
            const errorData = await response.json();
            // Mostrar mensaje de error
            message.style.color = 'red';//en caso de error el mensaje se mostrara de color rojo
            message.textContent = errorData.message;// en caso de erroe el contenido de mensaje sera de error
            //limpiar campos pasado 1 segundo
            setTimeout(()=>{
                identificacionInput.value="";
                contrasenaInput.value="";
                message.textContent=""
            },1000)
            
        }
    } catch (error) {//en dado caso de que hubiese sucedido un error en el sevidor
        console.error("Error en la solicitud:", error);
        message.style.color = 'red';
        message.textContent = "Hubo un problema al conectarse con el servidor.";
    }
});

//llamado al carrusel de imagenes recien inicia la pagina
carrusel();
//llamdo para que se ejecute el cambio de imagen cada 4 segundos
setInterval(carrusel,4000);





