import { createFileRoute } from '@tanstack/react-router';
import { usePeer } from 'peerbit-react';
import * as React from 'react';
import { FileUpload, Hero } from '~/components';
import { LoadingScreen } from '~/screens/loading';

const HomeComponent = () => {
  const { loading, status } = usePeer();

  if (loading || status !== 'connected') return <LoadingScreen />;

  return (
    <div className='pb-12'>
      <Hero />
      <FileUpload />
    </div>
  );
};

export const Route = createFileRoute('/')({
  component: HomeComponent,
});
