const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class JsonCollection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    this._ensureFile();
  }

  _ensureFile() {
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]), 'utf8');
    }
  }

  _read() {
    try {
      this._ensureFile();
      const content = fs.readFileSync(this.filePath, 'utf8');
      return JSON.parse(content || '[]');
    } catch (err) {
      console.error(`[JSON Store] Error reading ${this.name}:`, err.message);
      return [];
    }
  }

  _write(data) {
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (err) {
      console.error(`[JSON Store] Error writing ${this.name}:`, err.message);
      throw err;
    }
  }

  _match(item, query = {}) {
    for (const key of Object.keys(query)) {
      const qVal = query[key];
      const iVal = item[key];

      if (key === '_id' || key === 'id') {
        const targetId = String(qVal);
        const actualId = String(item._id || item.id);
        if (targetId !== actualId) return false;
        continue;
      }

      if (qVal && typeof qVal === 'object' && !Array.isArray(qVal) && !(qVal instanceof RegExp)) {
        if (qVal.$in && Array.isArray(qVal.$in)) {
          const inList = qVal.$in.map(String);
          if (Array.isArray(iVal)) {
            const hasMatch = iVal.some(v => inList.includes(String(v)));
            if (!hasMatch) return false;
          } else {
            if (!inList.includes(String(iVal))) return false;
          }
          continue;
        }
        if (qVal.$nin && Array.isArray(qVal.$nin)) {
          const ninList = qVal.$nin.map(String);
          if (ninList.includes(String(iVal))) return false;
          continue;
        }
        if (qVal.$gte !== undefined && Number(iVal) < Number(qVal.$gte)) return false;
        if (qVal.$lte !== undefined && Number(iVal) > Number(qVal.$lte)) return false;
        if (qVal.$gt !== undefined && Number(iVal) <= Number(qVal.$gt)) return false;
        if (qVal.$lt !== undefined && Number(iVal) >= Number(qVal.$lt)) return false;
        if (qVal.$ne !== undefined && String(iVal) === String(qVal.$ne)) return false;
        if (qVal.$regex) {
          const reg = new RegExp(qVal.$regex, qVal.$options || 'i');
          if (!reg.test(String(iVal || ''))) return false;
          continue;
        }
        continue;
      }

      if (qVal instanceof RegExp) {
        if (!qVal.test(String(iVal || ''))) return false;
        continue;
      }

      if (Array.isArray(iVal)) {
        if (!iVal.some(v => String(v).toLowerCase() === String(qVal).toLowerCase())) return false;
      } else {
        if (String(iVal || '').toLowerCase() !== String(qVal).toLowerCase()) return false;
      }
    }
    return true;
  }

  async find(query = {}) {
    const all = this._read();
    let results = all.filter(item => this._match(item, query));
    return results.map(item => ({ ...item }));
  }

  async findOne(query = {}) {
    const all = this._read();
    const item = all.find(item => this._match(item, query));
    return item ? { ...item } : null;
  }

  async findById(id) {
    return this.findOne({ _id: id });
  }

  async create(data) {
    const all = this._read();
    const items = Array.isArray(data) ? data : [data];
    const created = [];

    for (const item of items) {
      const now = new Date().toISOString();
      const doc = {
        _id: item._id || crypto.randomBytes(12).toString('hex'),
        ...item,
        createdAt: item.createdAt || now,
        updatedAt: item.updatedAt || now
      };
      all.push(doc);
      created.push(doc);
    }

    this._write(all);
    return Array.isArray(data) ? created : created[0];
  }

  async insertMany(docs) {
    return this.create(docs);
  }

  async findByIdAndUpdate(id, update, options = { new: true }) {
    const all = this._read();
    const idx = all.findIndex(item => String(item._id) === String(id) || String(item.id) === String(id));
    if (idx === -1) return null;

    const current = all[idx];
    const updated = { ...current, ...update, updatedAt: new Date().toISOString() };
    all[idx] = updated;
    this._write(all);
    return options.new ? { ...updated } : { ...current };
  }

  async updateOne(query, update) {
    const all = this._read();
    const idx = all.findIndex(item => this._match(item, query));
    if (idx === -1) return { matchedCount: 0, modifiedCount: 0 };

    all[idx] = { ...all[idx], ...update, updatedAt: new Date().toISOString() };
    this._write(all);
    return { matchedCount: 1, modifiedCount: 1 };
  }

  async deleteOne(query) {
    const all = this._read();
    const idx = all.findIndex(item => this._match(item, query));
    if (idx === -1) return { deletedCount: 0 };

    all.splice(idx, 1);
    this._write(all);
    return { deletedCount: 1 };
  }

  async findByIdAndDelete(id) {
    const all = this._read();
    const idx = all.findIndex(item => String(item._id) === String(id) || String(item.id) === String(id));
    if (idx === -1) return null;

    const [removed] = all.splice(idx, 1);
    this._write(all);
    return removed;
  }

  async deleteMany(query = {}) {
    const all = this._read();
    const beforeCount = all.length;
    const remaining = all.filter(item => !this._match(item, query));
    this._write(remaining);
    return { deletedCount: beforeCount - remaining.length };
  }

  async countDocuments(query = {}) {
    const items = await this.find(query);
    return items.length;
  }

  async distinct(field, query = {}) {
    const items = await this.find(query);
    const set = new Set();
    for (const item of items) {
      if (Array.isArray(item[field])) {
        item[field].forEach(v => set.add(v));
      } else if (item[field] !== undefined) {
        set.add(item[field]);
      }
    }
    return Array.from(set);
  }
}

const collections = {};

function getCollection(name) {
  if (!collections[name]) {
    collections[name] = new JsonCollection(name);
  }
  return collections[name];
}

module.exports = {
  getCollection,
  JsonCollection
};
