var mongoose = require('mongoose')
var Schema = mongoose.Schema;

var ArticleSchema = new Schema ({
    titre : {
        type: String, 
        required: true,
    },
    description : {
        type: String,
        required: true,
    },
    prix: {
        type: Number,
        required: true
    },
    stock: {
        type: Number, 
        required: true,
    },
    image: {
        type: String,
    }
})

module.exports = mongoose.model('Article', ArticleSchema)