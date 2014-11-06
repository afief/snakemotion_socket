window.addEventListener("load", init);


function init() {
    showPage("page1");

    var socket = new io();
    function socketInit() {
        showPage("page1");

        socket.on("connect", function() {
            console.log("connected");
        });

        socket.on("reg_success", function(newId) {
            console.log("reg_success");
            showPage("page2");
        });
        socket.on("reg_fail", function(msg) {
            console.log("reg_fail");
            alert(msg);
            showPage("page1");
        });

        socket.on('disconnect', function(){
            alert("disconnect from game");
            showPage("page1");
        });
        socket.on('game_disconnect', function() {
            alert("game disconnected");
            showPage("page1");
        });
        socket.on('error', function() {
            alert("game error");
            showPage("page1");
        });
    }
    socketInit();

    btMasuk.addEventListener("click", masukHandler);
    function masukHandler() {
        var gamecode = inputName.value;

        if (gamecode.length != 3) {
            alert("kode game yang benar adalah 3 digit");
        } else {
            socket.emit("register", {as: "client", kode: gamecode});
        }

        console.log(gamecode);
    }

    btUp.addEventListener("click", function() {
        socket.emit("move", "up");
    });
    btLeft.addEventListener("click", function() {
        socket.emit("move", "left");
    });
    btRight.addEventListener("click", function() {
        socket.emit("move", "right");
    });
    btDown.addEventListener("click", function() {
        socket.emit("move", "down");
    });
}

function showPage(_id) {
    var els = document.getElementsByClassName("page");
    for (var i = 0; i < els.length; i++) {
        els[i].style.display = "none";
    }
    document.getElementById(_id).style.display = "block";
}

