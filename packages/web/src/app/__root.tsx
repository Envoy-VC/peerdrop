import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import * as React from 'react';
import { PeerbitProvider } from '~/providers';

const RootComponent = () => {
  return (
    <PeerbitProvider>
      <Outlet />
      {import.meta.env.MODE === 'development' && (
        <TanStackRouterDevtools position='bottom-right' />
      )}
    </PeerbitProvider>
  );
};

export const Route = createRootRoute({
  component: RootComponent,
});
