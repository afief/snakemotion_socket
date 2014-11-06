var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var slashes = require('connect-slashes');

app.use(slashes());


/* ROUTING */
app.get('/', function(req, res){
	res.sendFile(__dirname + "/game/index.html");
});
app.get('/game/:file', function(req, res) {
	var file = req.params.file;
	res.sendFile(__dirname + "/game/" + file);
});

app.get('/control/', function(req, res) {
	res.sendFile(__dirname + "/control/index.html");
});
app.get('/control/:file', function(req, res) {
	var file = req.params.file;
	res.sendFile(__dirname + "/control/" + file);
});
app.get('/control/img/:file', function(req, res) {
	var file = req.params.file;
	res.sendFile(__dirname + "/control/img/" + file);
});


/*SOCKET*/
var serverList = {};
var serverIdList = new Array();

io.on('connection', function(socket){

	var newId = "";
	var isServer = false;

	socket.on("register", function(obj) {

		/*JIKA YANG REGISTER SERVER*/
		if (obj.as == "server") {
			newId = makeid();

			serverList[newId] = socket;
			serverIdList.push(newId);
			isServer = true;

			socket.emit("reg_success", newId);

			console.log("new server -", newId);

		} else {
			/*JIKA YANG REGISTER BUKAN SERVER*/
			newId = obj.kode;

			if (serverList[newId] != undefined) {
				socket.emit("reg_success", newId);
				serverList[newId].emit("new user");
			} else {
				socket.emit("reg_fail", "tidak ada game dengan kode " + newId);
			}

			console.log("client connect with", newId);
		}

	});

	socket.on("move", function (arah) {
		if (serverList[newId] != undefined) {
			serverList[newId].emit("move", arah);
		} else {
			socket.emit("game_disconnect");
		}
	});

	socket.on("disconnect", function() {
		if (isServer) {
			serverList[newId] = undefined;
			serverIdList.splice(serverIdList.indexOf(newId), 1);

			console.log("disconnect server -", newId);
		} else if (newId != "") {
			if (serverList[newId] != undefined)
				serverList[newId].emit("remove user");

			console.log("disconnect client -", newId);
		}
	});
});

function makeid() {
	var text = "";
	var possible = "abcdefghijklmnopqrstuvwxyz";

	for( var i=0; i < 3; i++ ) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	if (serverList[text] != undefined)
		text = makeid();

	return text;
}

/*NYALAIN SERVER*/
http.listen(3000, function(){
	console.log('listening on *:3000');
});