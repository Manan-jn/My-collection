const http = require('http');
const express = require('express');
const app = express();
const socketio = require('socket.io');
//socket.io returns me an object into which i pass in the server
//socket.io cannot directly run on the express app
//we can create an http server which will power our express app
const server = http.createServer(app);
const io = socketio(server);
const users = {};
io.on('connection', socket => {
    socket.on('new-user-joined', name => {
        // console.log('new user', name);
        users[socket.id] = name;
        socket.broadcast.emit('user-joined', name);
    });
    socket.on('send', message => {
        socket.broadcast.emit('receive', { message: message, name: users[socket.id] })
    });
    socket.on('disconnect', message => {
        socket.broadcast.emit('left', users[socket.id]);
        delete users[socket.id];
    })
})


app.use('/', express.static(__dirname + '/public/'));

server.listen(3000, () => {
    console.log("Started on http://localhost:3000");
})