var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

/* ROUTING */
app.get('/', function(req, res){
	res.sendFile(__dirname + "/game/index.html");
});
app.get('/game/:file', function(req, res) {
	var file = req.params.file;
	res.sendFile(__dirname + "/game/" + file);
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
		}
		
	});

	socket.on("disconnect", function() {
		if (isServer) {
			serverList[newId] = undefined;
			serverIdList.splice(serverIdList.indexOf(newId), 1);
		}
		console.log("disconnect -", newId);
		console.log(serverList);
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