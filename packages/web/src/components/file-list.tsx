import { cn, formatBytes } from '~/lib/utils';

import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import { File, X } from 'lucide-react';
import React from 'react';

import { Button } from './ui/button';
import { ScrollArea } from './ui/scroll-area';

interface FileListProps
  extends React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root> {
  files?: File[];
}

export const FileList = ({ files, className, ...props }: FileListProps) => {
  return (
    <>
      {files?.length ? (
        <ScrollArea
          className={cn(
            'h-32 w-full rounded-3xl bg-neutral-100 p-3 px-3',
            className
          )}
          {...props}
        >
          <div className='flex max-h-48 flex-col gap-4'>
            {files.map((file, index) => (
              <FileCard
                // eslint-disable-next-line react/no-array-index-key -- safe
                key={index}
                file={file}
              />
            ))}
          </div>
        </ScrollArea>
      ) : null}
    </>
  );
};

interface FileCardProps {
  file: File;
}

const FileCard = ({ file }: FileCardProps) => {
  const onDownload = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = file.name;
    link.click();

    // clean
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    document.body.removeChild(link);
  };

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
        <Button
          className='size-7'
          size='icon'
          type='button'
          variant='outline'
          onClick={onDownload}
        >
          <X aria-hidden='true' className='size-4' />
          <span className='sr-only'>Download file</span>
        </Button>
      </div>
    </div>
  );
};

function isFileWithPreview(file: File): file is File & { preview: string } {
  return 'preview' in file && typeof file.preview === 'string';
}

interface FilePreviewProps {
  file: File & { preview: string };
}

const FilePreview = ({ file }: FilePreviewProps) => {
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

  return <File aria-hidden='true' className='size-10 text-muted-foreground' />;
};
