import { MaybePromise } from '@peerbit/crypto';
import { ReplicationOptions } from '@peerbit/shared-log';

export type Args = object;

export type WithReplication<T extends Args> = T & {
  replicate?: ReplicationOptions;
};

export interface IFile {
  id: string;
  type: string;
  name: string;
  bytes: Uint8Array;
}

export interface CreateTinyFileOpts {
  id?: string;
  name: string;
  type: string;
  file: Uint8Array;
  parentId?: string;
}

export interface CreateLargeFileOpts {
  id: string;
  name: string;
  type: string;
  fileIds: string[];
  size: number;
}

export interface CreateRoomProps {
  id: Uint8Array;
  name: string;
}

export type ProgressCallback = (progress: number) => MaybePromise<void>;
