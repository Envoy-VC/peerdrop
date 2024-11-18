import { jsx as _jsx } from "react/jsx-runtime";
import React, { useContext } from 'react';
import { Peerbit } from 'peerbit';
import { DirectSub } from '@peerbit/pubsub';
import { yamux } from '@chainsafe/libp2p-yamux';
import { getFreeKeypair, getTabId, inIframe, cookiesWhereClearedJustNow, } from './utils.js';
import { noise } from '@chainsafe/libp2p-noise';
import { v4 as uuid } from 'uuid';
import { FastMutex } from './lockstorage.js';
import sodium from 'libsodium-wrappers';
import { useMount } from './useMount.js';
import { createClient, createHost } from '@peerbit/proxy-window';
import { identify } from '@libp2p/identify';
import { webSockets } from '@libp2p/websockets';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import * as filters from '@libp2p/websockets/filters';
import { detectIncognito } from 'detectincognitojs';
if (!window.name) {
    window.name = uuid();
}
export const PeerContext = React.createContext({});
export const usePeer = () => useContext(PeerContext);
export const PeerProvider = (options) => {
    const [peer, setPeer] = React.useState(undefined);
    const [promise, setPromise] = React.useState(undefined);
    const [persisted, setPersisted] = React.useState(undefined);
    const [loading, setLoading] = React.useState(true);
    const [connectionState, setConnectionState] = React.useState('disconnected');
    const memo = React.useMemo(() => ({
        peer,
        promise,
        loading,
        connectionState,
        status: connectionState,
        persisted: persisted,
    }), [
        loading,
        !!promise,
        connectionState,
        peer?.identity?.publicKey?.hashcode(),
        persisted,
    ]);
    useMount(() => {
        setLoading(true);
        const fn = async () => {
            await sodium.ready;
            if (peer) {
                await peer.stop();
                setPeer(undefined);
            }
            let newPeer;
            const nodeOptions = options.top
                ? inIframe()
                    ? options.iframe
                    : options.top
                : options;
            if (nodeOptions.type !== 'proxy') {
                const releaseFirstLock = cookiesWhereClearedJustNow();
                const nodeId = nodeOptions.keypair ||
                    (await getFreeKeypair('', new FastMutex({
                        clientId: getTabId(),
                        timeout: 1000,
                    }), undefined, {
                        releaseFirstLock, // when clearing cookies sometimes the localStorage is not cleared immediately so we need to release the lock forcefully. TODO investigate why this is happening
                        releaseLockIfSameId: true, // reuse keypairs from same tab, (force release)
                    })).key;
                const peerId = nodeId.toPeerId();
                let directory = undefined;
                if (!nodeOptions.inMemory &&
                    !(await detectIncognito()).isPrivate) {
                    const persisted = await navigator.storage.persist();
                    setPersisted(persisted);
                    if (!persisted) {
                        setPersisted(false);
                        if (window['chrome']) {
                            console.error('Request persistence but was not given permission by browser. Adding this site to your bookmarks or enabling push notifications might allow your chrome browser to persist data');
                        }
                        else {
                            console.error('Request persistence but was not given permission by browser.');
                        }
                    }
                    else {
                        directory = `./repo/${peerId.toString()}/`;
                    }
                }
                // We create a new directory to make tab to tab communication go smoothly
                console.log('Create client');
                newPeer = await Peerbit.create({
                    libp2p: {
                        addresses: {
                            listen: ['/p2p-circuit', '/webrtc'],
                        },
                        connectionEncrypters: [noise()],
                        peerId,
                        connectionManager: {
                            maxConnections: 100,
                        },
                        streamMuxers: [yamux()],
                        ...(nodeOptions.network === 'local'
                            ? {
                                connectionGater: {
                                    denyDialMultiaddr: () => {
                                        // by default we refuse to dial local addresses from the browser since they
                                        // are usually sent by remote peers broadcasting undialable multiaddrs but
                                        // here we are explicitly connecting to a local node so do not deny dialing
                                        // any discovered address
                                        return false;
                                    },
                                },
                                transports: [
                                    // Add websocket impl so we can connect to "unsafe" ws (production only allows wss)
                                    webSockets({
                                        filter: filters.all,
                                    }),
                                    circuitRelayTransport(),
                                    /*    webRTC(), */ // TMP disable because flaky behaviour with libp2p 1.8.1
                                ],
                            }
                            : {
                                transports: [
                                    webSockets({ filter: filters.wss }),
                                    circuitRelayTransport(),
                                    /*   webRTC(), */ // TMP disable because flaky behaviour with libp2p 1.8.1
                                ],
                            }),
                        services: {
                            pubsub: (c) => new DirectSub(c, {
                                canRelayMessage: true,
                                /*      connectionManager: {
                                        autoDial: false,
                                    }, */
                            }),
                            identify: identify(),
                        },
                    },
                    directory,
                });
                console.log('Client created', {
                    directory,
                    peerHash: newPeer?.identity.publicKey.hashcode(),
                });
                setConnectionState('connecting');
                // Resolve bootstrap nodes async (we want to return before this is done)
                const connectFn = async () => {
                    try {
                        if (nodeOptions.network === 'local') {
                            await newPeer.dial('/ip4/127.0.0.1/tcp/8002/ws/p2p/' +
                                (await (await fetch('http://localhost:8082/peer/id')).text()));
                        }
                        else {
                            // TODO fix types. When proxy client this will not be available
                            if (nodeOptions.bootstrap) {
                                for (const addr of nodeOptions.bootstrap) {
                                    await newPeer.dial(addr);
                                }
                            }
                            else {
                                await newPeer['bootstrap']?.();
                            }
                        }
                        setConnectionState('connected');
                    }
                    catch (err) {
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
                // Make sure data flow as expected between tabs and windows locally (offline states)
                if (nodeOptions.waitForConnnected !== false) {
                    await promise;
                }
            }
            else {
                newPeer = await createClient(nodeOptions.targetOrigin);
            }
            setPeer(newPeer);
            setLoading(false);
        };
        setPromise(fn());
    });
    return (_jsx(PeerContext.Provider, { value: memo, children: options.children }));
};
//# sourceMappingURL=usePeer.js.map