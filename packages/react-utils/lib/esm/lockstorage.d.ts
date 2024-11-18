export declare class FastMutex {
    clientId: string;
    xPrefix: string;
    yPrefix: string;
    timeout: number;
    localStorage: any;
    intervals: Map<string, any>;
    constructor({ clientId, xPrefix, yPrefix, timeout, localStorage, }?: {
        clientId?: any;
        xPrefix?: string | undefined;
        yPrefix?: string | undefined;
        timeout?: number | undefined;
        localStorage?: any;
    });
    lock(key: string, keepLocked?: () => boolean): Promise<{
        restartCount: number;
        contentionCount: any;
        locksLost: number;
    }>;
    isLocked(key: string): boolean;
    getLockedInfo(key: string): string | undefined;
    release(key: string): void;
    /**
     * Helper function to wrap all values in an object that includes the time (so
     * that we can expire it in the future) and json.stringify's it
     */
    setItem(key: string, value: any, keepLocked?: () => boolean): any;
    /**
     * Helper function to parse JSON encoded values set in localStorage
     */
    getItem(key: string): string | undefined;
}
