const { io } = require('../server');
const { Usuarios } = require('../classes/usuarios');
const { crearMensaje } = require('../utilidades/utilidades');
const usuarios = new Usuarios();

io.on('connection', (client) => {
    client.on('entrarChat', (data, callback) => {
        if (!data.nombre || !data.sala) {
            return callback({
                err: true,
                msg: 'El nombre/sala es necesario'
            })
        }
        client.join(data.sala);
        let personas = usuarios.agregarPersona(client.id, data.nombre, data.sala);
        console.log(data, personas);
        console.log('personasEnServidor', usuarios.getPersonas());
        console.log(`Personas en sala: ${data.sala}`, usuarios.getPersonasPorSala(data.sala));

        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala));
        client.broadcast.to(data.sala).emit('crearMensaje', crearMensaje('Administrador', `${data.nombre} se unio al chat`));

        callback(usuarios.getPersonasPorSala(data.sala));
    });

    client.on('crearMensaje', (data, callback) => {
        let persona = usuarios.getPersona(client.id);
        let mensaje = crearMensaje(persona.nombre, data.mensaje);
        client.broadcast.to(persona.sala).emit('crearMensaje', mensaje);
        // client.broadcast.to(persona.sala).emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} se unio al chat`));
        callback(mensaje);
    });

    client.on('disconnect', () => {
        let personaBorrada = usuarios.borrarPersona(client.id);
        console.log('me desconecte!!!!', personaBorrada);
        if (personaBorrada) {
            client.broadcast.emit('crearMensaje', crearMensaje('Administrador', `${personaBorrada.nombre} salio del chat`));
            client.broadcast.emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala));
        }
    });

    // Mensajes privados
    client.on('mensajePrivado', (data, callback) => {
        if (!data.id) {
            return callback({
                err: true,
                msg: 'No tienes id'
            })
        }
        let persona = usuarios.getPersona(client.id);
        client.broadcast.to(data.para).emit('mensajePrivado', crearMensaje(persona.nombre, data.mensaje));


    })
});