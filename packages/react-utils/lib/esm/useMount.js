import { useEffect, useRef } from "react";
export const useMount = (effect) => {
    const mounted = useRef(false);
    useEffect(() => {
        if (!mounted.current) {
            effect();
        }
        mounted.current = true;
        return () => { };
    }, [mounted.current]);
};
//# sourceMappingURL=useMount.js.map