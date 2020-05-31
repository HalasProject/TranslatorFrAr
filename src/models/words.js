require('dotenv').config()
const Dexie = require("dexie");

class DBI {
  
  constructor() {
    this.db = new Dexie(process.env.DB_NAME)
    this.db.version(process.env.DB_VERSION).stores({
      words: "++id,ar_name,ar_description,fr_name,fr_description",
    });

  }

  async size(){
    return await this.db.words.count()
  }
  
  async store(word) {
    return await this.db.words.add(word).catch(function (error) {
      console.log(error);
    });
  }

  async getOne(id) {
    return await this.db.words.get(id);
  }

  async getAll() {
    return await this.db.words.orderBy("fr_name").toArray();
  }

  async update(id, data) {
    return await this.db.words.update(id, data);
  }

  async delete(id) {
    return await this.db.words.delete(id);
  }
}

module.exports = DBI;
