class Notification {
  notifiedUserId;
  message;

  constructor(notifiedUserId, message) {
    this.notifiedUserId = notifiedUserId;
    this.message = message;
  }

  async createNotification(client) {
    try {
      await client.connect();
      const collection = client.db("arousmdb").collection("Notifications");
      const result = await collection.insertOne({
        notifiedUserId: this.notifiedUserId,
        message: this.message,
      });
      console.log(
        "New notification created with the following id: " + result.insertedId,
      );
      return true;
    } catch (error) {
      console.log(error);
      return false;
    } finally {
      await client.close();
    }
  }
}
