import { PeerProvider, getFreeKeypair, releaseKey } from '@peerbit/react';
import React, { PropsWithChildren } from 'react';

const { path, key } = await getFreeKeypair('root');

window.onbeforeunload = function () {
  releaseKey(path);
};

export const PeerbitProvider = ({ children }: PropsWithChildren) => {
  const network = import.meta.env.MODE === 'development' ? 'local' : 'remote';
  console.log(path, key);
  return (
    <PeerProvider
      waitForConnnected
      iframe={{ targetOrigin: '*', type: 'proxy' }}
      inMemory={false}
      keypair={key}
      network={network}
      top={{
        type: 'node',
        network,
        host: true,
      }}
    >
      <div>{children}</div>
    </PeerProvider>
  );
};
