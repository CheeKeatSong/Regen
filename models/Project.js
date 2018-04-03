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

const projectSchema = new mongoose.Schema({
  name: String,
  description: String,
  document: [documentSchema],
  access: [{
    name: String,
    emailAddress:String,
    permission: String
  }]
}, { timestamps: true, usePushEach: true });

const Project = mongoose.model('Project', projectSchema);

module.exports = Project;
