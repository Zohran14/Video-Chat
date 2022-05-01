/**
 * Sets a CSS style on the selected element(s) with !important priority.
 * This supports camelCased CSS style property names and calling with an object 
 * like the jQuery `css()` method. 
 * Unlike jQuery's css() this does NOT work as a getter.
 * 
 * @param {string|Object<string, string>} name
 * @param {string|undefined} value
 */   
 jQuery.fn.cssImportant = function(name, value) {
    const $this = this;
    const applyStyles = (n, v) => {
      // Convert style name from camelCase to dashed-case.
      const dashedName = n.replace(/(.)([A-Z])(.)/g, (str, m1, upper, m2) => {
        return m1 + "-" + upper.toLowerCase() + m2;
      }); 
      // Loop over each element in the selector and set the styles.
      $this.each(function(){
        this.style.setProperty(dashedName, v, 'important');
      });
    };
    // If called with the first parameter that is an object,
    // Loop over the entries in the object and apply those styles. 
    if(jQuery.isPlainObject(name)){
      for(const [n, v] of Object.entries(name)){
         applyStyles(n, v);
      }
    } else {
      // Otherwise called with style name and value.
      applyStyles(name, value);
    }
    // This is required for making jQuery plugin calls chainable.
    return $this;
  };

const peer = new Peer();
const socket = io('/', { transports: ['websocket'] });
let nono = [];
let screen = [];
let audio_mute = false;
let cam_mute = false;
let screen_share = false;
navigator.mediaDevices.getUserMedia({video: true, audio: true}).then(async function(camera) {
    sendStream(camera, peer);
})

const sendStream = (camera, peer) => {
        appendVideo(camera, peer.id, true);
        function muteMic(myStream) {
            myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
        }

        function muteCam(myStream) {
            myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
        }
        document.getElementById('mute').onclick = (e) => {
            muteMic(camera);
            if (!audio_mute) {
                e.target.textContent = "Unmute audio"
            }
            if (audio_mute) {
                e.target.textContent = "Mute audio"
            }
            audio_mute = !audio_mute
        }
        document.getElementById('mute2').onclick = (e) => {
            muteCam(camera);
            if (!cam_mute) {
                e.target.textContent = "Show camera"
            }
            if (cam_mute) {
                e.target.textContent = "Stop camera"
            }
            cam_mute = !cam_mute;
        }
        socket.emit('id', {id: ROOM_ID, pid: peer.id});
        socket.on('id', (id) => {
            const call = peer.call(id, camera);
            call.on('stream', (stream) => {
                appendVideo(stream, call.peer, false);
            });
        });
        socket.on('disconnection', userId => {
            console.log(userId);
            document.getElementById(userId).remove();
        })
        peer.on('call', call => {
            call.answer(camera);
            call.on('stream', (stream) => {
                appendVideo(stream, call.peer, false);
            })
        });
        peer.on('close', () => {
            peer.destroy();
        })
}
const appendVideo = (userVideoStream, id, muted) => {
    if (!(nono.indexOf(userVideoStream.id) > -1)) {
        nono.push(userVideoStream.id);
        const div = document.createElement('div');
        const video = document.createElement('video');
        video.srcObject = userVideoStream;
        div.className = 'video-class';
        div.appendChild(video);
        if (muted) {
            video.muted = true;
        }
        if ($(`#${id}`).length > 0) {
            video.className = `screen ${id} col-lg-6`;
            document.body.appendChild(div);
            console.log("hi2");
            return;
        }
        video.id = id;
        video.play();
        document.body.appendChild(div);
    }
}
document.getElementById("ul").width = document.getElementById("chat").width;
document.getElementById("chat").addEventListener('keyup', (e) => {
    if (e.key == "Enter" && !e.shiftKey) {
        e.preventDefault();
        send();
    }
})
$(function () {
    $(".modal-dialog").draggable();
    $('.modal-dialog').resizable({

    });
    var checkExist = setInterval(function() {
        if ($(".video-class").length) {
            Array.from(document.querySelectorAll('.video-class')).forEach(el => {
                console.log(el);
                $(el).resizable({
                    alsoResize: `#${el.children[0].id}`
                });
                $(".video-class").draggable()
            })
        }
     }, 100);
})


function send() {
    if (document.getElementById("chat").value !== '\n') {
        socket.emit("chat", ROOM_ID, document.getElementById("chat").value.replaceAll(/\r?\n/g, '<br />'));
    }
    document.getElementById("chat").value = '';
}
socket.on("chat", (message) => {
    const h3 = document.createElement('h3');
    h3.innerHTML = message;
    document.getElementById("ul").appendChild(h3);
})
socket.on("destroy", (id)=> {
    document.getElementById(id).remove();
})
document.getElementById("screen-share").addEventListener("click", () => {
    if (!screen_share) {
        screen_share = true;
        document.getElementById("screen-share").textContent = "Stop Share";
        navigator.mediaDevices.getDisplayMedia({video: true, audio: true}).then(async (stream) => {
            const peer2 = new Peer(uuid.v4());
            console.log(typeof peer2, Object.keys(peer2), peer2["_id"]);
            screen.push(peer2);
            sendStream(stream, peer2);
        })
    } else {
        screen_share = false;
        document.getElementById("screen-share").textContent = "Screen Share";
        if (screen.length > 0) {
            screen.forEach(element => {
                console.log(element);
                element.destroy();
                socket.emit("destroy", element._lastServerId, ROOM_ID);
            })
        }
    }
})
