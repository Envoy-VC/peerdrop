import { usePeer } from 'peerbit-react';
import React from 'react';

export const Hero = () => {
  const { peer } = usePeer();
  return (
    <div className='mx-auto flex h-[30dvh] w-fit flex-col items-center justify-center gap-4 text-neutral-100'>
      {peer?.peerId.toString()}
      <div className='w-fit text-3xl font-semibold md:text-5xl lg:text-6xl xl:text-7xl'>
        Peer to Peer File transfer
      </div>
      <div className='w-fit text-3xl text-neutral-200 md:text-4xl'>
        Simple, Fast, decentralized.
      </div>
    </div>
  );
};
