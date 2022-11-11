/* eslint-disable */

import {
  Hotel, Rooms, Images, Reserve,
} from '../models';

async function main() {
  for (const Model of [
    Hotel, Rooms, Images, Reserve,
  ]) {
    await Model.sync({ alter: true });
  }
  process.exit(0);
}

main().catch(console.error);
/* eslint-enable */
