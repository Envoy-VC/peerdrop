import { usePeer } from "./usePeer.js";
import { useEffect, useReducer, useRef, useState } from "react";
const addressOrUndefined = (p) => {
    try {
        return p?.address;
    }
    catch (error) {
        return undefined;
    }
};
export const useProgram = (addressOrOpen, options) => {
    const { peer } = usePeer();
    let [program, setProgram] = useState();
    let [loading, setLoading] = useState(true);
    const [session, forceUpdate] = useReducer((x) => x + 1, 0);
    let programLoadingRef = useRef();
    const [peerCounter, setPeerCounter] = useState(1);
    let closingRef = useRef(Promise.resolve());
    useEffect(() => {
        if (!peer || !addressOrOpen) {
            return;
        }
        setLoading(true);
        let changeListener;
        closingRef.current.then(() => {
            programLoadingRef.current = peer
                ?.open(addressOrOpen, { ...options, existing: "reuse" })
                .then((p) => {
                changeListener = () => {
                    p.getReady().then((set) => {
                        setPeerCounter(set.size);
                    });
                };
                p.events.addEventListener("join", changeListener);
                p.events.addEventListener("leave", changeListener);
                p.getReady().then((set) => {
                    setPeerCounter(set.size);
                });
                setProgram(p);
                forceUpdate();
                return p;
            })
                .finally(() => {
                setLoading(false);
            });
        });
        // TODO AbortController?
        return () => {
            let startRef = programLoadingRef.current;
            // TODO don't close on reopen the same db?
            if (programLoadingRef.current) {
                closingRef.current =
                    programLoadingRef.current.then((p) => p.close().then(() => {
                        p.events.removeEventListener("join", changeListener);
                        p.events.removeEventListener("leave", changeListener);
                        if (programLoadingRef.current === startRef) {
                            setProgram(undefined);
                            programLoadingRef.current = undefined;
                        }
                    })) || Promise.resolve();
            }
        };
    }, [
        peer?.identity.publicKey.hashcode(),
        typeof addressOrOpen === "string"
            ? addressOrOpen
            : addressOrUndefined(addressOrOpen),
    ]);
    return {
        program,
        session,
        loading,
        promise: programLoadingRef.current,
        peerCounter,
    };
};
//# sourceMappingURL=useProgram.js.map