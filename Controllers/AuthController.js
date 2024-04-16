class Auth {
  static async cookieAuth(cookie, client) {
    if (cookie.id) {
      try {
        await client.connect();
        const collection = client.db("arousmdb").collection("Accounts");
        const account = await collection.find({ _id: cookie.id });
        if (account) {
          return true;
        }
      } catch (error) {
        console.error("Error fetching account", error);
        return false;
      } finally {
        await client.close();
      }
    } else {
      return false;
    }
  }
}

module.exports = Auth;
