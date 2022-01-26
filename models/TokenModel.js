var mongoose = require('mongoose')

var Schema = mongoose.Schema

var TokenSchema = new Schema({
  address: { type: String, required: true },
})

module.exports = mongoose.model('Token', TokenSchema)
