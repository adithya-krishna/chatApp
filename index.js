var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var http = require('http').Server(app);
var io = require("socket.io")(http);

app.use(require("express").static('data'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.use('/node_modules',  express.static(__dirname + '/node_modules'));
app.use('/app',  express.static(__dirname + '/app'));

app.get("/", function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


/*----------  This could be used to send users from the server. the code could also connect to a DB  and get users. We however, do not do this for simplicity.  ----------*/
// creating array of users.
var users = [];

// app.get('/api/users', function(req, res){
//     res.send(users);
// });
// app.get('/api/users/:id', function(req, res){
//     var user = users.filter(function (obj) { return ( obj.id === parseInt(req.params.id) ) });
//     if( user.length )
//         res.send(user);
//     else
//         return res.send({error: "no user found."})
// });

/*----------  This is auto initiated event when Client connects to Your Machine.  ----------*/
io.on('connection', function (socket) {
    console.log('a user with id "%s" connected', socket.id);

    /*----------  code below is used to echo the user's message. code could be modified to echo to a different connection to simulate a true chat app.  ----------*/
    socket.on('Send:Message', function (payload) {
        payload.id += 1;
        payload.sentBy = "them";
        setTimeout(function(){
            socket.emit('Get:Message', payload);
        }, 500);

        /*----------  code below could be use to broadcast to a particular connection if needed.  ----------*/
        // socket.broadcast.to(payload.id).emit('Get:Message', {  });
    });

    /*----------  logging the exit of a user  ----------*/
    socket.on('disconnect', function () {
        console.log('a user with id "%s" connected', socket.id);
    });
});


http.listen(3000, function () {
    console.log("Listening on 3000");
});