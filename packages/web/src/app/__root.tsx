import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import Background from 'public/topography.svg';
import * as React from 'react';
import { Navbar } from '~/components';
import { PeerbitProvider } from '~/providers';

import { Toaster } from '../components/ui/sonner';
import '../styles/globals.css';

const RootComponent = () => {
  return (
    <PeerbitProvider>
      <div className='relative h-screen bg-[#3E83DD]'>
        <div className='absolute h-full w-full'>
          <Navbar />
          <Outlet />
        </div>
        <img
          alt='Topography'
          className='h-full w-full object-cover'
          src={Background}
        />
      </div>
      {import.meta.env.MODE === 'development' && (
        <TanStackRouterDevtools position='bottom-right' />
      )}
      <Toaster />
    </PeerbitProvider>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
