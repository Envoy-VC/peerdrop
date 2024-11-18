import { uploadFile } from '~/lib/helpers';
import { errorHandler } from '~/lib/utils';

import { Room } from '@peerdrop/schema';
import { useNavigate } from '@tanstack/react-router';
import { usePeer } from 'peerbit-react';
import React, { useState } from 'react';
import ShortUniqueId from 'short-unique-id';
import { toast } from 'sonner';

import { FileUploader } from './ui/file-upload';

export const FileUpload = () => {
  const { peer } = usePeer();
  const navigate = useNavigate();

  const [files, setFiles] = useState<File[]>([]);

  const onUpload = async (files: File[]) => {
    const toastId = toast.loading('Creating Room');
    try {
      setFiles(files);
      const generator = new ShortUniqueId({ length: 6 });
      const roomId = generator.rnd().toUpperCase();
      const id = Uint8Array.from(Buffer.from(roomId));
      if (!peer) {
        throw new Error('Peer not connected');
      }
      const room = await peer.open(new Room({ id, name: roomId }));
      toast.loading('Uploading Files', { id: toastId });
      const allPromises = files.map((file) => uploadFile(file, room, peer));
      const res = await Promise.all(allPromises);
      toast.success('Files uploaded successfully', { id: toastId });
      if (res.length !== files.length) {
        toast.error('Unable to upload all files.');
      }
      await navigate({
        to: '/room/$roomId',
        params: { roomId },
      });
    } catch (error) {
      console.error(error);
      const message = errorHandler(error);
      toast.error(message, { id: toastId });
    }
  };
  return (
    <div className='mx-auto w-full max-w-screen-xl px-3'>
      <FileUploader
        accept={{}}
        className='mx-auto h-[40dvh] bg-neutral-100 text-[#3E83DD]'
        maxFileCount={Infinity}
        maxSize={Infinity}
        value={files}
        onValueChange={onUpload}
      />
    </div>
  );
};
