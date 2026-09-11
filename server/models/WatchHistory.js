const mongoose = require('mongoose');
const { isMongoConnected } = require('../config/db');
const { getCollection } = require('../config/storage');

const watchHistorySchema = new mongoose.Schema({
  userId: { type: String, required: true },
  contentId: { type: String, required: true },
  contentTitle: { type: String, default: '' },
  contentPoster: { type: String, default: '' },
  contentType: { type: String, default: 'Movie' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completed: { type: Boolean, default: false },
  watchedDurationMinutes: { type: Number, default: 0 },
  watchedAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongoWatchHistoryModel = mongoose.models.WatchHistory || mongoose.model('WatchHistory', watchHistorySchema);

class WatchHistoryModel {
  static async find(query = {}) {
    if (isMongoConnected()) {
      return MongoWatchHistoryModel.find(query).lean();
    }
    return getCollection('watch_history').find(query);
  }

  static async findOne(query = {}) {
    if (isMongoConnected()) {
      return MongoWatchHistoryModel.findOne(query).lean();
    }
    return getCollection('watch_history').findOne(query);
  }

  static async findById(id) {
    if (isMongoConnected()) {
      return MongoWatchHistoryModel.findById(id).lean();
    }
    return getCollection('watch_history').findById(id);
  }

  static async create(data) {
    if (isMongoConnected()) {
      const doc = await MongoWatchHistoryModel.create(data);
      return doc.toObject();
    }
    return getCollection('watch_history').create(data);
  }

  static async findByIdAndUpdate(id, update, options = { new: true }) {
    if (isMongoConnected()) {
      return MongoWatchHistoryModel.findByIdAndUpdate(id, update, { ...options, lean: true });
    }
    return getCollection('watch_history').findByIdAndUpdate(id, update, options);
  }

  static async updateOne(query, update) {
    if (isMongoConnected()) {
      return MongoWatchHistoryModel.updateOne(query, update);
    }
    return getCollection('watch_history').updateOne(query, update);
  }

  static async findByIdAndDelete(id) {
    if (isMongoConnected()) {
      return MongoWatchHistoryModel.findByIdAndDelete(id).lean();
    }
    return getCollection('watch_history').findByIdAndDelete(id);
  }

  static async deleteOne(query) {
    if (isMongoConnected()) {
      return MongoWatchHistoryModel.deleteOne(query);
    }
    return getCollection('watch_history').deleteOne(query);
  }

  static async deleteMany(query = {}) {
    if (isMongoConnected()) {
      return MongoWatchHistoryModel.deleteMany(query);
    }
    return getCollection('watch_history').deleteMany(query);
  }

  static async countDocuments(query = {}) {
    if (isMongoConnected()) {
      return MongoWatchHistoryModel.countDocuments(query);
    }
    return getCollection('watch_history').countDocuments(query);
  }
}

module.exports = WatchHistoryModel;
