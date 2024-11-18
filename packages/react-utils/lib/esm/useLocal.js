import { SearchRequest } from "@peerbit/document";
import { useEffect, useState } from "react";
export const useLocal = (db) => {
    const [all, setAll] = useState([]);
    useEffect(() => {
        if (!db || db.closed) {
            return;
        }
        const changeListener = async () => {
            setAll(await db.index.search(new SearchRequest(), {
                local: true,
                remote: false,
            }));
        };
        changeListener();
        db.events.addEventListener("change", changeListener);
        return () => db.events.addEventListener("change", changeListener);
    }, [db?.address, db?.closed]);
    return all;
};
//# sourceMappingURL=useLocal.js.map