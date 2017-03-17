const {ipcRenderer} = require('electron');


// connect DOM Object
var connect = {};
                 connect.el = {};
                 connect.el.container = document.querySelector("body");
                 connect.el.statut = connect.el.container.querySelector(".statut");



// on launch init ask for init the connect module QR
ipcRenderer.send('remote-init-ask');

// when process answer about init
ipcRenderer.on('remote-init-answer', (event, link) => {
                new QRCode("qrCode", {
                    text: link,
                    colorDark: "white",
                    colorLight: "#2ecc71"
                });


    ipcRenderer.on("remoteIsConnected", function() {
                connect.el.statut.innerText="Connecté !";
                connect.el.statut.classList.add("active");
    })
})
