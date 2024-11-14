import { SearchRequest } from '@peerbit/document';
import { useProgram } from '@peerbit/react';
import { AbstractFile, Room } from '@peerdrop/schema';
import { createFileRoute } from '@tanstack/react-router';
import { RefreshCcwIcon } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { AddFiles } from '~/components';
import { FileList } from '~/components/file-list';

const RoomPage = () => {
  const { roomId } = Route.useParams();

  const { program: room, loading } = useProgram(
    new Room({
      id: Uint8Array.from(Buffer.from(roomId)),
    }),
    {
      args: { replicate: true },
      existing: 'replace',
    }
  );

  const onChange = useCallback(async () => {
    if (!room) return;
    await room.files.files.index
      .search(new SearchRequest({}), {
        local: true,
        remote: {
          timeout: 10 * 1000,
        },
      })
      .then((files) => {
        setFiles(files);
      });
  }, [room]);

  useEffect(() => {
    if (!loading && room) {
      void onChange();
    }
  }, [loading, onChange, room]);

  room?.files.files.events.addEventListener('change', () => void onChange());

  const [files, setFiles] = useState<AbstractFile[]>([]);

  return (
    <div className='mx-auto my-24 flex w-full max-w-screen-xl flex-col gap-3 overflow-auto px-4'>
      <div className='flex w-full flex-row items-center justify-between gap-3 px-4'>
        <div className='text-xl font-medium text-neutral-100 md:text-3xl'>
          Room ID: {roomId}
        </div>
        <button
          className='m-0 flex h-12 flex-row items-center gap-2 p-0 text-base text-white md:text-xl'
          type='button'
          onClick={onChange}
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
