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

  createPost() {
    console.log("Post created");
    this.notify();
  }

  updatePost(newContent) {
    this.postContent = newContent;
    console.log("Post updated");
    this.notify();
  }

  async createPost(client) {
    const db = client.db(dbName);
    const collection = db.collection("posts");

    try {
      const post = {
        postTitle,
        postContent,
        postAuthor: new ObjectId(postAuthorId),
        subscribers: subscriberIds.map((id) => new ObjectId(id)),
        comments: commentIds.map((id) => new ObjectId(id)),
      };

      const result = await collection.insertOne(post);
      console.log(`Post created with the following id: ${result.insertedId}`);
    } catch (error) {
      console.error("Error creating post:", error);
    }
  }

  createComment(content, author) {
    commment = new PostComment(content, author);
    this.comments.push(comment);
  }
}

class PostComment {
  commentContent;
  commentAuthor;

  constructor(commentContent, commentAuthor) {
    this.commentContent = commentContent;
    this.commentAuthor = commentAuthor;
  }

  createComment() {
    console.log("Comment created");
  }
}
