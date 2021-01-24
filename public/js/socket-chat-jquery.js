
var params = new URLSearchParams(window.location.search);
var nombre = params.get('nombre');
var sala = params.get('sala');
//referencias de usuarios
var divUsuarios = $('#divUsuarios');
var formEnviar = $('#formEnviar');
var txtMensaje = $('#txtMensaje');
var divChatbox = $('#divChatbox');

// Funciones para renderizar usuarios
function renderizarUsuarios( personas ) {
  console.log(personas);
  var html = `<li><a href="javascript:void(0)" class="active"> Chat de <span>${params.get('sala')}</span></a></li>`;
  for (let i = 0; i < personas.length; i++) {
    html += `<li><a data-id="${personas[i].id}" href="javascript:void(0)"><img src="assets/images/users/${i+1}.jpg" alt="user-img" class="img-circle"> <span>${personas[i].nombre} <small class="text-success">online</small></span></a></li>`
  }
  
  divUsuarios.html(html);
}

function renderizarMensaje(mensaje, yo) {
  var fecha = new Date(mensaje.fecha);
  var hora = `${fecha.getHours()}:${fecha.getMinutes()}`;
  var adminClass = mensaje.nombre === 'Administrador' ? 'danger' : 'info';


  var html = '';
  if (yo) {
    html = `<li class="reverse">
              <div class="chat-content">
                  <h5>${mensaje.nombre}</h5>
                  <div class="box bg-light-inverse">${mensaje.mensaje}</div>
              </div>
              <div class="chat-img"><img src="assets/images/users/5.jpg" alt="user" /></div>
              <div class="chat-time">${hora}</div>
            </li>`
  } else {
    html = `<li class="animated fadeIn">
              <div class="chat-img"><img src="assets/images/users/1.jpg" alt="user" /></div>
              <div class="chat-content">
                  <h5>${mensaje.nombre}</h5>
                  <div class="box bg-light-${adminClass}">${mensaje.mensaje}</div>
              </div>
              <div class="chat-time">${hora}</div>
            </li>`;

  }
  
  divChatbox.append(html);
}

function scrollBottom() {

  // selectors
  var newMessage = divChatbox.children('li:last-child');

  // heights
  var clientHeight = divChatbox.prop('clientHeight');
  var scrollTop = divChatbox.prop('scrollTop');
  var scrollHeight = divChatbox.prop('scrollHeight');
  var newMessageHeight = newMessage.innerHeight();
  var lastMessageHeight = newMessage.prev().innerHeight() || 0;

  if (clientHeight + scrollTop + newMessageHeight + lastMessageHeight >= scrollHeight) {
      divChatbox.scrollTop(scrollHeight);
  }
}

// Listeners jquery
divUsuarios.on('click', 'a', function() {
  var id = $(this).data('id');
  if (id) {
    console.log(id);
  }
});

formEnviar.on('submit', function(e) {
  e.preventDefault();
  if (txtMensaje.val().trim().length === 0) {
    return;
  }
  
  socket.emit('crearMensaje', {
    nombre: nombre,
    mensaje: txtMensaje.val()
  }, function(mensaje) {
    console.log('respuesta server: ', mensaje);
    txtMensaje.val('').focus();
    renderizarMensaje(mensaje, true);
    scrollBottom();
  });

});

