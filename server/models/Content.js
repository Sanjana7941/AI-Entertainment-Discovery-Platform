const mongoose = require('mongoose');
const { isMongoConnected } = require('../config/db');
const { getCollection } = require('../config/storage');

const contentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: {
    type: String,
    enum: ['Movie', 'TV Show', 'Web Series', 'Anime', 'Music'],
    required: true
  },
  genres: { type: [String], default: [] },
  language: { type: String, default: 'English' },
  releaseYear: { type: Number, required: true },
  runtime: { type: String, default: '120 min' },
  rating: { type: Number, default: 8.0 },
  ratingCount: { type: Number, default: 1 },
  poster: { type: String, required: true },
  backdrop: { type: String, default: '' },
  trailer: { type: String, default: '' },
  cast: { type: [String], default: [] },
  director: { type: String, default: '' },
  creator: { type: String, default: '' },
  popularity: { type: Number, default: 75 },
  tags: { type: [String], default: [] },
  moodTags: { type: [String], default: [] },
  tracks: { type: [mongoose.Schema.Types.Mixed], default: [] },
  episodes: { type: [mongoose.Schema.Types.Mixed], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongoContentModel = mongoose.models.Content || mongoose.model('Content', contentSchema);

class ContentModel {
  static async find(query = {}) {
    if (isMongoConnected()) {
      return MongoContentModel.find(query).lean();
    }
    return getCollection('content').find(query);
  }

  static async findOne(query = {}) {
    if (isMongoConnected()) {
      return MongoContentModel.findOne(query).lean();
    }
    return getCollection('content').findOne(query);
  }

  static async findById(id) {
    if (isMongoConnected()) {
      return MongoContentModel.findById(id).lean();
    }
    return getCollection('content').findById(id);
  }

  static async create(data) {
    if (isMongoConnected()) {
      const doc = await MongoContentModel.create(data);
      return Array.isArray(doc) ? doc.map(d => d.toObject()) : doc.toObject();
    }
    return getCollection('content').create(data);
  }

  static async insertMany(data) {
    if (isMongoConnected()) {
      const docs = await MongoContentModel.insertMany(data);
      return docs.map(d => d.toObject());
    }
    return getCollection('content').insertMany(data);
  }

  static async findByIdAndUpdate(id, update, options = { new: true }) {
    if (isMongoConnected()) {
      return MongoContentModel.findByIdAndUpdate(id, update, { ...options, lean: true });
    }
    return getCollection('content').findByIdAndUpdate(id, update, options);
  }

  static async findByIdAndDelete(id) {
    if (isMongoConnected()) {
      return MongoContentModel.findByIdAndDelete(id).lean();
    }
    return getCollection('content').findByIdAndDelete(id);
  }

  static async countDocuments(query = {}) {
    if (isMongoConnected()) {
      return MongoContentModel.countDocuments(query);
    }
    return getCollection('content').countDocuments(query);
  }

  static async distinct(field, query = {}) {
    if (isMongoConnected()) {
      return MongoContentModel.distinct(field, query);
    }
    return getCollection('content').distinct(field, query);
  }

  static async deleteMany(query = {}) {
    if (isMongoConnected()) {
      return MongoContentModel.deleteMany(query);
    }
    return getCollection('content').deleteMany(query);
  }
}

module.exports = ContentModel;
