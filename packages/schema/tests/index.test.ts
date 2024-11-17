import { randomBytes, sha256Base64Sync } from '@peerbit/crypto';
import { Peerbit } from 'peerbit';
import { compare } from 'uint8arrays';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { Room } from '../src';

describe('Room', () => {
  let peer1: Peerbit, peer2: Peerbit;
  beforeAll(async () => {
    peer1 = await Peerbit.create();
    peer2 = await Peerbit.create();
    await peer1.dial(peer2);
  });

  afterAll(async () => {
    await peer1.stop();
    await peer2.stop();
  });

  it('should be able to create room', async () => {
    const id = randomBytes(32);
    const room = await peer1.open(new Room({ id, name: 'Room 1' }));

    expect(compare(room.id, id));
  });

  it('should be able to store small files', async () => {
    const id = randomBytes(32);
    const file = new Uint8Array([1, 2, 3, 4, 5]);
    const fileId = sha256Base64Sync(file);
    const room = await peer1.open(new Room({ id, name: 'Room 1' }));

    const onProgress = (x: number) => {
      console.log(`Progress: ${x}`);
    };

    await room.add('main.txt', 'text/plain', file, undefined, onProgress);

    const room2 = await peer2.open<Room>(room.address, {
      args: { replicate: 1 },
    });

    await room2.files.log.waitForReplicator(peer1.identity.publicKey);

    const retrievedFile = await room2.getById(fileId);
    if (!retrievedFile) {
      throw new Error('File not found');
    }
    expect(compare(file, retrievedFile.bytes));
  });
});
