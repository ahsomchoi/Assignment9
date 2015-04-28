var express = require("express"),
	app = express(),
    http = require("http").Server(app),
    io = require("socket.io")(http),
    // import the mongoose library
    mongoose = require("mongoose");

app.use(express.static(__dirname + "/client"));
app.use(express.bodyParser());

// connect to the amazeriffic data store in mongo
mongoose.connect('mongodb://localhost/amazeriffic');

// This is our mongoose model for todos
var ToDoSchema = mongoose.Schema({
    description: String,
    tags: [ String ]
});

var ToDo = mongoose.model("ToDo", ToDoSchema);

//here is the socket io stuff
io.on("connection", function(socket) {
	console.log("a user connected");
	//when the user clicks on the add button
	socket.on("submitDescTag", function(msg) {
		app.post("/todos", function (req, res) {
		    var newToDo = new ToDo({"description":req.body.description, "tags":req.body.tags});
		    newToDo.save(function (err, result) {
				if (err !== null) {
				    // the element did not get saved!
				    console.log(err);
				    res.send("ERROR");
				} else {
				    // our client expects *all* of the todo items to be returned, so we'll do
				    // an additional request to maintain compatibility
				    ToDo.find({}, function (err, result) {
						if (err !== null) {
						    // the element did not get saved!
						    res.send("ERROR");
						}
						res.json(result);
						//broadcast the result to clients
						socket.broadcast.emit("submitDescTag", result);
				    });
				}
		    });
		});
	});
});

http.listen(3000);


app.get("/todos.json", function (req, res) {
    ToDo.find({}, function (err, toDos) {
	res.json(toDos);
    });
});

