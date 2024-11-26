//llamamos a las dependencias necesarias
const express =require("express")
const mysql=require("mysql")
const cors=require("cors")
const {json}=require("express")
const app=express()
const puerto=process.env.PUERTO||3000;//se define el puerto en el cual correra el servidor

app.use(cors()); 
app.use(express.json()); 

app.listen(puerto,()=>{//ponemos a escuchar a la app por el puerto elegido y levantamos el servidor
    console.log("servidor de node levantado")
})

//creacion de la conexion con la base de datos
const BD=mysql.createConnection({
    host:"localhost",       
    database:"users_inventario",//nombre de la base de datos de nuestra app
    user:"root",
    password:""
})

//aca se realiza la validacion de si se conecto a la base de datos o no
BD.connect((err)=>{
if(err){
    throw err; //esto es el manejo de excepciones 
    return;
}else{
    console.log("conexion exitosa a la base de datos");//si tenemos conexion exitosa a la base de datos indicamos un mensaje en la consola de node
    
}
})

//Endpoint para el inicio de sesion
app.post("/login", (req, res) => {
    // Recibimos el nombre de usuario y la contraseña desde el cliente 
    const { identificacion, contrasena } = req.body;//recibimos la informacion desde el cuerpo de la solicitud

    // Verificamos si identificacion no es un número
    if (isNaN(identificacion)) {
        return res.status(400).json({ message: "La identificación debe ser un número." });//en dado caso de que no sea un numero se arroja el siguiente mensaje
    }

    if(identificacion)//por lo contrario si la identificacion existe y es un numero se procede a hacer el proceso de buscar en la base de datos
    // Comprobamos si el usuario existe en la base de datos
    BD.query("SELECT * FROM users WHERE IDENTIFICACION = ?", [identificacion], (err, result) => {
        if (err) {
            return res.status(500).json({ message: "Error en la base de datos" });//en dado caso de que halla un error en la base de datos se arroja este mensaje
        }
        //en dado caso de que el array venga vacio indica que no hay usuarios encontrados con ese numero de id
        if (result.length === 0) {
            // Si no existe el usuario
            console.log(result)
            return res.status(404).json({ message: "Usuario no encontrado" });//arrojamos el siguiente mensaje cuando no hay coincidencias de id en la base de datos
            
        }

        const user = result[0]; // El primer usuario encontrado en el array

        // Comparamos la contraseña proporcionada con la almacenada en la base de datos
        if (contrasena == user.CONTRASENA) {
            // Si las contraseñas coinciden
            return res.status(200).json({ message: "Inicio de sesión exitoso" });//si la contraseña es correcta arrojamos el siguiente mensaje
        } else {
            // Si las contraseñas no coinciden
            return res.status(401).json({ message: "Contraseña incorrecta" });//si la contraseañ es incorrecata arrojamos el siguiente mensaje
        }
    });
});



//TODO DE AQUI PARA ABAJO ES DEL CRUD DEL INVENTARIO

// Endpoint para obtener todos los productos
app.get('/articulos', (req, res) => {//se establece la ruta por la cual se ejecutara este servicio
    BD.query('SELECT * FROM articulos', (err, results) => {//se asigna la consultque se hara a la base de datos
        if (err) {
            return res.status(500).json({ message: 'Error en la base de datos' });//si sucede algun error en la base de datos se arroja este mensaje
        }
        res.status(200).json(results);// de lo contrario se retornan los resultados
    });
});

// Endpoint para agregar un artículo
app.post('/articulos', (req, res) => {//se define la ruta y el metodo para el servicio
    const { producto, stock, precio } = req.body;//se obtiene informacion del cuerpo de la solicitud fetch realizada por el cliente

    // Validamos que todos los campos estén presentes
    if (!producto|| !stock || !precio) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });//si algun campo no existe se procede a enviar el siguiente mensaje
    }
    //realizamos la query o consulta a la base de datos
    BD.query("INSERT INTO articulos (producto, stock, precio) VALUES (?, ?, ?)", [producto, stock, precio], (err, result) => {//realizamos la query para poder agregar datos a la base de datos
        if (err) {//en dado caso de error al agregar en la base de datos se realza lo siguiente:
            console.error("Error al insertar el artículo:", err);
            return res.status(500).json({ message: "Error al agregar el artículo" });
        }
        res.status(201).json({ message: "Artículo agregado con éxito" });//en dado caso de exito se retorna un json con mensaje de exito
    });
});

// Endpoint para editar un artículo
app.put('/articulos/:id', (req, res) => {
    const { id } = req.params; // Obtener el ID del artículo de los parámetros de la URL
    const { producto, stock, precio } = req.body; // Obtener los datos del cuerpo de la solicitud

    // Validamos que todos los campos estén presentes
    if (!producto || !stock || !precio) {
        return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Realizamos la query o consulta a la base de datos
    BD.query(
        "UPDATE articulos SET producto = ?, stock = ?, precio = ? WHERE id = ?",
        [producto, stock, precio, id],
        (err, result) => {
            if (err) {//en caso de error se procede a hacer lo siguiente:
                console.error("Error al actualizar el artículo:", err);
                return res.status(500).json({ message: "Error al actualizar el artículo" });
            }

            // Verificamos si se realizó alguna actualización
            if (result.affectedRows === 0) { //si sucede que no se realizo ninguna actualizacion se retorna un mensaje de articulo no encontrado 
                return res.status(404).json({ message: "Artículo no encontrado" });
            }
            //en dado caso de que si halla alguna actualizacion se retorna un mensaje de exito
            res.status(200).json({ message: "Artículo actualizado con éxito" });
        }
    );
});

// Endpoint para eliminar un artículo por su ID
app.delete('/articulos/:id', (req, res) => {
    const { id } = req.params;  // Obtener el ID del artículo desde los parámetros de la URL

    // Validar si el ID es válido
    if (!id || isNaN(id)) { //verificamos que el id recibido sea si o si un numero 
        return res.status(400).json({ message: "ID inválido" });//si el id no es numero se procede a enviar el siguiente mensaje de error
    }

    // Realizamos la consulta para eliminar el artículo de la base de datos
    BD.query("DELETE FROM articulos WHERE id = ?", [id], (err, result) => {
        if (err) {//en dado caso de error en la eliminacion en la base de datos se realiza lo siguiente
            console.error("Error al eliminar el artículo:", err);
            return res.status(500).json({ message: "Error al eliminar el artículo" });
        }

        // Verificamos si se eliminó algún artículo
        if (result.affectedRows === 0) {//si no se realiza ningun cambio se retorna este mensaje de error
            return res.status(404).json({ message: "Artículo no encontrado" });
        }

        // Respuesta de éxito
        res.status(200).json({ message: "Artículo eliminado con éxito" });//en dado caso de eliminacion exitosa se retorna mensaje de exito
    });
});


