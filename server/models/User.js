const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { isMongoConnected } = require('../config/db');
const { getCollection } = require('../config/storage');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  avatar: { type: String, default: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150' },
  dob: { type: String, default: '' },
  favoriteGenres: { type: [String], default: [] },
  preferredLanguages: { type: [String], default: ['English'] },
  preferredContentTypes: { type: [String], default: ['Movie', 'TV Show'] },
  likedContent: { type: [String], default: [] },
  watchlist: { type: [String], default: [] },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const MongoUserModel = mongoose.models.User || mongoose.model('User', userSchema);

class UserModel {
  static async find(query = {}) {
    if (isMongoConnected()) {
      return MongoUserModel.find(query).lean();
    }
    return getCollection('users').find(query);
  }

  static async findOne(query = {}) {
    if (isMongoConnected()) {
      return MongoUserModel.findOne(query).lean();
    }
    return getCollection('users').findOne(query);
  }

  static async findById(id) {
    if (isMongoConnected()) {
      return MongoUserModel.findById(id).lean();
    }
    return getCollection('users').findById(id);
  }

  static async create(userData) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    const dataToSave = {
      ...userData,
      password: hashedPassword,
      avatar: userData.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      favoriteGenres: userData.favoriteGenres || [],
      preferredLanguages: userData.preferredLanguages || ['English'],
      preferredContentTypes: userData.preferredContentTypes || ['Movie', 'TV Show'],
      likedContent: userData.likedContent || [],
      watchlist: userData.watchlist || [],
      role: userData.role || 'user',
      status: userData.status || 'active'
    };

    if (isMongoConnected()) {
      const doc = await MongoUserModel.create(dataToSave);
      return doc.toObject();
    }
    return getCollection('users').create(dataToSave);
  }

  static async findByIdAndUpdate(id, update, options = { new: true }) {
    if (update.password && !update.password.startsWith('$2')) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
    }
    if (isMongoConnected()) {
      return MongoUserModel.findByIdAndUpdate(id, update, { ...options, lean: true });
    }
    return getCollection('users').findByIdAndUpdate(id, update, options);
  }

  static async findByIdAndDelete(id) {
    if (isMongoConnected()) {
      return MongoUserModel.findByIdAndDelete(id).lean();
    }
    return getCollection('users').findByIdAndDelete(id);
  }

  static async countDocuments(query = {}) {
    if (isMongoConnected()) {
      return MongoUserModel.countDocuments(query);
    }
    return getCollection('users').countDocuments(query);
  }

  static async deleteMany(query = {}) {
    if (isMongoConnected()) {
      return MongoUserModel.deleteMany(query);
    }
    return getCollection('users').deleteMany(query);
  }

  static async deleteOne(query = {}) {
    if (isMongoConnected()) {
      return MongoUserModel.deleteOne(query);
    }
    return getCollection('users').deleteOne(query);
  }

  static async comparePassword(plainPassword, hashedPassword) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = UserModel;
