import React from 'react';
import { Multiaddr } from '@multiformats/multiaddr';
import { Ed25519Keypair } from '@peerbit/crypto';
import { ProgramClient } from '@peerbit/program';
export type ConnectionStatus = 'disconnected' | 'connected' | 'connecting' | 'failed';
interface IPeerContext {
    peer: ProgramClient | undefined;
    promise: Promise<void> | undefined;
    loading: boolean;
    status: ConnectionStatus;
    persisted: boolean | undefined;
}
export declare const PeerContext: React.Context<IPeerContext>;
export declare const usePeer: () => IPeerContext;
type IFrameOptions = {
    type: 'proxy';
    targetOrigin: string;
};
type NodeOptions = {
    type?: 'node';
    network: 'local' | 'remote';
    waitForConnnected?: boolean;
    keypair?: Ed25519Keypair;
    bootstrap?: (Multiaddr | string)[];
    host?: boolean;
};
type TopOptions = NodeOptions & WithMemory;
type TopAndIframeOptions = {
    iframe: IFrameOptions | NodeOptions;
    top: TopOptions;
};
type WithMemory = {
    inMemory?: boolean;
};
type WithChildren = {
    children: JSX.Element;
};
type PeerOptions = (TopAndIframeOptions | TopOptions) & WithChildren;
export declare const PeerProvider: (options: PeerOptions) => import("react/jsx-runtime").JSX.Element;
export {};
