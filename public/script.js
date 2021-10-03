const peer = new Peer();
const socket = io('/', { transports: ['websocket'] });
let nono = [];
navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(async function(camera) {
    const video = document.getElementById('video');
    video.muted = true;
    video.srcObject = camera;
    video.addEventListener('loadedmetadata', () => {
        video.play()
    })
        socket.emit('id', {id: ROOM_ID, pid: peer.id});
    socket.on('id', (id) => {
        const call = peer.call(id, camera);
        call.on('stream', (stream) => {
            appendVideo(stream, call.peer);
        });
    });
    socket.on('disconnection', userId => {
        document.getElementById(userId).remove();
    })
    peer.on('call', call => {
        call.answer(camera);
        call.on('stream', (stream) => {
            appendVideo(stream, call.peer);
        })
    });
    peer.on('close', () => {
        peer.destroy();
    })
})
const appendVideo = (userVideoStream, id) => {
    if (!(nono.indexOf(userVideoStream.id) > -1)) {
        nono.push(userVideoStream.id);
        const video = document.createElement('video');
        video.srcObject = userVideoStream;
        video.id = id;
        video.play();
        document.body.appendChild(video);
    }
}