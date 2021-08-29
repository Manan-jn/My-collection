//Backend code
const http = require('http');
const express = require('express');
const app = express();
const socketio = require('socket.io');

//created an http server out of the express app
const server = http.createServer(app);
const io = socketio(server) //it serves socket.js file

io.on('connection', (socket) => {
    //it prints on backend
    console.log("Connected with socket id ", socket.id);

    socket.on('moveTofun', (data) => {
        socket.broadcast.emit('startDraw', (data));
    })
    socket.on('lineTofun', (data) => {
        socket.broadcast.emit('lineDraw', (data));
    })
    //server is recieving from the client side and printing on the console.
    // socket.on('boom', () => {
    //     console.log('Boom recieved from ', socket.id);
    // })

    //sending from the server to the client side
    // setInterval(() => {
    //     socket.emit('whizz');
    // }, 2000);


    //io.emit() sends data to all the sockets including from which we are sending
    //socket.emit() sends data to only that socket from where it recieved that data and it does not send to all the other sockets
    //socket.broadcast.emit() sends data to all other except from where we are sending that data
})


//make the entire folder available on the public path
app.use('/', express.static(__dirname + '/public'));

server.listen(3000, () => {
    console.log("Started on http://localhost:3000");
})