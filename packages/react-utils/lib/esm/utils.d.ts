import { Ed25519Keypair } from "@peerbit/crypto";
import { FastMutex } from "./lockstorage";
export declare const cookiesWhereClearedJustNow: () => boolean;
export declare const getTabId: () => any;
export declare const releaseKey: (path: string, lock?: FastMutex) => void;
export declare const getFreeKeypair: (id?: string, lock?: FastMutex, lockCondition?: () => boolean, options?: {
    releaseLockIfSameId?: boolean;
    releaseFirstLock?: boolean;
}) => Promise<{
    path: string;
    key: Ed25519Keypair;
}>;
export declare const getAllKeyPairs: (id?: string) => Promise<Ed25519Keypair[]>;
export declare const getKeypair: (keyName: string) => Promise<Ed25519Keypair>;
export declare const inIframe: () => boolean;
