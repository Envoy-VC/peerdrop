import { peerIdFromString } from '@libp2p/peer-id';
import {
  Ed25519Keypair,
  Ed25519PrivateKey,
  Ed25519PublicKey,
} from '@peerbit/crypto';
import { PeerProvider } from '@peerbit/react';
import React, { PropsWithChildren, useEffect } from 'react';
import { useLocalStorage } from 'usehooks-ts';

export const PeerbitProvider = ({ children }: PropsWithChildren) => {
  const [key, setKey] = useLocalStorage<{
    peerId: string;
    privateKey: string;
  } | null>('peerdrop-key', null);

  useEffect(() => {
    const init = async () => {
      if (!key) {
        const k = await Ed25519Keypair.create();
        const peerId = k.publicKey.toPeerId().toString();
        const privateKey = k.privateKey.toString();
        setKey({ peerId, privateKey });
      }
    };

    void init();
  });

  const constructKey = (peerId: string, pk: string) => {
    const publicKey = Ed25519PublicKey.fromPeerId(peerIdFromString(peerId));
    const privateKey = new Ed25519PrivateKey({
      privateKey: Uint8Array.from(Buffer.from(pk.slice(9), 'hex')),
    });
    const kp = new Ed25519Keypair({
      publicKey,
      privateKey,
    });

    return kp;
  };

  if (key)
    return (
      <PeerProvider
        inMemory={false}
        keypair={constructKey(key.peerId, key.privateKey)}
        iframe={{
          type: 'node',
          network: import.meta.env.MODE === 'development' ? 'local' : 'remote',
        }}
        top={{
          type: 'node',
          network: import.meta.env.MODE === 'development' ? 'local' : 'remote',
          host: true,
          waitForConnnected: true,
          keypair: constructKey(key.peerId, key.privateKey),
          inMemory: false,
        }}
      >
        <div>{children}</div>
      </PeerProvider>
    );
};
