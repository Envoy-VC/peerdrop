import { Program, OpenOptions, ProgramEvents } from "@peerbit/program";
type ExtractArgs<T> = T extends Program<infer Args> ? Args : never;
type ExtractEvents<T> = T extends Program<any, infer Events> ? Events : never;
export declare const useProgram: <P extends Program<ExtractArgs<P>, ExtractEvents<P>> & Program<any, ProgramEvents>>(addressOrOpen?: P | string, options?: OpenOptions<P>) => {
    program: P | undefined;
    session: any;
    loading: boolean;
    promise: Promise<P> | undefined;
    peerCounter: number;
};
export {};
