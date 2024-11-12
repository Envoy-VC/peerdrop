import { field, option, variant, vec } from '@dao-xyz/borsh';
import { Documents } from '@peerbit/document';
import { Program } from '@peerbit/program';
import { ReplicationOptions } from '@peerbit/shared-log';

import { Files } from './file.js';

type Args = { replicate?: ReplicationOptions };

@variant('room')
export class Room extends Program<Args> {
  @field({ type: Uint8Array })
  id: Uint8Array;

  @field({ type: Documents })
  files: Documents<Files>;

  constructor(properties: { id: Uint8Array }) {
    super();
    this.id = properties.id;
    this.files = new Documents<Files>({ id: this.id });
  }

  async open(args?: Args): Promise<void> {
    await this.files.open({
      type: Files,
      canPerform: () => {
        return Promise.resolve(true); // Anyone can add or delete files from this.
      },
      index: {
        idProperty: ['id', 'name'],
        type: Files,
        canRead: () => {
          return Promise.resolve(true); // Anyone can read for files in a room.
        },
        canSearch: async () => {
          return Promise.resolve(true); // Anyone can search files from this room.
        },
      },
      replicate: args?.replicate,
    });
  }
}
