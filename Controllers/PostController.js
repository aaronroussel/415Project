const ObjectId = require("mongodb").ObjectId;

class Post {
  postContent;
  postTitle;
  postAuthor;
  subscribers = [];
  comments = [];

  constructor(postContent, postTitle, postAuthor) {
    this.postContent = postContent;
    this.postTitle = postTitle;
    this.postAuthor = postAuthor;
  }

  attach(subscriber) {
    this.subscribers.push(subscriber);
  }

  detach(subscriber) {
    this.subscribers = this.subscribers.filter((sub) => sub !== subscriber);
  }

  notify() {
    this.subscribers.forEach((subscriber) => {
      subscriber.update(this);
    });
  }

  updatePost(newContent) {
    this.postContent = newContent;
    console.log("Post updated");
    this.notify();
  }

  async createPost(client) {
    try {
      await client.connect();
      const collection = client.db("arousmdb").collection("Posts");
      const post = {
        postTitle: this.postTitle,
        postContent: this.postContent,
        postAuthor: new ObjectId(this.postAuthor),
        subscribers: this.subscribers.map((id) => new ObjectId(id)),
        comments: this.comments.map((id) => new ObjectId(id)),
      };

      const result = await collection.insertOne(post);
      console.log(`Post created with the following id: ${result.insertedId}`);
    } catch (error) {
      console.error("Error creating post:", error);
    } finally {
      await client.close();
    }
  }

  createComment(content, author) {
    commment = new PostComment(content, author);
    this.comments.push(comment);
  }
}

class Comment {
  commentContent;
  commentAuthor;

  constructor(commentContent, commentAuthor) {
    this.commentContent = commentContent;
    this.commentAuthor = commentAuthor;
  }

  async createComment(client) {
    try {
      await client.connect();
      const collection = client.db("arousmdb").collection("Comments");
      const comment = {
        commentContent,
        commentAuthor: new ObjectId(commentAuthorId),
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
}

module.exports = {
  Post,
  Comment,
};
