import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import Background from 'public/topography.svg';
import * as React from 'react';
import { Navbar } from '~/components';
import { PeerbitProvider, QueryProvider } from '~/providers';

import { Toaster } from '../components/ui/sonner';
import '../styles/globals.css';

const RootComponent = () => {
  return (
    <QueryProvider>
      <PeerbitProvider>
        <div className='relative flex h-screen w-full bg-[#3E83DD]'>
          <div className='hide-scrollbar absolute h-full w-full overflow-y-auto'>
            <Navbar />
            <Outlet />
          </div>
          <img
            alt='Topography'
            className='h-screen w-full object-cover'
            src={Background}
          />
          <Toaster />
        </div>
        {import.meta.env.MODE === 'development' && (
          <TanStackRouterDevtools position='bottom-right' />
        )}
      </PeerbitProvider>
    </QueryProvider>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
