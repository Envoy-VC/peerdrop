import { field, variant } from '@dao-xyz/borsh';
import { sha256Sync } from '@peerbit/crypto';
import {
  Documents,
  IsNull,
  SearchRequest,
  StringMatch,
} from '@peerbit/document';
import { Program } from '@peerbit/program';
import { concat } from 'uint8arrays';

import { TINY_FILE_SIZE_LIMIT } from './constants';
import { AbstractFile, IndexableFile, LargeFile, TinyFile } from './file';
import {
  Args,
  CreateRoomProps,
  IFile,
  ProgressCallback,
  WithReplication,
} from './types';

@variant('room')
export class Room extends Program<WithReplication<Args>> {
  @field({ type: Uint8Array })
  id: Uint8Array;

  @field({ type: 'string' })
  name: string;

  @field({ type: Documents })
  files: Documents<AbstractFile, IndexableFile>;

  constructor(opts: CreateRoomProps) {
    super();
    this.id = opts.id;
    this.name = opts.name;

    this.files = new Documents({
      id: sha256Sync(concat([this.id])),
    });
  }

  async add(
    name: string,
    type: string,
    file: Uint8Array,
    parentId?: string,
    onProgress?: ProgressCallback
  ) {
    let toPut: AbstractFile;
    onProgress?.(0);
    if (file.byteLength <= TINY_FILE_SIZE_LIMIT) {
      toPut = new TinyFile({ name, file, parentId, type });
    } else {
      if (parentId) {
        throw new Error('Unexpected that a LargeFile to have a parent');
      }
      toPut = await LargeFile.create(name, type, file, this, onProgress);
    }
    await this.files.put(toPut);
    onProgress?.(1);
    return toPut.id;
  }

  async list() {
    // only root files (don't fetch fetch chunks here)
    const files = await this.files.index.search(
      new SearchRequest({
        query: new IsNull({ key: 'parentId' }),
        fetch: 0xffffffff,
      }),
      {
        local: true,
        remote: {
          throwOnMissing: true,
          replicate: true,
          eager: true,
        },
      }
    );
    return files;
  }

  async getById(
    id: string,
    onProgress?: ProgressCallback
  ): Promise<IFile | undefined> {
    const results = await this.files.index.search(
      new SearchRequest({
        query: [new StringMatch({ key: 'id', value: id })],
        fetch: 0xffffffff,
      }),
      {
        local: true,
        remote: {
          timeout: 10 * 1000,
          throwOnMissing: true,
          replicate: true,
          eager: true,
        },
      }
    );

    for (const result of results) {
      const file = await result.getFile(this, onProgress);
      if (file) {
        return {
          id: result.id,
          type: result.type,
          name: result.name,
          bytes: file,
        };
      }
    }
  }

  async open(args?: WithReplication<Args>): Promise<void> {
    await this.files.open({
      type: AbstractFile,
      replicate: args?.replicate,
      replicas: { min: 3 },
      canPerform: () => true,
      index: {
        type: IndexableFile,
      },
    });
  }
}
