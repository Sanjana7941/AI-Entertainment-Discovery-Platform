const mongoose = require('mongoose');
const { isMongoConnected } = require('../config/db');
const { getCollection } = require('../config/storage');

const searchHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  query: { type: String, required: true },
  searchedAt: { type: Date, default: Date.now }
});

const MongoSearchHistoryModel = mongoose.models.SearchHistory || mongoose.model('SearchHistory', searchHistorySchema);

class SearchHistoryModel {
  static async find(query = {}) {
    if (isMongoConnected()) {
      return MongoSearchHistoryModel.find(query).lean();
    }
    return getCollection('search_history').find(query);
  }

  static async create(data) {
    if (isMongoConnected()) {
      const doc = await MongoSearchHistoryModel.create(data);
      return doc.toObject();
    }
    return getCollection('search_history').create(data);
  }

  static async deleteOne(query) {
    if (isMongoConnected()) {
      return MongoSearchHistoryModel.deleteOne(query);
    }
    return getCollection('search_history').deleteOne(query);
  }

  static async deleteMany(query = {}) {
    if (isMongoConnected()) {
      return MongoSearchHistoryModel.deleteMany(query);
    }
    return getCollection('search_history').deleteMany(query);
  }
}

module.exports = SearchHistoryModel;
