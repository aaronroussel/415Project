const formidable = require("express-formidable");
const { MongoClient } = require("mongodb");
const uri =
  "mongodb+srv://aaronroussel:class123@cluster0.c3oy0fh.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(uri);
const express = require("express");

class DBconnection {
  static client = null;
  static getInstance() {
    if (this.client == null) {
      this.client = new DBconnection();
    }
    return this.client;
  }
  constructor() {
    this.client = new MongoClient(uri);
  }
  static async insertListing(client, newListing) {
    console.log("POST data: ", newListing);
    try {
      await client.connect();
      const result = await client
        .db("arousmdb")
        .collection("Tools")
        .insertOne(newListing);
      console.log(
        "New listing created with the following id: ${result.insertedId}",
      );
    } finally {
      await client.close();
    }
  }
  static async createAccount(client, newAccount) {
    console.log("POST data: ", newAccount);
    let wasCreated = false;
    const query = { username: newAccount.username };
    try {
      await client.connect();
      const result_accounts = await client
        .db("arousmdb")
        .collection("Accounts")
        .findOne(query);
      if (result_accounts == null) {
        const result = await client
          .db("arousmdb")
          .collection("Accounts")
          .insertOne(newAccount);
        console.log(
          "New account created with the following id: " + result.insertedId,
        );
        wasCreated = true;
      } else {
        console.log("Account already exists");
      }
    } catch (error) {
      console.log(error);
    } finally {
      await client.close();
    }
    return wasCreated;
  }
}

module.exports = DBconnection;
