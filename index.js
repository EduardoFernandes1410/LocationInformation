/********************************SETUP**********************************/
var http			= require('http');
var fs				= require('fs');
var url				= require('url');
var path			= require('path');
var express			= require('express');
var mysql			= require('mysql');
var bodyParser		= require('body-parser');
var session			= require('express-session');
var app 			= express();

//*****MySQL*****//
var connection;
var db_config = {
	host	: 'us-cdbr-iron-east-05.cleardb.net',
	user	: 'b2087b1987ef17',
	password: '176399a5',
	database: 'heroku_76f3e347e1eb905'
};

//Conecta ao Banco de Dados
function handleDisconnect() {
	console.log('1. connecting to db:');
	connection = mysql.createConnection(db_config);

	connection.connect(function(err) {
		if(err) {
			console.log('2. error when connecting to db:', err);
			setTimeout(handleDisconnect, 1000);
		}
	});

	connection.on('error', function(err) {
		console.log('3. db error', err);
		if(err.code === 'PROTOCOL_CONNECTION_LOST') {
			handleDisconnect();
		} else {
			throw err;
		}
	});
}

//Inicia DB
handleDisconnect();

//*****DEPENDENCIAS*****//
//Utilizar o BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Utilizar o express-session
app.use(session({secret: 'S3NH4'}));

//Utilizar o express-static
app.use(express.static('./', {
	index: 'html/login/index.html'
}));

/*******************INICIO**********************/
app.get("/", function(req, res) {
	res.send("Bem vindo");
});

//POST posts
app.post("/postar", function(req, res) {
	postarDB(req.body, function(answer) {
		res.send(answer);
	});
});

//GET posts
app.get("/get-posts", function(req, res) {
	getPostsDB(function(answer) {
		var resposta = {
			postagens: JSON.parse(answer)
		}

		res.send(JSON.stringfy(resposta));
	});
});

/*******************QUERIES********************/
//Inserir postagem
function postarDB(post, callback) {
	connection.query('INSERT INTO posts SET ?', post, function(err, rows, fields) {
		if(!err) {
			callback(true);
		} else {
			console.log(err);
			callback(false);
		}
	});
}

//Get postagens
function getPostsDB(callback) {
	connection.query('SELECT * FROM posts', function(err, rows, fields) {
		if(!err) {
			callback(rows);
		} else {
			console.log(err);
			callback(false);
		}
	});
}

/*************************INICIA SERVIDOR*****************************/
var port = process.env.PORT || 3000;

app.listen(port, function() {
	console.log("Ouvindo na porta " + port);
});