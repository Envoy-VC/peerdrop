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

  @field({ type: Files })
  files: Files;

  constructor(properties: { id: Uint8Array }) {
    super();
    this.id = properties.id;
    this.files = new Files({id: properties.id, name: 'files'});
  }

  async open(args?: Args): Promise<void> {
    await this.files.open(args);
  }
}
