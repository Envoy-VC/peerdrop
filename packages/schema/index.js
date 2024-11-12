import { Peerbit } from 'peerbit';

const peer = await Peerbit.create();

console.log(peer.getMultiaddrs());

await peer.stop();