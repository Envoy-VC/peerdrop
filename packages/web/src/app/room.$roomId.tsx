import { useProgram } from '@peerbit/react';
import { Room } from '@peerdrop/schema';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { RefreshCcwIcon } from 'lucide-react';
import { useEffect } from 'react';
import { AddFiles } from '~/components';
import { FileList } from '~/components/file-list';

const RoomPage = () => {
  const { roomId } = Route.useParams();

  const { program: room } = useProgram(
    new Room({
      id: Uint8Array.from(Buffer.from(roomId)),
      name: roomId.trim(),
    }),
    {
      args: { replicate: true },
    }
  );

  const { data: files, refetch } = useQuery({
    queryKey: ['files', roomId],
    queryFn: async () => {
      if (!room) return [];
      const files = await room.list();
      return files;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    initialData: [],
  });

  const refetchFiles = () => {
    console.log('Refetching files');
    refetch().catch((err: unknown) => console.log(err));
  };

  useEffect(() => {
    room?.files.events.addEventListener('change', () => {
      console.log('Room change');
      refetchFiles();
    });
    room?.files.events.addEventListener('open', () => {
      console.log('Room opened');
      refetchFiles();
    });

    return () => {
      room?.files.events.removeEventListener('change');
      room?.files.events.removeEventListener('open');
    };
  });

  return (
    <div className='mx-auto my-24 flex w-full max-w-screen-xl flex-col gap-3 overflow-auto px-4'>
      <div className='flex w-full flex-row items-center justify-between gap-3 px-4'>
        <div className='text-xl font-medium text-neutral-100 md:text-3xl'>
          Room ID: {roomId}
        </div>
        <button
          className='m-0 flex h-12 flex-row items-center gap-2 p-0 text-base text-white md:text-xl'
          type='button'
          onClick={() => refetchFiles()}
        >
          <RefreshCcwIcon
            className='text-xl text-white md:text-3xl'
            size={24}
          />
          Refresh
        </button>
      </div>
      <div className='py-12'>
        <AddFiles room={room} />
      </div>
      <FileList
        className='rounded-3xl bg-neutral-100'
        files={files}
        room={room}
      />
    </div>
  );
};
export const Route = createFileRoute('/room/$roomId')({
  component: RoomPage,
});
