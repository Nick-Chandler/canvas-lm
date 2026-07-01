import { getDb } from "../lib/db";
import data from "../misc/sample-packaged-data.json";

const start = performance.now();

const db = getDb();

const userId = "user_3FK1OxoRNhmsAQ9vBaNWN1da9Di"
const row = await db.userWorkspace.create({
  data: { user_id: userId, data: data },
});

console.log(row);
console.log(`Took ${(performance.now() - start).toFixed(1)}ms`);
