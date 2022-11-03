const mongoose = require("mongoose");

// Define a schema (DB structure)
let Schema = mongoose.Schema;

// Models are so-called constructor functions that create new JavaScript objects based on the provided parameters. Since the objects are created with the model's constructor function, they have all the properties of the model, which include methods for saving the object to the database.

let bookSchema = new Schema({
    title: String,
    complete: Boolean,
    currentlyEditing: Boolean,
    cover: {
        color: String,
        type: String
    },
    pages: [],
});

// Create a model
// Compile model from schema (model we need to use)
let Book = mongoose.model("books", bookSchema);

module.exports = Book;
