import * as Program from '@peerbit/program';
import { Room } from '@peerdrop/schema';

export const uploadFile = async (
  file: File,
  room: Room,
  peer: Program.ProgramClient,
  onProgress?: (progress: number) => void
) => {
  const data = new Uint8Array(await file.arrayBuffer());
  const returnId = await room.add(
    file.name,
    file.type,
    data,
    undefined,
    onProgress
  );
  const replicated = await room.files.log.waitForReplicator(
    peer.identity.publicKey
  );
  return { replicated, id: returnId };
};
