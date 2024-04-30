const ObjectId = require("mongodb").ObjectId;
const Notification = require("./NotificationController");

class Post {
  postId;
  postContent;
  postTitle;
  postAuthor;
  subscribers = [];
  comments = [];

  constructor(newPostData) {
    //constructor(postContent, postTitle, postAuthor) {
    this.postContent = newPostData.postContent;
    this.postTitle = newPostData.postTitle;
    this.postAuthor = newPostData.postAuthor;
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
      return result.insertedId;
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

  static async fetchPosts(client) {
    try {
      await client.connect();
      const collection = client.db("arousmdb").collection("Posts");
      const posts = await collection.find({}).toArray();
      return posts;
    } catch (error) {
      console.error("Error fetching posts", error);
    }
  }

  static async fetchPost(client, postId) {
    try {
      await client.connect();
      const collection = client.db("arousmdb").collection("Posts");
      const post = await collection.findOne({ _id: new ObjectId(postId) });
      return post;
    } catch (error) {
      console.error("Error fetching post", error);
    }
  }

  static async fetchSubscribedPosts(client, userId) {
    try {
      await client.connect();
      const collection = client.db("arousmdb").collection("Posts");

      // Use userId as a string directly if subscribers array contains strings
      const query = { subscribers: new ObjectId(userId) };

      const posts = await collection.find(query).toArray();
      console.log(posts); // This should now output the matching posts
      return posts;
    } catch (error) {
      console.error("Error fetching subscribed posts", error);
    }
  }

  static async notifySubscribers(client, postId) {
    try {
      await client.connect();
      const collection = client.db("arousmdb").collection("Posts");
      const post = await collection.findOne({ _id: new ObjectId(postId) });
      const message = `New comment on post: ${post.postTitle}`;
      post.subscribers.forEach((subscriber) => {
        console.log(`Notifying ${subscriber} about new post`);
        let notification = new Notification(subscriber, message);
        notification.createNotification(client);
      });
    } catch (error) {
      console.error("Error notifying subscribers", error);
    }
  }

  static async subscribe(client, userId, postId) {
    console.log("userid: ", userId);
    console.log("postid: ", postId);
    try {
      await client.connect();
      const collection = client.db("arousmdb").collection("Posts");
      const result = await collection.updateOne(
        { _id: new ObjectId(postId) },
        { $addToSet: { subscribers: new ObjectId(userId) } }, // Using $addToSet to avoid duplicates
      );

      if (result.matchedCount === 0) {
        console.log("No post found with that ID");
      } else if (result.modifiedCount === 0) {
        console.log("User already subscribed");
      } else {
        console.log("Subscription successful");
      }
    } catch (error) {
      console.error("Error subscribing to post", error);
    } finally {
      client.close();
    }
  }

  static async unsubscribe(client, userId, postId) {
    console.log("unsubsribing to post");
    try {
      await client.connect();
      const collection = client.db("arousmdb").collection("Posts");
      const result = await collection.updateOne(
        { _id: new ObjectId(postId) },
        { $pull: { subscribers: new ObjectId(userId) } },
      );

      if (result.matchedCount === 0) {
        console.log("No post found with that ID");
      } else if (result.modifiedCount === 0) {
        console.log("User not subscribed");
      } else {
        console.log("Unsubscription successful");
      }
    } catch (error) {
      console.error("Error unsubscribing from post", error);
    } finally {
      client.close();
    }
  }
}

module.exports = Post;
