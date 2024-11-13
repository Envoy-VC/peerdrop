import { usePeer } from '@peerbit/react';
import { Room } from '@peerdrop/schema';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import * as React from 'react';

const HomeComponent = () => {
  const { peer, loading, status } = usePeer();
  const navigate = useNavigate();

  return (
    <div className='p-2'>
      <pre>{JSON.stringify({ loading, status }, null, 2)}</pre>
      <button
        type='button'
        onClick={() => {
          console.log(peer);
        }}
      >
        Log Peer
      </button>
      <button
        type='button'
        onClick={async () => {
          const roomId = crypto.randomUUID();
          const id = Uint8Array.from(Buffer.from(roomId));
          if (!peer) return;
          const room = await peer.open(new Room({ id }));
          console.log('Created room', room);
          await navigate({
            to: '/room/$roomId',
            params: { roomId },
          });
        }}
      >
        Create Room
      </button>
    </div>
  );
};

export const Route = createFileRoute('/')({
  component: HomeComponent,
});
