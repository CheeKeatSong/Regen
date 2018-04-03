const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  name: String,
  type: {type:String},
  description: String,
  content:[{
  	numbering: Number,
  	title: String,
    data: String
  }]
}, { timestamps: true });

const Document = mongoose.model('Document', documentSchema);

module.exports = Document;
