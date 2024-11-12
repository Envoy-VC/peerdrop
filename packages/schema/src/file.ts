import { field, option, variant } from '@dao-xyz/borsh';
import {
  MaybePromise,
  PublicSignKey,
  randomBytes,
  sha256Base64Sync,
} from '@peerbit/crypto';
import { sha256Sync } from '@peerbit/crypto';
import {
  Documents,
  SearchRequest,
  StringMatch,
  StringMatchMethod,
} from '@peerbit/document';
import { Program } from '@peerbit/program';
import { ReplicationOptions } from '@peerbit/shared-log';
import { TrustedNetwork } from '@peerbit/trusted-network';
import { concat } from 'uint8arrays';

type ProgressCallback = (progress: number) => MaybePromise<void>;

export abstract class AbstractFile {
  abstract id: string;
  abstract name: string;
  abstract size: number;
  abstract type: string;

  abstract getFile(
    files: Files,
    onProgress?: ProgressCallback
  ): Promise<Uint8Array>;
  abstract delete(files: Files): Promise<void>;
}

class IndexableFile {
  @field({ type: 'string' })
  id: string;

  @field({ type: 'string' })
  name: string;

  @field({ type: 'u32' })
  size: number;

  @field({ type: 'string' })
  type: string;

  constructor(file: AbstractFile) {
    this.id = file.id;
    this.name = file.name;
    this.size = file.size;
    this.type = file.type;
  }
}

interface CreateFileProps {
  id: string;
  name: string;
  file: Uint8Array;
  type: string;
}

@variant(0)
export class File extends AbstractFile {
  @field({ type: 'string' })
  id: string;

  @field({ type: 'string' })
  name: string;

  @field({ type: Uint8Array })
  file: Uint8Array; // 10 mb imit

  @field({ type: 'string' })
  type: string;

  get size() {
    return this.file.byteLength;
  }

  constructor(properties: CreateFileProps) {
    super();
    this.id = properties.id || sha256Base64Sync(properties.file);
    this.name = properties.name;
    this.file = properties.file;
    this.type = properties.type;
  }

  async getFile(
    _files: Files,
    onProgress: ProgressCallback
  ): Promise<Uint8Array> {
    if (sha256Base64Sync(this.file) !== this.id) {
      throw new Error('Hash does not match the file content');
    }
    onProgress?.(1);
    return Promise.resolve(this.file);
  }

  async delete(): Promise<void> {
    // do nothing
  }
}

type Args = { replicate: ReplicationOptions };

interface CreateFilesProps {
  id: Uint8Array;
  name: string;
  rootKey?: PublicSignKey;
}

@variant('files')
export class Files extends Program<Args> {
  @field({ type: Uint8Array })
  id: Uint8Array;

  @field({ type: 'string' })
  name: string;

  @field({ type: option(TrustedNetwork) })
  trustGraph?: TrustedNetwork;

  @field({ type: Documents })
  files: Documents<AbstractFile, IndexableFile>;

  constructor(properties?: CreateFilesProps) {
    super();
    this.id = properties?.id || randomBytes(32);
    this.name = properties?.name || '';
    this.trustGraph = properties?.rootKey
      ? new TrustedNetwork({ id: this.id, rootTrust: properties.rootKey })
      : undefined;
    this.files = new Documents({
      id: sha256Sync(
        concat([
          this.id,
          new TextEncoder().encode(this.name),
          properties?.rootKey?.bytes || new Uint8Array(0),
        ])
      ),
    });
  }

  async add(
    id: string,
    name: string,
    file: Uint8Array,
    type: string,
    progress?: ProgressCallback
  ) {
    progress?.(0);
    const toPut = new File({ id, name, file, type });
    await this.files.put(toPut);
    progress?.(1);
    return toPut.id;
  }

  async removeById(id: string) {
    const file = await this.files.index.get(id);
    if (file) {
      await file.delete(this);
      await this.files.del(file.id);
    }
  }

  async removeByName(name: string) {
    const files = await this.files.index.search(
      new SearchRequest({
        query: new StringMatch({
          key: ['name'],
          value: name,
          caseInsensitive: false,
          method: StringMatchMethod.exact,
        }),
        fetch: 0xffffffff,
      })
    );
    for (const file of files) {
      await file.delete(this);
      await this.files.del(file.id);
    }
  }

  async getById(id: string, onProgress?: ProgressCallback) {
    const results = await this.files.index.search(
      new SearchRequest({
        query: [new StringMatch({ key: 'id', value: id })],
        fetch: 0xffffffff,
      }),
      {
        local: true,
        remote: {
          timeout: 10 * 1000,
        },
      }
    );

    for (const result of results) {
      const file = await result.getFile(this, onProgress);
      if (file) {
        return {
          id: result.id,
          name: result.name,
          bytes: file,
        };
      }
    }
  }

  async getByName(name: string, onProgress?: ProgressCallback) {
    const results = await this.files.index.search(
      new SearchRequest({
        query: [new StringMatch({ key: 'name', value: name })],
        fetch: 0xffffffff,
      }),
      {
        local: true,
        remote: {
          timeout: 10 * 1000,
        },
      }
    );

    for (const result of results) {
      const file = await result.getFile(this, onProgress);
      if (file) {
        return {
          id: result.id,
          name: result.name,
          bytes: file,
        };
      }
    }
  }

  async open(args?: Args): Promise<void> {
    await this.trustGraph?.open({
      replicate: args?.replicate,
    });

    await this.files.open({
      type: AbstractFile,
      replicate: args?.replicate,
      replicas: { min: 3 },
      canPerform: async (operation) => {
        if (!this.trustGraph) {
          return true;
        }
        for (const key of await operation.entry.getPublicKeys()) {
          if (await this.trustGraph.isTrusted(key)) {
            return true;
          }
        }
        return false;
      },
      index: {
        type: IndexableFile,
      },
    });
  }
}
