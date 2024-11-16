const mongoose = require('mongoose');

const metaModelSchema = new mongoose.Schema({
  data: Object,
  createdAt: { type: Date, default: Date.now }
});

const MetaModel = mongoose.model('metamodels', metaModelSchema);

module.exports = MetaModel;