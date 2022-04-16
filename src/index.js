const express = require('express');
const app = express();
const http = require('http')
const path = require("path");
const {Server} = require('socket.io');
const { v4: uuidV4 } = require('uuid');
const dotenv = require('dotenv');

const server = http.createServer(app);
const io = new Server(server);
dotenv.config({path: path.join(__dirname, '..', '.env')});

const port = process.env.E_PORT;
const dockerPort = process.env.DOCKER_PORT;
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.redirect(`/${uuidV4()}`)
})


app.get('/:room', (req, res) => {
    res.render('room', { roomId: req.params.room })
})
io.on('connection', socket => {
    socket.on('id', (data) => {
        const roomId = data['id'];
        const userId = data['pid'];
        socket.join(roomId)
        socket.to(roomId).emit('id', userId);
        socket.on('disconnect', () => {
            socket.to(roomId).emit('disconnection', userId);
        })
    });
    socket.on("chat", (roomID, message) => {
        socket.join(roomID);
        socket.to(roomID).emit("chat", message + '<hr>');
        socket.emit("chat", `Me: <br>${message}<hr>`);
    })
    socket.on("destroy", (id, room) => {
        socket.to(room).emit("destroy", id);
        socket.emit("destroy", id);
    })
})
server.listen(port, () => {
    console.log('Docker listening on *:' + dockerPort);
});
