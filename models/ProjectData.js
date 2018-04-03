const mongoose = require('mongoose');

const projectDataSchema = new mongoose.Schema({
  ProjectID:String,
  documentID:String,
  documentType:String,
  collection:[{
    category: String,
    data: String
  }]
}, { timestamps: true });

const Project = mongoose.model('ProjectData', projectDataSchema);

module.exports = ProjectData;
