const { PeerServer } = require('peer');
const express = require('express');
const app = express();
const http = require('http')
const path = require("path");
const server = http.createServer(app);
const {Server} = require('socket.io');
const io = new Server(server);
const { v4: uuidV4 } = require('uuid');
const dotenv = require('dotenv');
dotenv.config({path: path.join(__dirname, '..', '.env')});

const port = process.env.E_PORT;
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
})
server.listen(port, () => {
    console.log('Zohran video chat listening on *:' + port);
});
