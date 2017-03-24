var playlist = []




var monIP;
var socket;
function randomString() {
    var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
    var string_length = 5;
    var randomstring = '';
    for (var i = 0; i < string_length; i++) {
        var rnum = Math.floor(Math.random() * chars.length);
        randomstring += chars.substring(rnum, rnum + 1);
    }
    return randomstring;
}

function getIPs(callback){
              var ip_dups = {};
              //compatibility for firefox and chrome
              var RTCPeerConnection = window.RTCPeerConnection
                  || window.mozRTCPeerConnection
                  || window.webkitRTCPeerConnection;
              var useWebKit = !!window.webkitRTCPeerConnection;
              //bypass naive webrtc blocking using an iframe
              if(!RTCPeerConnection){
                  //NOTE: you need to have an iframe in the page right above the script tag
                  //
                  //<iframe id="iframe" sandbox="allow-same-origin" style="display: none"></iframe>
                  //<script>...getIPs called in here...
                  //
                  var win = iframe.contentWindow;
                  RTCPeerConnection = win.RTCPeerConnection
                      || win.mozRTCPeerConnection
                      || win.webkitRTCPeerConnection;
                  useWebKit = !!win.webkitRTCPeerConnection;
              }
              //minimal requirements for data connection
              var mediaConstraints = {
                  optional: [{RtpDataChannels: true}]
              };
              var servers = {iceServers: [{urls: "stun:stun.services.mozilla.com"}]};
              //construct a new RTCPeerConnection
              var pc = new RTCPeerConnection(servers, mediaConstraints);
              function handleCandidate(candidate){
                  //match just the IP address
                  var ip_regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
                  var ip_addr = ip_regex.exec(candidate)[1];
                  //remove duplicates
                  if(ip_dups[ip_addr] === undefined)
                      callback(ip_addr);
                  ip_dups[ip_addr] = true;
              }
              //listen for candidate events
              pc.onicecandidate = function(ice){
                  //skip non-candidate events
                  if(ice.candidate)
                      handleCandidate(ice.candidate.candidate);
              };
              //create a bogus data channel
              pc.createDataChannel("");
              //create an offer sdp
              pc.createOffer(function(result){
                  //trigger the stun server request
                  pc.setLocalDescription(result, function(){}, function(){});
              }, function(){});
              //wait for a while to let everything done
              setTimeout(function(){
                  //read candidate info from local description
                  var lines = pc.localDescription.sdp.split('\n');
                  lines.forEach(function(line){
                      if(line.indexOf('a=candidate:') === 0)
                          handleCandidate(line);
                  });
              }, 1000);
          }
          //insert IP addresses into the page
          getIPs(function(ip){

              //local IPs
              if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/))
                 monIP=ip;

          });


const {ipcRenderer} = require('electron');


// create player object
var player = {}

//create object to collect of the DOM nodes we needed
player.el = {}
player.el.container = document.querySelector(".player");
player.el.dragMe = player.el.container.querySelector(".drag-me");
player.el.dragMeZone = player.el.dragMe.querySelector(".drag-me-popup");
player.el.video = player.el.container.querySelector("video");
player.el.player_bar = player.el.container.querySelector(".player-bar");
player.el.controls = player.el.container.querySelector(".controls");
player.el.controls_plus = player.el.container.querySelector(".controls-plus");
player.el.controls_top = player.el.container.querySelector(".controls-top");
player.el.remote_btn = player.el.controls_top.querySelector(".remote");
player.el.playlist_btn = player.el.controls_top.querySelector(".playlist_icon");
player.el.remote_menu = player.el.container.querySelector(".menu-remote");
player.el.toggle_play = player.el.controls.querySelector(".toggle-play");
player.el.back_btn = player.el.controls.querySelector(".go-prev");
player.el.next_btn = player.el.controls.querySelector(".go-next");
player.el.seek_bar = player.el.container.querySelector(".seek-bar");
player.el.seek_bar_full = player.el.seek_bar.querySelector(".seek-bar-full");
player.el.seek_bar_progress = player.el.seek_bar.querySelector(".seek-bar-progress");
player.el.seek_bar_tumbmail = player.el.seek_bar.querySelector(".thumbmail");
player.el.thumbmail_screen = player.el.seek_bar_tumbmail.querySelector(".thumbmail-video");
player.el.thumbmail_time = player.el.seek_bar_tumbmail.querySelector(".thumbmail-video-time-content span");
player.el.sound_bar = player.el.container.querySelector(".sound-bar");
player.el.sound_btn = player.el.controls_plus.querySelector(".sound .contain-icons");
player.el.sound_bar_full = player.el.controls_plus.querySelector(".sound-bar-full");
player.el.sound_bar_progress = player.el.sound_bar_full.querySelector(".sound-bar-progress");
player.el.fullscreen_btn = player.el.controls_plus.querySelector(".fullscreen");
player.el.playlist = player.el.container.querySelector(".playlist");
player.el.playlist_els = [];

// create a object who keep some data on the player status
player.status = {}
player.status.nb_vol = 1;
player.status.indexPlaylist = 0;
player.status.isAuto = true;
player.status.isConnected = false;

document.ondragover = document.ondrop = (ev) => {
  ev.preventDefault()
}

document.body.ondrop = (ev) => {

    player.el.container.classList.remove("isPlaying");
    console.log(ev.dataTransfer.files.length + " fichiers ajoutés à la file d'attente")
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
            playlist.push(
                {
                    name:ev.dataTransfer.files[i].name,
                    path:ev.dataTransfer.files[i].path,
                }
            )
            var playlist_el = document.createElement("div");
            playlist_el.classList.add("playlist-el");

            playlist_el.setAttribute("index",playlist.length-1);
            var title = document.createElement("h3");
            title.innerText= ev.dataTransfer.files[i].name;

            playlist_el.append(title);
            var video_el = document.createElement("video");
            video_el.setAttribute("src", ev.dataTransfer.files[i].path);


            // playlist_el.append(path);
            player.el.playlist.append(playlist_el);


}
    player.el.playlist_els = player.el.playlist.querySelectorAll(".playlist-el");
    player.el.playlist_els[0].classList.add("active");
    for (var i = 0; i < player.el.playlist_els.length; i++) {
        player.el.playlist_els[i].addEventListener("click", function(e) {
            e.preventDefault();
            changeVideo(this.getAttribute("index"));

        })
    }
    player.el.video.setAttribute("src",ev.dataTransfer.files[0].path);
    player.el.thumbmail_screen.setAttribute("src",ev.dataTransfer.files[0].path);
  player.el.player_bar.classList.add("active");
 player.el.dragMe.remove();
 console.log(playlist);
   ev.preventDefault()
 }



 // init socketio for remote function

 function connect() {
 socket = io("http://"+monIP+":8080");
 var room = randomString();
 socket.emit("roomRequest", room);
 socket.on("roomAnswer", function(answer) {
     if (answer) {
         console.log("connected")
         player.status.isConnected = true;
     } else {
         room = randomString();
         socket.emit("roomRequest", room);
     }
 })
 ipcRenderer.send('open-remote', "http://" + monIP + ":8080/remote.html?id=" + room+"");
 // remote ready event
 socket.on("remoteReady", function() {
     ipcRenderer.send("close-remote-win");


 })
 // listen remote controls
 socket.on("togglePlay", function() {
     play_pause();
 })

 socket.on("autoMode", function() {
     autoModeToggle()
 })

 socket.on("goTime", function(direction) {
     goTime(direction);
     noFocus();
 })

 socket.on("playlistUpdate", function(direction) {
     if (direction == "prev") {
         changeVideo(parseInt(player.status.indexPlaylist) - 1, "arrows");
     } else if (direction == "next") {
         changeVideo(parseInt(player.status.indexPlaylist) + 1, "arrows");
     }
 })

 socket.on("soundUpdate", function(direction) {
     soundUpdate(direction);
     noFocus();
 })

 socket.on("mute", function() {
     mute();
 })

 socket.on("changeVideo", function(index, mode) {
     changeVideo(parseInt(index), "auto");
 })


 }
 //help to check double click instead of simple click
 var isDbclick = 0;
 var timeout;

 // init the player
 player.el.toggle_play.addEventListener("click", function(e) {
     e.preventDefault();
     play_pause();
 })

 // hide controls and data if mouse dont mouse
 var focusPlayer = setTimeout(function() {
     focus();
 }, 4000);

 //show controls and data if mouse move
 document.addEventListener("mousemove", function() {
     noFocus();
 });


 // all keycodes and calling their respective functions
 document.addEventListener("keydown", function(e) {
     if (e.keyCode == 32) {
         play_pause();
     } else if (e.keyCode == 39) {

                     goTime("next");





     } else if (e.keyCode == 37) {

                     goTime("prev");
                     isDbclick = 0;

         }else if (e.keyCode == 70) {
        //  fullscreen();
        console.log("it's coming!");
     } else if (e.keyCode == 77) {
         mute();
     } else if (e.keyCode == 27) {
         // dont work, it seems that the browser function go ahead
        //  exit_fullscreen();
        console.log("it's coming!");
     } else if (e.keyCode == 38) {
         soundUpdate("up")
     } else if (e.keyCode == 40) {
         soundUpdate("down")
     }


 })


 // all click events and calling their respectives functions
 player.el.video.addEventListener("click", function(e) {
     //check if this is a double click
     isDbclick++
     //if is a single click
     if (isDbclick == 1) {
         timeout = setTimeout(function() {

                 isDbclick = 0;
             }, 400) // time before consider that is a single click
     }
     // double click catch event
     else {
         clearTimeout(timeout);
     play_pause();
         isDbclick = 0;
     }
 })
 player.el.sound_btn.addEventListener("click", function(e) {
     mute();
 })

 player.el.back_btn.addEventListener("click", function(e) {
     //check if this is a double click
     isDbclick++
     //if is a single click
     if (isDbclick == 1) {
         timeout = setTimeout(function() {
                 goTime("prev");
                 isDbclick = 0;
             }, 400) // time before consider that is a single click
     }
     // double click catch event
     else {
         clearTimeout(timeout);
         changeVideo(parseInt(player.status.indexPlaylist) - 1, "arrows");
         isDbclick = 0;
     }

 })

 player.el.next_btn.addEventListener("click", function(e) {
     //check if this is a double click
     isDbclick++
     //if is a single click
     if (isDbclick == 1) {
         timeout = setTimeout(function() {
                 goTime("next");
                 isDbclick = 0;
             }, 400) // time before consider that is a single click
     }
     // double click catch event
     else {
         clearTimeout(timeout);
         changeVideo(parseInt(player.status.indexPlaylist) + 1, "arrows");
         isDbclick = 0;
     }
 })

 player.el.fullscreen_btn.addEventListener("click", function(e) {
    //  fullscreen();
    console.log("it's coming!");
 })

 player.el.remote_btn.addEventListener("click", function(e) {
     connect()

 })
 player.el.playlist_btn.addEventListener("click", function(e) {
     e.preventDefault();
     togglePlaylist();
 })



 player.el.seek_bar.addEventListener("click", function(e) {
     // change offset with the open menu
     var with_menu_calc = 0;
     if (!player.el.container.classList.contains("isFullscreen") && player.el.container.classList.contains("menu-open-playlist")) {
         with_menu_calc = 200;
     }

     event.preventDefault();
     // get the different offset of the player seeking bar
     var seek_bar_width = player.el.seek_bar.offsetWidth,
         seek_bar_left = player.el.seek_bar.offsetLeft,
         // get the position of the client mouse
         mouse_x = e.clientX,
         // get the ratio with all the informations
         ratio = (mouse_x - seek_bar_left - player.el.container.offsetLeft + with_menu_calc) / seek_bar_width,
         // get the time with the duration of the video
         time = ratio * player.el.video.duration;
     // set the time to player and to the seek bar
     player.el.video.currentTime = time;
     player.el.seek_bar_progress.style.transform = 'scaleX(' + ratio + ')';

 })
 player.el.seek_bar.addEventListener("mousemove", function(e) {
     // change offset with the open menu
     var with_menu_calc = 0;
     if (!player.el.container.classList.contains("isFullscreen") && player.el.container.classList.contains("menu-open-playlist")) {
         with_menu_calc = 200;
     }
     event.preventDefault();
     // get the different offset of the player seeking bar
     var seek_bar_width = player.el.seek_bar.offsetWidth,
         seek_bar_left = player.el.seek_bar.offsetLeft,
         // get the position of the client mouse
         mouse_x = e.clientX,
         // get the ratio with all the informations
         ratio = (mouse_x - seek_bar_left - player.el.container.offsetLeft + with_menu_calc) / seek_bar_width,
         time,
         time_show;
     // avoid calculs when the mouse is appart from seekbar
     if (ratio >= 0 && ratio <= 1) {
         // set the time to player, to the seek bar and thumbmail
         player.el.seek_bar_tumbmail.style.left = ratio * 99 + "%";
         time = ratio * player.el.thumbmail_screen.duration;
         player.el.thumbmail_screen.currentTime = time;
         if ((Math.round(time) - Math.floor(Math.round(time) / 60) * 60 + "").length <= 1) {
             // transform 1:1, 2:4 in 1/01, 2:04
             time_show = Math.floor(Math.round(time) / 60) + ":0" + (Math.round(time) - Math.floor(Math.round(time) / 60) * 60);
         } else {
             time_show = Math.floor(Math.round(time) / 60) + ":" + (Math.round(time) - Math.floor(Math.round(time) / 60) * 60);
         }
         // display time
         player.el.thumbmail_time.innerText = time_show;
     }


 })
 player.el.sound_bar_full.addEventListener("click", function(e) {
     // change offset with the open menu
     var with_menu_calc = 0;
     if (player.el.container.classList.contains("menu-open-playlist")) {
         with_menu_calc = 200;
     }
     e.preventDefault();
     // get the different offset of the  sound bar
     var sound_bar_width = player.el.sound_bar.offsetWidth,
         sound_bar_left = player.el.controls_plus.offsetLeft,
         // position of the client mouse
         mouse_x = e.clientX,
         // get the ratio with all the informations
         ratio = ((mouse_x - sound_bar_left - player.el.container.offsetLeft - 20 + with_menu_calc) / sound_bar_width) * 10;
     // for get a sequence ratio in 0,1 interval
     ratio = Math.round(ratio) / 10;
     // set the ratio to volume
     player.el.video.volume = ratio;
     // save the volume in the player status object
     player.status.nb_vol = ratio;
     // set the ratio to the sound bar
     player.el.sound_bar_progress.style.transform = 'scaleX(' + ratio + ')';

 })



 // when volume change
 player.el.video.addEventListener("volumechange", function() {
     if (player.el.video.volume == 0) {
         // if volume = 0 set muted class
         player.el.container.classList.add("isMuted");

     } else {
         player.el.container.classList.remove("isMuted");
     }
 })

 //actualisation
 window.setInterval(function() {
     var duration = player.el.video.duration,
         time = player.el.video.currentTime,
         ratio = (time / duration);
     // advancing seeking bar
     player.el.seek_bar_progress.style.transform = 'scaleX(' + ratio + ')';
     if (ratio == 1 && player.status.isAuto) {
         // if atomode is enable and the video is finish, go to the next video
         changeVideo(parseInt(player.status.indexPlaylist) + 1, "auto")

     } else if (ratio == 1 && !player.status.isAuto) {
         // if autonomode is disable, remove isPlaying class, reboot the video and save the reboot
         noFocus();
         player.el.container.classList.remove("isPlaying");
         player.el.video.currentTime = 0;
     }
 }, 50);



 // FUNCTIONS
 // when mouse move in player
 function focus() {
     player.el.container.classList.add("isFocus");
 }

 // when mouse dont move in player
 function noFocus() {
     player.el.container.classList.remove("isFocus");
     clearTimeout(focusPlayer);
     focusPlayer = setTimeout(function() {
         focus();
     }, 4000)
 }

 // toggle play/pause
 function play_pause() {
     if (player.el.video.paused) {
         player.el.video.play();
         player.el.container.classList.add("isPlaying");
         if(player.status.isConnected) {
             socket.emit("videoPlay");
         }

     } else {
         player.el.video.pause();
         player.el.container.classList.remove("isPlaying");
         if(player.status.isConnected) {
             socket.emit("videoPause");
         }

     }
 }

 var showBar; // init for the timeout

 function soundUpdate(direction) {
     clearTimeout(showBar)
     if (direction == "up" && player.el.video.volume * 10 < 10) {
         player.el.video.volume = ((player.el.video.volume * 10) + 1) / 10
     } else if (direction == "down" && player.el.video.volume * 10 > 0) {
         player.el.video.volume = ((player.el.video.volume * 10) - 1) / 10
     }
     player.status.nb_vol = player.el.video.volume;
     player.el.sound_bar.classList.add("focus");
     player.el.sound_bar_progress.style.transform = 'scaleX(' + player.el.video.volume + ')';
     showBar = setTimeout(function() {
         player.el.sound_bar.classList.remove("focus");
     }, 4000)
 }

 // mute player
 function mute() {
     if (!player.status.isMuted) {
         player.status.isMuted = true;
         player.el.container.classList.add("isMuted");
         player.el.video.volume = 0;
         player.el.sound_bar_progress.style.transform = 'scaleX(' + 0 + ')';
     } else {
         player.status.isMuted = false;
         player.el.container.classList.remove("isMuted");
         // return to the volume before mute
         player.el.video.volume = player.status.nb_vol;
         player.el.sound_bar_progress.style.transform = 'scaleX(' + player.status.nb_vol + ')';
     }
 }

 // go foward of backward in time
 function goTime(direction) {
     if (direction == "prev") {
         player.el.video.currentTime = player.el.video.currentTime - 5
     } else if (direction == "next") {
         player.el.video.currentTime = player.el.video.currentTime + 5
     }
     noFocus();
 }
function togglePlaylist() {
    if (!player.el.playlist.classList.contains("active")) {
        player.el.playlist.classList.add("active");
    }
    else {
        player.el.playlist.classList.remove("active");
    }

}
 function changeVideo(index,mode) {
     if(index > playlist.length-1) {
         console.log("limit")
     }
     else {
         player.status.indexPlaylist = index;
         player.el.video.setAttribute("src",playlist[index].path);
         player.el.thumbmail_screen.setAttribute("src",playlist[index].path);
         updatePlaylist(index);
         play_pause();
     }


 }
function updatePlaylist(index) {
    for (var j = 0; j< player.el.playlist_els.length; j++) {
        player.el.playlist_els[j].classList.remove("active");
    }
    player.el.playlist_els[index].classList.add("active");
}
 // function fullscreen() {
 //     if (!player.status.isFullscreen) {
 //         player.status.isFullscreen = true;
 //         player.el.container.webkitRequestFullScreen();
 //
 //     } else {
 //         player.status.isFullscreen = false;
 //         document.webkitExitFullscreen();
 //     }
 // }
 //
 // // try to make echap functionnal
 // function exit_fullscreen() {
 //     player.status.isFullscreen = false;
 //     document.webkitExitFullscreen();
 //
 // }
