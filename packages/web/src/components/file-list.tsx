import { cn, formatBytes } from '~/lib/utils';

import { AbstractFile, Room } from '@peerdrop/schema';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { useQuery } from '@tanstack/react-query';
import { File as FileIcon } from 'lucide-react';
import React from 'react';

import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface FileListProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  files: AbstractFile[];
  room?: Room;
}

export const FileList = ({
  files,
  room,
  className,
  ...props
}: FileListProps) => {
  if (room)
    return (
      <>
        {files.length ? (
          <ScrollArea className={cn('w-full', className)} {...props}>
            <div className='flex flex-col gap-4 px-5 py-4'>
              <div className='text-3xl font-medium text-[#3E83DD]'>Files</div>
              {files.map((file, index) => (
                <FileCard
                  // eslint-disable-next-line react/no-array-index-key -- safe
                  key={index}
                  file={file}
                  room={room}
                />
              ))}
            </div>
          </ScrollArea>
        ) : null}
      </>
    );
};

interface FileCardProps {
  file: AbstractFile;
  room: Room;
}

const FileCard = ({ file: abstractFile, room }: FileCardProps) => {
  const { data: file } = useQuery({
    queryKey: ['file', abstractFile.id],
    queryFn: async () => {
      const arr = await abstractFile.getFile(room.files);

      const name = abstractFile.name;
      const type = abstractFile.type;

      const blob = new Blob([arr], { type });
      const file = new File([blob], name, { type });
      if (type.startsWith('image/')) {
        // @ts-expect-error -- preview is not a standard property
        file.preview = URL.createObjectURL(file);
      }
      return file;
    },
  });

  const onDownload = () => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();

    // Clean
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    document.body.removeChild(a);
  };

  if (file)
    return (
      <div className='relative flex items-center gap-2.5 border-b-2 pb-2 last:border-b-0'>
        <div className='flex flex-1 gap-2.5'>
          {isFileWithPreview(file) ? <FilePreview file={file} /> : null}
          <div className='flex w-full flex-col gap-2'>
            <div className='flex flex-col gap-px'>
              <p className='text-foreground/80 line-clamp-1 text-sm font-medium'>
                {file.name}
              </p>
              <p className='text-xs text-muted-foreground'>
                {formatBytes(file.size)}
              </p>
            </div>
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <Button type='button' variant='outline' onClick={onDownload}>
            Download file
          </Button>
        </div>
      </div>
    );
};

export function isFileWithPreview(
  file: File
): file is File & { preview: string } {
  return 'preview' in file && typeof file.preview === 'string';
}

interface FilePreviewProps {
  file: File & { preview: string };
}

export const FilePreview = ({ file }: FilePreviewProps) => {
  if (file.type.startsWith('image/')) {
    return (
      <img
        alt={file.name}
        className='aspect-square shrink-0 object-cover'
        height={64}
        loading='lazy'
        src={file.preview}
        width={64}
      />
    );
  }

  return (
    <FileIcon aria-hidden='true' className='size-10 text-muted-foreground' />
  );
};
