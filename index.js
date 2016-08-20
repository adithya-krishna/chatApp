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

// This is auto initiated event when Client connects to Your Machine.
io.on('connection', function (socket) {
    console.log('a user with id "%s" connected', socket.id);

    //Sending message to Specific user
    socket.on('Send:Message', function (payload) {
        console.log(payload);
        payload.id += 1;
        payload.sentBy = "them";
        setTimeout(function(){
            socket.emit('Get:Message', payload);
        }, 1000);

        // socket.broadcast.to(dataServer.id).emit('Get:Message', {
        //     msg: dataServer.msg,
        //     id: dataServer.id,
        //     name: dataServer.name
        // });
    });

    //Removig user when user left the chatroom
    socket.on('disconnect', function () {
        console.log('a user with id "%s" connected', socket.id);
        for (var i = 0; i < users.length; i++) {
            if (users[i].id == socket.id) {
                users.splice(i, 1); //Removing single user
            }
        }
        io.emit('Exit', users); //sending list of users
    });
});


http.listen(3000, function () {
    console.log("Listening on 3000");
});