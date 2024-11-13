import { sha256Base64Sync } from '@peerbit/crypto';
import { SearchRequest } from '@peerbit/document';
import { usePeer, useProgram } from '@peerbit/react';
import { AbstractFile, Room } from '@peerdrop/schema';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

const RoomPage = () => {
  const { roomId } = Route.useParams();
  const { peer } = usePeer();
  const { program } = useProgram(
    new Room({
      id: Uint8Array.from(Buffer.from(roomId)),
    })
  );

  const onChange = () => {
    if (!program) return;
    void program.files.files.index
      .search(new SearchRequest({}), {
        local: true,
        remote: {
          timeout: 10 * 1000,
        },
      })
      .then((files) => setFiles(files));
  };

  program?.files.files.events.addEventListener('change', onChange);

  const [files, setFiles] = useState<AbstractFile[]>([]);
  const [file, setFile] = useState<File>();

  return (
    <div className='flex flex-col gap-3'>
      <div>Room {roomId}</div>
      <div>Peer: {peer?.peerId.toString() ?? ''}</div>
      <div>Program Address: {String(program?.address)}</div>
      <input
        placeholder='Upload File'
        type='file'
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setFile(file);
        }}
      />

      <button
        className='w-fit'
        type='button'
        onClick={async () => {
          if (!program) return;
          if (!file) return;
          const toUpload = new Uint8Array(await file.arrayBuffer());
          const id = sha256Base64Sync(toUpload);
          const res = await program.files.add(
            id,
            file.name,
            toUpload,
            file.type
          );
          console.log('File Added: ', res);
          const event = new CustomEvent('addFile');
          program.files.emitEvent(event, true);
        }}
      >
        Add File
      </button>
      <button
        className='w-fit'
        type='button'
        onClick={async () => {
          if (!program) return;
          const results = await program.files.files.index.search(
            new SearchRequest({
              query: [],
              fetch: 0xffffffff,
            }),
            {
              local: true,
              remote: {
                timeout: 10 * 1000,
              },
            }
          );
          setFiles(results);
        }}
      >
        Search Files
      </button>
      <div className='flex flex-col gap-2'>
        {files.map((file) => {
          return (
            <div key={file.id} className='flex flex-row items-center gap-2'>
              {file.name}
              <button
                className='w-fit'
                type='button'
                onClick={async () => {
                  if (!program) return;
                  const array = await file.getFile(program.files);
                  const name = file.name;
                  const type = file.type;

                  const blob = new Blob([array], { type });
                  const url = URL.createObjectURL(blob);

                  const a = document.createElement('a');
                  a.href = url;
                  a.download = name;

                  document.body.appendChild(a);
                  a.click();

                  // Clean
                  setTimeout(() => URL.revokeObjectURL(url), 1000);
                  document.body.removeChild(a);
                }}
              >
                Download
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
export const Route = createFileRoute('/room/$roomId')({
  component: RoomPage,
});
