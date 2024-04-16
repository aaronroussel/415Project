const ObjectId = require("mongodb").ObjectId;

class User {
  constructor(userData) {
    this.username = userData.username;
    this.password = userData.password;
    this.id = null;
  }
  async createAccount(client, newAccount) {
    // db logic here
  }

  async login(client) {
    const userData = {
      username: this.username,
    };
    try {
      await client.connect();
      const collection = client.db("arousmdb").collection("Accounts");
      const account = await collection.findOne(userData);
      if (account.password == this.password) {
        this.id = account._id;
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("Error fetching tools", error);
      return false;
    } finally {
      await client.close();
    }
  }

  async createAccount(client) {
    const newAccount = {
      username: this.username,
      password: this.password,
    };
    try {
      await client.connect();
      const collection = client.db("arousmdb").collection("Accounts");
      const result_accounts = await collection.findOne(newAccount);
      if (result_accounts == null) {
        const result = await collection.insertOne(newAccount);
        console.log(
          "New account created with the following id: " + result.insertedId,
        );
        return true;
      } else {
        console.log("Account already exists");
        return false;
      }
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      await client.close();
    }
  }

  static async fetchUser(client, userId) {
    try {
      await client.connect();
      const collection = client.db("arousmdb").collection("Accounts");
      const account = await collection.findOne({ _id: new ObjectId(userId) });
      if (account) {
        return account;
      } else {
        throw new Error("Acount not  found");
      }
    } catch (err) {
      console.error("Error fetching account", err);
      throw err;
    } finally {
      await client.close();
    }
  }

  async updateAccount(client, account) {}
}

module.exports = User;
