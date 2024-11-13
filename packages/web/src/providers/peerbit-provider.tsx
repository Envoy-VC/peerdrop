import { PeerProvider } from '@peerbit/react';
import React, { PropsWithChildren } from 'react';

export const PeerbitProvider = ({ children }: PropsWithChildren) => {
  return (
    <PeerProvider
      iframe={{ type: 'proxy', targetOrigin: '*' }}
      top={{
        type: 'node',
        network: import.meta.env.MODE === 'development' ? 'local' : 'remote',
        host: true,
        waitForConnnected: true,
      }}
    >
      <div>{children}</div>
    </PeerProvider>
  );
};
