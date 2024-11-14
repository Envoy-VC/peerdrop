import { sha256Base64Sync } from '@peerbit/crypto';
import * as Program from '@peerbit/program';
import { Room } from '@peerdrop/schema';

export const uploadFile = async (
  file: File,
  room: Room,
  peer: Program.ProgramClient
) => {
  const data = new Uint8Array(await file.arrayBuffer());
  const id = sha256Base64Sync(data);
  const returnId = await room.files.add(id, file.name, data, file.type);
  const replicated = await room.files.files.log.waitForReplicator(
    peer.identity.publicKey
  );
  return { replicated, id: returnId };
};
