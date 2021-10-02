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
        call.on('stream', appendVideo)
    });
    peer.on('call', call => {
        call.answer(camera);
        call.on('stream', appendVideo)
    });
})
const appendVideo = (userVideoStream) => {
    if (!(nono.indexOf(userVideoStream.id) > -1)) {
        nono.push(userVideoStream.id);
        const video = document.createElement('video');
        video.srcObject = userVideoStream;
        video.play();
        document.body.appendChild(video);
    }
}