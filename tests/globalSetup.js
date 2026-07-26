import fs from 'node:fs';
import path from 'node:path';
import { MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { ensureIndexes } from './helpers/indexes.js';

const STATE_PATH = path.join(process.cwd(), 'tests', '.mongo-test-state.json');
const DB_NAME = 'thabit_test';

/** @type {import('mongodb-memory-server').MongoMemoryServer | undefined} */
let mongod;

export async function setup() {
  mongod = await MongoMemoryServer.create({
    binary: {
      // Pin a stable version; binary is cached after first download.
      version: '7.0.14',
    },
  });

  const uri = mongod.getUri();
  fs.writeFileSync(STATE_PATH, JSON.stringify({ uri, dbName: DB_NAME }));

  const client = new MongoClient(uri);
  await client.connect();
  await ensureIndexes(client.db(DB_NAME));
  await client.close();
}

export async function teardown() {
  if (mongod) {
    await mongod.stop();
    mongod = undefined;
  }
  if (fs.existsSync(STATE_PATH)) {
    fs.unlinkSync(STATE_PATH);
  }
}
