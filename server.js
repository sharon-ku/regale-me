/****************************************
MongoDB set up
*****************************************/
// Get modules
const Book = require("./Book.js");



/****************************************
Node set up
*****************************************/
const express = require("express");
const portNumber = 4200;
const app = express(); //make an instance of express
const server = require("http").createServer(app);

// create a server (using the Express framework object)
// declare io which mounts to our httpServer object (runs on top ... )
let io = require("socket.io")(server);

require("dotenv").config();
const mongoose = require("mongoose");

let bodyParser = require('body-parser');
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


const url = process.env.MONGODB_URI;
console.log(url);

// const PhoneUseModel = require("./DBSchema.js");
// const GooglePlayAppModel = require("./DBGooglePlaySchema.js");

// connect to db
mongoose.connect(url);
// contains name of my db
let db = mongoose.connection;
db.once("open", async function () {
  console.log("are here");

  // Book.find({ complete: "false" }).then((result) => {
  //   console.log(result);
  // })

  // Book.find({}).then((result) => {
  //   // console.log(result);

  //   for (i = 0; i < result.length; i++) {
  //     console.log(result[i].title);
  //   }
  // })

  // // START HERE FOR QUERIES:

});


// make server listen for incoming messages
server.listen(portNumber, function () {
  console.log("listening on port:: " + portNumber);
});
// create a server (using the Express framework object)
app.use(express.static(__dirname + "/public"));
app.use("/client", clientRoute);
//default route
app.get("/", function (req, res) {
  res.send("<h1>Hello world</h1>");
});

function clientRoute(req, res, next) {
  res.sendFile(__dirname + "/public/client.html");
}

/// use this VERB for getting posted data... 9
app.post('/postForm', handlePost);

// the callback
function handlePost(request, response) {
  console.log(request.body);
  response.send("SUCCESS POST");



}

// For testing purposes, I will only fetch first book of Books DB
let firstBook;

/*** THIS ONLY HAPPENS ONCE A CLIENT HAS SUCCESSFULLY LOGGED IN *****/
io.on("connect", newConnection);

function newConnection(socket) {
  let userDB = null;

  // console.log(socket);
  console.log(`new connection: ` + socket.id);

  socket.on("join", function () {
    socket.emit("joinedClientId", "temp");

  });

  // request Books from MongoDB into server
  socket.on("requestBooks", function (data) {
    console.log("showing data");

    Book.find({}).then((result) => {
      firstBook = result[0];
      socket.emit("newBooks", firstBook);
    })

    // Book.find({ "_id": firstBook._id, "pages.pageText": "" }).then((result) => {
    //   result.forEach((book) => {
    //     console.log("books info" + book);
    //   });
    // });



    // Book.find({}).then((result) => {
    //   result.forEach((book) => {
    //     console.log(book);
    //   });
    //   socket.emit("newBooks", result);
    // });
  });

  // send messages to database
  socket.on("sendMessage", function (data) {
    let textToSave = data.pageText.inputText;
    console.log(`logged message` + textToSave);

    Book.find({}).then((result) => {
      firstBook = result[0];
      console.log(firstBook._id);

      Book.find({ "_id": firstBook._id, "pages.pageText": "" }).then((result) => {
        let emptyPage = result[0];
        console.log(`empty page` + emptyPage);
      })

      // db.books.insertOne({ _id: 1, scores: [44, 78, 38, 80] });



      // const query = { "pages.pageText": "" };
      // const updateDocument = {
      //   $set: { "pages[firstBook.pages.length-1].pageText": textToSave }
      // };
      // const updateDb = await Book.updateOne(query, updateDocument);

      Book.updateOne(
        { "pages.pageText": "" },
        { $set: { "pages.$.pageText": textToSave } }
      )

      // create a new message entry in database
      const book = new Book({
        title: `another book`,
        complete: false,
        currentlyEditing: true,
        cover: {
          color: `red`,
          type: `big`
        },
        pages: [],
      });


      book.save().then((result) => {
        console.log("done");
      });
    })





    // // find all plant data
    // Plant.findOne({ _id: plant._id }).then((plantResult) => {
    //   // find user data
    //   User.findOne({ _id: plantResult.userId }).then((userResult) => {
    //     // create a new message entry in database
    //     const message = new Message({
    //       receiverId: userResult._id,
    //       receiverUsername: userResult.username,
    //       senderId: userDB.id,
    //       senderUsername: userDB.username,
    //       plantId: plantResult._id,
    //       readState: false,
    //       message: messageToSend.message,
    //     });

    //     // save to database
    //     message.save().then((result) => {});
    //   }); //user findOne
    // }); //plant findOne

  }); //socket on sendMessage


} //newConnection end




