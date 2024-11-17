import { field, option, variant, vec } from '@dao-xyz/borsh';
import { sha256Base64Sync } from '@peerbit/crypto';
import { Or, SearchRequest, StringMatch } from '@peerbit/document';
import PQueue from 'p-queue';
import { concat } from 'uint8arrays';

import { TINY_FILE_SIZE_LIMIT } from './constants';
import { Room } from './room';
import {
  CreateLargeFileOpts,
  CreateTinyFileOpts,
  ProgressCallback,
} from './types';

export abstract class AbstractFile {
  abstract id: string;
  abstract name: string;
  abstract type: string;
  abstract size: number;
  abstract parentId?: string;
  abstract getFile(
    room: Room,
    onProgress?: ProgressCallback
  ): Promise<Uint8Array>;
}

export class IndexableFile {
  @field({ type: 'string' })
  id: string;

  @field({ type: 'string' })
  name: string;

  @field({ type: 'string' })
  type: string;

  @field({ type: 'u32' })
  size: number;

  @field({ type: option('string') })
  parentId?: string;

  constructor(file: AbstractFile) {
    this.id = file.id;
    this.name = file.name;
    this.type = file.type;
    this.size = file.size;
    this.parentId = file.parentId;
  }
}

@variant(0)
export class TinyFile extends AbstractFile {
  @field({ type: 'string' })
  id: string;

  @field({ type: 'string' })
  name: string;

  @field({ type: 'string' })
  type: string;

  @field({ type: Uint8Array })
  file: Uint8Array; // 2 mb limit

  @field({ type: option('string') })
  parentId?: string;

  get size() {
    return this.file.byteLength;
  }

  constructor(opts: CreateTinyFileOpts) {
    super();
    this.id = opts.id ?? sha256Base64Sync(opts.file);
    this.name = opts.name;
    this.type = opts.type;
    this.file = opts.file;
    this.parentId = opts.parentId;
  }

  async getFile(_room: Room, onProgress: ProgressCallback) {
    if (sha256Base64Sync(this.file) !== this.id) {
      throw new Error('Hash does not match the file content');
    }
    onProgress?.(1);
    return Promise.resolve(this.file);
  }
}

@variant(1)
export class LargeFile extends AbstractFile {
  @field({ type: 'string' })
  id: string;

  @field({ type: 'string' })
  name: string;

  @field({ type: 'string' })
  type: string;

  @field({ type: vec('string') })
  fileIds: string[];

  @field({ type: 'u32' })
  size: number;

  constructor(opts: CreateLargeFileOpts) {
    super();
    this.id = opts.id;
    this.name = opts.name;
    this.type = opts.type;
    this.fileIds = opts.fileIds;
    this.size = opts.size;
  }

  static async create(
    name: string,
    type: string,
    file: Uint8Array,
    room: Room,
    progress?: (progress: number) => void
  ) {
    const segmentSize = TINY_FILE_SIZE_LIMIT / 10; // 10% of the small size limit
    const fileIds: string[] = [];
    const id = sha256Base64Sync(file);
    const fileSize = file.byteLength;
    progress?.(0);
    const end = Math.ceil(file.byteLength / segmentSize);
    for (let i = 0; i < end; i++) {
      progress?.((i + 1) / end);
      fileIds.push(
        await room.add(
          name + '/' + i,
          type,
          file.subarray(
            i * segmentSize,
            Math.min((i + 1) * segmentSize, file.byteLength)
          ),
          id
        )
      );
    }
    progress?.(1);
    return new LargeFile({
      id,
      name,
      fileIds: fileIds,
      size: fileSize,
      type,
    });
  }

  get parentId() {
    return undefined;
  }

  async fetchChunks(room: Room) {
    const expectedIds = new Set(this.fileIds);
    const allFiles = await room.files.index.search(
      new SearchRequest({
        query: [
          new Or(
            [...expectedIds].map(
              (x) => new StringMatch({ key: 'id', value: x })
            )
          ),
        ],
        fetch: 0xffffffff,
      })
    );
    return allFiles;
  }

  async getFile(room: Room, onProgress: ProgressCallback): Promise<Uint8Array> {
    onProgress?.(0);

    console.log('LISTS CHUNKS!');
    const allChunks = await this.fetchChunks(room);
    console.log('RECEIVED CHUNKS: ' + allChunks);
    console.log('FETCH CHUNKS');

    const fetchQueue = new PQueue({ concurrency: 10 });
    let fetchError: Error | undefined = undefined;

    const chunks: Map<string, Uint8Array | undefined> = new Map();
    const expectedIds = new Set(this.fileIds);
    if (allChunks.length > 0) {
      let c = 0;
      for (const r of allChunks) {
        if (chunks.has(r.id)) {
          // chunk already added;
        }
        if (!expectedIds.has(r.id)) {
          // chunk is not part of this file
        }
        fetchQueue
          .add(async () => {
            let lastError: Error | undefined = undefined;
            for (let i = 0; i < 3; i++) {
              try {
                const chunk = await r.getFile(room);
                if (!chunk) {
                  throw new Error('Failed to fetch chunk');
                }
                chunks.set(r.id, chunk);
                c++;
                onProgress?.(c / allChunks.length);
                return;
              } catch (error: any) {
                // try 3 times

                lastError = error;
              }
            }
            throw lastError;
          })
          .catch(() => {
            fetchQueue.clear(); // Dont do anything more since we failed to fetch one block
          });
      }
    }
    await fetchQueue.onIdle();

    if (fetchError || chunks.size !== expectedIds.size) {
      throw new Error(
        `Failed to resolve file. Received ${chunks.size}/${expectedIds.size} chunks`
      );
    }

    const chunkContentResolved: Uint8Array[] = await Promise.all(
      this.fileIds.map(async (x) => {
        const chunkValue = await chunks.get(x);
        if (!chunkValue) {
          throw new Error('Failed to retrieve chunk with id: ' + x);
        }
        return chunkValue;
      })
    );
    console.log('FETCH DONE');
    return concat(chunkContentResolved);
  }
}
