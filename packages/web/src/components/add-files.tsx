import { uploadFile } from '~/lib/helpers';
import { errorHandler } from '~/lib/utils';

import { usePeer } from '@peerbit/react';
import { Room } from '@peerdrop/schema';
import React, { useState } from 'react';
import { toast } from 'sonner';

import { FileUploader } from './ui/file-upload';

interface AddFilesProps {
  room?: Room;
}

export const AddFiles = ({ room }: AddFilesProps) => {
  const { peer } = usePeer();

  const [files, setFiles] = useState<File[]>([]);

  const onUpload = async (files: File[]) => {
    try {
      setFiles(files);

      if (!peer) {
        throw new Error('Peer not connected');
      }
      if (!room) {
        throw new Error('Not connected to room');
      }
      const allPromises = files.map((file) => uploadFile(file, room, peer));
      const res = await Promise.all(allPromises);
      if (res.length !== files.length) {
        toast.error('Unable to upload all files.');
      }
    } catch (error) {
      console.error(error);
      const message = errorHandler(error);
      toast.error(message);
    }
  };
  return (
    <div className='px-4'>
      <FileUploader
        accept={{}}
        className='mx-auto h-[40dvh] w-full max-w-screen-xl bg-neutral-100 text-[#3E83DD]'
        maxFileCount={Infinity}
        maxSize={Infinity}
        showPreview={false}
        value={files}
        onValueChange={onUpload}
      />
    </div>
  );
};
