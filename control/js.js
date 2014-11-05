window.addEventListener("load", init);

var dw = 800;
var dh = 480;
var baseUrl = "http://inmotion.web.id/testbed/yaris/game/"; //"http://200.200.200.43/websocket/";
var webSocketUrl = "ws://192.168.1.127:5000";  //"ws://200.200.200.43:5000";

var websocket;

function init() {
    var btUp = document.getElementById("btUp");
    var btDown = document.getElementById("btDown");
    var btLeft = document.getElementById("btLeft");
    var btRight = document.getElementById("btRight");
    var btMasuk = document.getElementById("btMasuk");
    var btTryAgain = document.getElementById("btTryAgain");
    var elwait = document.getElementById("elwait");
    var queKet = document.getElementById("queKet");
    var finalScore = document.getElementById("finalScore");
    var btGameOverPlay = document.getElementById("btGameOverPlay");
    var elCounter = document.getElementById("elCounter");
    var logoUtama = document.getElementById("logoUtama");

    var loading = document.getElementById("loading");

    var textKet = document.getElementById("textKet");
    var inputName = document.getElementById("inputName");
    var elMessage = document.getElementById("message");
    var intervalDown = 0;

    var container = document.getElementById("container");
    var controlId = -1;

    showLoading();
    //check web socket supports
    showPage("page1");
    checkSupport();
    webSocketConnect();
    webSocketEvents();
    buttonEvent();

    function checkSupport() {
        if (Modernizr.websockets) {
            elMessage.innerHTML += "SUPPORTED" + "<br />";
            btTryAgain.addEventListener("click", function() {
                console.log("coba lagi");

                showLoading();
                websocket = undefined;
                webSocketConnect();
                webSocketEvents();
            });
        } else {
            elMessage.innerHTML += "NOT SUPPORTED" + "<br />";
            textKet("Your Browser is Not Supported<br/>Please upgrade to newest chrome or firefox");
            showPage("page0");
            btTryAgain.style.display = "none";
            hideLoading();
        }
    }

    function webSocketConnect() {
        websocket = new WebSocket(webSocketUrl);        
    }
    function webSocketEvents() {
        websocket.onerror = function(e) {
            showPage("page0");
            console.log("NOT CONNECTED to the server!");
            textKet.innerHTML = "Tidak Terkoneksi Ke Server";
            hideLoading();
        }
        websocket.onmessage = function(message) {
            var obj = JSON.parse(message.data);
            console.log(obj);

            if (obj.key == "kode") {
                if (obj.status) {
                    showPage("page3"); //ke waiting list
                    controlId = obj.id;
                } else {
                    alert("Game Tidak Terkoneksi Ke Server"); //aha, gak konek
                }
            } else if (obj.key == "disconnect") {
                console.log("GAME DISCONNECTED");
                showPage("page1");
            } else if (obj.key == "order") {
                if (obj.val == "start") {
                    showPage("page2"); //ke kontroller
                } else if (obj.val == "gameover") {
                    //mati sendiri
                    window.clearInterval(intervalDown);
                    finalScore.innerHTML = "Score : " + obj.nilai;
                    showPage("page4");
                } else if (obj.val == "waiting") {
                    showPage("page5");
                    var _countDown = 5;
                    intervalDown = window.setInterval(function() {
                        elCounter.innerHTML = _countDown.toString();
                        if (_countDown > 0)
                            _countDown--;
                        else
                            window.clearInterval(intervalDown);
                    }, 1000);
                }
            } else if (obj.key == "waitinglist") { //buat element
                elwait.innerHTML = "";

                var newLi;
                for (var i = 0; i < obj.val.length; i++) {
                    newLi = document.createElement("li");

                    if (i == 0) {
                        newLi.setAttribute("class", "waitplaying");
                        newLi.innerHTML = "~. ";
                    } else {
                        newLi.innerHTML = i.toString() + ". ";
                    }
                    if (controlId == obj.ids[i]) {
                        newLi.setAttribute("class", "waitme");

                        if (i == 1)
                            queKet.innerHTML = "You Are The Next Player";
                        else
                            queKet.innerHTML = i.toString() + " More Players";
                    }

                    newLi.innerHTML += obj.val[i];

                    elwait.appendChild(newLi);
                }
            }
            hideLoading();
        }
        websocket.onclose = function() {
            console.log("Close!!");
            elMessage.innerHTML += "CLOSED!" + "<br />";
            textKet.innerHTML = "Koneksi Terputus";
            showPage("page0");
            hideLoading();
        }
        websocket.onopen = function() {
            console.log("OPEN!");
            showPage("page1");
            elMessage.innerHTML += "OPEN!" + "<br />";
            hideLoading();
        }
    }
    function buttonEvent() {        
        btUp.addEventListener("click", function() { socketSend({key: "key", val: '2'}); });
        btDown.addEventListener("click", function() { socketSend({key: "key", val: '3'}); });
        btLeft.addEventListener("click", function() { socketSend({key: "key", val: '1'}); });
        btRight.addEventListener("click", function() { socketSend({key: "key", val: '0'}); });

        btMasuk.addEventListener("click", function() {
            if (inputName.value != "") {
                socketSend({key: "daftarKode", val: "snakeonyarris", nama: inputName.value});
            }
        });
        logoUtama.addEventListener("click", function() {
            var r = confirm("Keluar Dari Game?");
            if (r)
                window.location.href = baseUrl;
        });
        btGameOverPlay.addEventListener("click", function() {
            console.log("refresh");
            window.location.href = baseUrl;
        });
    }
    function socketSend(_data) {
        console.log("___ send :", _data);
        websocket.send(JSON.stringify(_data));
    }

    window.addEventListener("resize", resize);
    function resize() {
        container.style.height = container.offsetWidth * dh / dw + "px";
        container.style.marginTop = ((window.innerHeight / 2) - (container.offsetHeight / 2) - 20) + "px";
    }
    resize();
    function showLoading() {
        loading.style.display = "block";
    }
    function hideLoading() {
        loading.style.display = "none";
    }
}

function showPage(_id) {
    var els = document.getElementsByClassName("page");
    for (var i = 0; i < els.length; i++) {
        els[i].style.display = "none";
    }
    document.getElementById(_id).style.display = "block";
}

