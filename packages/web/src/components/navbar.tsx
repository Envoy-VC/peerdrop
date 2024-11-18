import { LandPlotIcon } from 'lucide-react';
import React from 'react';

import JoinRoomDialog from './create-dialog';

export const Navbar = () => {
  return (
    <div className='mx-auto flex h-[8dvh] max-w-screen-xl items-center justify-between px-4 pt-12'>
      <div className='flex flex-row gap-2 text-xl font-medium text-neutral-100 md:text-3xl'>
        <LandPlotIcon className='text-2xl md:text-4xl' />
        Peerdrop
      </div>
      <div className='flex flex-row items-center gap-2'>
        <JoinRoomDialog />
      </div>
    </div>
  );
};
