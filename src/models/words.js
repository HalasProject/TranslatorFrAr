const Dexie = require("dexie");
const { exportDB } = require("dexie-export-import");

class DBI {
  constructor() {
    this.db = new Dexie("dictionaire");
    this.db.version(1).stores({
      words: "++id,ar_name,ar_description,fr_name,fr_description",
    });
  }

  async size() {
    return await this.db.words.count();
  }

  async store(word) {
    return await this.db.words.add(word);
  }

  async getOne(id) {
    return await this.db.words.get(id);
  }

  async getAll() {
    return await this.db.words.orderBy("fr_name").toArray();
  }

  async update(id, data) {
    this.savefile();
    return await this.db.words.update(id, data);
  }

  async delete(id) {
    return await this.db.words.delete(id);
  }

  async exportDB() {
    try {
      return await this.db.export({
        prettyJson: true,
      });
    } catch (error) {
      return error;
    }
  }
}

module.exports = DBI;
