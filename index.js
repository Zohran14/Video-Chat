const { PeerServer } = require('peer');
const express = require('express');
const app = express();
const http = require('http')
const path = require("path");
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);
const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
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
    });
})
server.listen(3000, () => {
    console.log('listening on *:3000');
});
