const ObjectId = require("mongodb").ObjectId;

class Comment {
  commentContent;
  commentAuthor;
  postId;

  constructor(commentContent, commentAuthor) {
    this.commentContent = commentContent;
    this.commentAuthor = commentAuthor;
  }

  static async createComment(client, userId, postId, commentContent) {
    try {
      await client.connect();
      const collection = client.db("arousmdb").collection("Comments");
      const comment = {
        commentContent: commentContent,
        commentAuthor: new ObjectId(userId),
        postId: new ObjectId(postId),
      };

      const result = await collection.insertOne(comment);
      console.log(
        `Comment created with the following id: ${result.insertedId}`,
      );
    } catch (error) {
      console.error("Error creating comment:", error);
    } finally {
      await client.close();
    }
  }

  static async getComments(client, postId) {
    try {
      await client.connect();
      const collection = client.db("arousmdb").collection("Comments");
      const comments = await collection
        .find({ postId: new ObjectId(postId) })
        .toArray();
      return comments;
    } catch (error) {
      console.error("Error fetching comments", error);
    } finally {
      await client.close();
    }
  }
}

module.exports = Comment;
