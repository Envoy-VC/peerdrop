import { LandPlotIcon } from 'lucide-react';
import React from 'react';
import { Ripple } from '~/components/ui/ripple';

export const LoadingScreen = () => {
  return (
    <div className='relative flex h-screen items-center justify-center bg-[#3E83DD]'>
      <div className='absolute right-1/2 top-1/2 flex h-28 w-28 -translate-y-1/2 translate-x-1/2 items-center justify-center rounded-full bg-neutral-200'>
        <LandPlotIcon className='h-12 w-12 text-[#3E83DD]' />
      </div>
      <Ripple
        className='text-white'
        mainCircleOpacity={0.6}
        mainCircleSize={200}
        numCircles={10}
      />
    </div>
  );
};
