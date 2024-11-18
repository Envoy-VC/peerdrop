import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import { identify } from '@libp2p/identify';
import { webRTC } from '@libp2p/webrtc';
import { webSockets } from '@libp2p/websockets';
import * as filters from '@libp2p/websockets/filters';
import { Multiaddr } from '@multiformats/multiaddr';
import { Ed25519Keypair } from '@peerbit/crypto';
import { ProgramClient } from '@peerbit/program';
import { createClient, createHost } from '@peerbit/proxy-window';
import { DirectSub } from '@peerbit/pubsub';
import { detectIncognito } from 'detectincognitojs';
import sodium from 'libsodium-wrappers';
import { Peerbit } from 'peerbit';
import React, { useContext } from 'react';
import { v4 as uuid } from 'uuid';

import { FastMutex } from '../lock-storage';
import {
  cookiesWhereClearedJustNow,
  getFreeKeypair,
  getTabId,
  inIframe,
} from '../utils';
import { useMount } from './use-mount';

export type ConnectionStatus =
  | 'disconnected'
  | 'connected'
  | 'connecting'
  | 'failed';
interface IPeerContext {
  peer: ProgramClient | undefined;
  promise: Promise<void> | undefined;
  loading: boolean;
  status: ConnectionStatus;
  persisted: boolean | undefined;
}

if (!window.name) {
  window.name = uuid();
}

export const PeerContext = React.createContext<IPeerContext>({} as any);
export const usePeer = () => useContext(PeerContext);

type IFrameOptions = {
  type: 'proxy';
  targetOrigin: string;
};

type NodeOptions = {
  type?: 'node';
  network: 'local' | 'remote';
  waitForConnected?: boolean;
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

export const PeerProvider = (options: PeerOptions) => {
  const [peer, setPeer] = React.useState<ProgramClient | undefined>(undefined);
  const [promise, setPromise] = React.useState<Promise<void> | undefined>(
    undefined
  );

  const [persisted, setPersisted] = React.useState<boolean | undefined>(
    undefined
  );

  const [loading, setLoading] = React.useState<boolean>(true);
  const [connectionState, setConnectionState] =
    React.useState<ConnectionStatus>('disconnected');
  const memo = React.useMemo<IPeerContext>(
    () => ({
      peer,
      promise,
      loading,
      connectionState,
      status: connectionState,
      persisted: persisted,
    }),
    [
      loading,
      !!promise,
      connectionState,
      peer?.identity?.publicKey?.hashcode(),
      persisted,
    ]
  );
  useMount(() => {
    setLoading(true);
    const fn = async () => {
      await sodium.ready;
      if (peer) {
        await peer.stop();
        setPeer(undefined);
      }

      let newPeer: ProgramClient;
      const nodeOptions = (options as TopAndIframeOptions).top
        ? inIframe()
          ? (options as TopAndIframeOptions).iframe
          : (options as TopAndIframeOptions).top
        : (options as TopOptions);

      if (nodeOptions.type !== 'proxy') {
        const releaseFirstLock = cookiesWhereClearedJustNow();
        const nodeId =
          nodeOptions.keypair ??
          (
            await getFreeKeypair(
              '',
              new FastMutex({
                clientId: getTabId(),
                timeout: 1000,
              }),
              undefined,
              {
                releaseFirstLock,
                releaseLockIfSameId: true,
              }
            )
          ).key;
        const peerId = nodeId.toPeerId();

        let directory: string | undefined = undefined;
        if (
          !(nodeOptions as WithMemory).inMemory &&
          !(await detectIncognito()).isPrivate
        ) {
          const persisted = await navigator.storage.persist();
          setPersisted(persisted);
          if (!persisted) {
            setPersisted(false);
            if ('chrome' in window && window.chrome) {
              console.error(
                'Request persistence but was not given permission by browser. Adding this site to your bookmarks or enabling push notifications might allow your chrome browser to persist data'
              );
            } else {
              console.error(
                'Request persistence but was not given permission by browser.'
              );
            }
          } else {
            directory = `./repo/${peerId.toString()}/`;
          }
        }

        // We create a new directory to make tab to tab communication go smoothly
        newPeer = await Peerbit.create({
          libp2p: {
            peerId,
            addresses: {
              listen: ['/p2p-circuit', '/webrtc'],
            },
            connectionEncrypters: [noise()],
            connectionManager: {
              maxConnections: 100,
            },
            streamMuxers: [yamux()],
            ...(nodeOptions.network === 'local'
              ? {
                  connectionGater: {
                    denyDialMultiaddr: () => {
                      return false;
                    },
                  },
                  transports: [
                    webSockets({
                      filter: filters.all,
                    }),
                    circuitRelayTransport(),
                    webRTC(),
                  ],
                }
              : {
                  transports: [
                    webSockets({ filter: filters.wss }),
                    circuitRelayTransport(),
                    webRTC(),
                  ],
                }),

            services: {
              pubsub: (c) =>
                new DirectSub(c, {
                  canRelayMessage: true,
                }),
              // @ts-expect-error safe
              identify: identify(),
            },
          },
          directory,
        });

        setConnectionState('connecting');

        const connectFn = async () => {
          try {
            if (nodeOptions.network === 'local') {
              await newPeer.dial(
                '/ip4/127.0.0.1/tcp/8002/ws/p2p/' +
                  (await (await fetch('http://localhost:8082/peer/id')).text())
              );
            } else {
              if (nodeOptions.bootstrap) {
                for (const addr of nodeOptions.bootstrap) {
                  await newPeer.dial(addr);
                }
              } else {
                // @ts-expect-error -- safe to assume that the peer will have a bootstrap method
                await newPeer['bootstrap']?.();
              }
            }
            setConnectionState('connected');
          } catch (err: any) {
            console.error('Failed to resolve relay addresses. ' + err?.message);
            setConnectionState('failed');
          }

          if (nodeOptions.host) {
            newPeer = await createHost(newPeer);
          }
        };

        console.log('Bootstrap start...');
        const promise = connectFn();
        promise.then(() => {
          console.log('Bootstrap done');
        });

        if (nodeOptions.waitForConnected !== false) {
          await promise;
        }
      } else {
        newPeer = await createClient(nodeOptions.targetOrigin);
      }

      setPeer(newPeer);
      setLoading(false);
    };
    setPromise(fn());
  });

  return (
    <PeerContext.Provider value={memo}>{options.children}</PeerContext.Provider>
  );
};
