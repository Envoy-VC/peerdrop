import { PeerProvider, getFreeKeypair, releaseKey } from 'peerbit-react';
import React, { PropsWithChildren } from 'react';

const { path, key } = await getFreeKeypair('root');

window.onbeforeunload = function () {
  releaseKey(path);
};

export const PeerbitProvider = ({ children }: PropsWithChildren) => {
  const network = import.meta.env.MODE === 'development' ? 'local' : 'remote';
  return (
    <PeerProvider
      waitForConnected
      network={network}
      top={{
        network,
        keypair: key,
      }}
    >
      <div>{children}</div>
    </PeerProvider>
  );
};
