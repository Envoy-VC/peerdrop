/* eslint-disable */
// @ts-nocheck
// noinspection JSUnusedGlobalSymbols
// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.
// Import Routes
import { Route as rootRoute } from './app/__root';
import { Route as IndexImport } from './app/index';
import { Route as RoomRoomIdImport } from './app/room.$roomId';

// Create/Update Routes

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any);

const RoomRoomIdRoute = RoomRoomIdImport.update({
  id: '/room/$roomId',
  path: '/room/$roomId',
  getParentRoute: () => rootRoute,
} as any);

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/';
      path: '/';
      fullPath: '/';
      preLoaderRoute: typeof IndexImport;
      parentRoute: typeof rootRoute;
    };
    '/room/$roomId': {
      id: '/room/$roomId';
      path: '/room/$roomId';
      fullPath: '/room/$roomId';
      preLoaderRoute: typeof RoomRoomIdImport;
      parentRoute: typeof rootRoute;
    };
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute;
  '/room/$roomId': typeof RoomRoomIdRoute;
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute;
  '/room/$roomId': typeof RoomRoomIdRoute;
}

export interface FileRoutesById {
  __root__: typeof rootRoute;
  '/': typeof IndexRoute;
  '/room/$roomId': typeof RoomRoomIdRoute;
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath;
  fullPaths: '/' | '/room/$roomId';
  fileRoutesByTo: FileRoutesByTo;
  to: '/' | '/room/$roomId';
  id: '__root__' | '/' | '/room/$roomId';
  fileRoutesById: FileRoutesById;
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute;
  RoomRoomIdRoute: typeof RoomRoomIdRoute;
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  RoomRoomIdRoute: RoomRoomIdRoute,
};

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>();

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/room/$roomId"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/room/$roomId": {
      "filePath": "room.$roomId.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
