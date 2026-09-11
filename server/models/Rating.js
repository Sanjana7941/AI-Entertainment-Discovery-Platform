const mongoose = require('mongoose');
const { isMongoConnected } = require('../config/db');
const { getCollection } = require('../config/storage');

const ratingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  userName: { type: String, default: 'User' },
  userAvatar: { type: String, default: '' },
  contentId: { type: String, required: true },
  contentTitle: { type: String, default: '' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: '' },
  likes: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongoRatingModel = mongoose.models.Rating || mongoose.model('Rating', ratingSchema);

class RatingModel {
  static async find(query = {}) {
    if (isMongoConnected()) {
      return MongoRatingModel.find(query).lean();
    }
    return getCollection('ratings').find(query);
  }

  static async findOne(query = {}) {
    if (isMongoConnected()) {
      return MongoRatingModel.findOne(query).lean();
    }
    return getCollection('ratings').findOne(query);
  }

  static async findById(id) {
    if (isMongoConnected()) {
      return MongoRatingModel.findById(id).lean();
    }
    return getCollection('ratings').findById(id);
  }

  static async create(data) {
    if (isMongoConnected()) {
      const doc = await MongoRatingModel.create(data);
      return doc.toObject();
    }
    return getCollection('ratings').create(data);
  }

  static async findByIdAndUpdate(id, update, options = { new: true }) {
    if (isMongoConnected()) {
      return MongoRatingModel.findByIdAndUpdate(id, update, { ...options, lean: true });
    }
    return getCollection('ratings').findByIdAndUpdate(id, update, options);
  }

  static async updateOne(query, update) {
    if (isMongoConnected()) {
      return MongoRatingModel.updateOne(query, update);
    }
    return getCollection('ratings').updateOne(query, update);
  }

  static async findByIdAndDelete(id) {
    if (isMongoConnected()) {
      return MongoRatingModel.findByIdAndDelete(id).lean();
    }
    return getCollection('ratings').findByIdAndDelete(id);
  }

  static async deleteMany(query = {}) {
    if (isMongoConnected()) {
      return MongoRatingModel.deleteMany(query);
    }
    return getCollection('ratings').deleteMany(query);
  }

  static async countDocuments(query = {}) {
    if (isMongoConnected()) {
      return MongoRatingModel.countDocuments(query);
    }
    return getCollection('ratings').countDocuments(query);
  }
}

module.exports = RatingModel;
