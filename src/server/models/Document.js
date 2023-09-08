const mongoose = require("mongoose")
const Schema = mongoose.Schema;
const Document = new Schema({
  _id: String,
  data: Object,
});

const DocumentModel = mongoose.model("Document", Document);

module.exports = DocumentModel;
