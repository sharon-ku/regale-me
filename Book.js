const mongoose = require("mongoose");

// Define a schema (DB structure)
let Schema = mongoose.Schema;

// Models are so-called constructor functions that create new JavaScript objects based on the provided parameters. Since the objects are created with the model's constructor function, they have all the properties of the model, which include methods for saving the object to the database.

let bookSchema = new Schema({
    title: String,
    x: Number,
    y: Number,
    active: Boolean,
});

// Create a model
// Compile model from schema (model we need to use)
let Book = mongoose.model("Book", bookSchema);

module.exports = Book;
