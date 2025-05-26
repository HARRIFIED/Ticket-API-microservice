jest.setTimeout(300_000); // For first run when installing mongodb binaries by monodb-memory-server

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";
import path from "path";
import request from 'supertest'


declare global {
  var getCookie: () => Promise<string[]>;
}

let mongo: MongoMemoryServer;
beforeAll(async () => {
  process.env.JWT_KEY = "testkey";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
  
  mongo = await MongoMemoryServer.create({
    binary: {
      downloadDir: path.resolve(__dirname, "../.cache/mongo-binaries"),
      version: "4.4.6"
    }
  });
  await mongoose.connect(mongo.getUri());
  jest.setTimeout(30_000);
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

global.getCookie = async () => {
  const email = 'test@test.com';
  const password = 'password';

  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email, password
    })
    .expect(201)

  const cookie = response.get('Set-Cookie')
  if (!cookie) {
    throw new Error("Failed to get cookie from response");
  }
  return cookie;
}
