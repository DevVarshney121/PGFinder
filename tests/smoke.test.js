import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('public entry and admin entry exist', async()=>{assert.match(await readFile(new URL('../public/index.html',import.meta.url),'utf8'),/PGFinder/);assert.match(await readFile(new URL('../public/admin.html',import.meta.url),'utf8'),/admin-app/);});
test('schema keeps private fields in database and status constrained', async()=>{const s=await readFile(new URL('../database/schema.sql',import.meta.url),'utf8');assert.match(s,/exact_address/);assert.match(s,/owner_phone/);assert.match(s,/CHECK \(status IN/);});
test('public property API selects approved fields only', async()=>{const s=await readFile(new URL('../api/properties/index.js',import.meta.url),'utf8');assert.match(s,/public_area/);assert.doesNotMatch(s,/owner_phone/);assert.doesNotMatch(s,/exact_address/);});
