import { useEffect } from "react";

export function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void, enabled: boolean = true) {
    useEffect(() => {
        if (!enabled) return;

        const listener = (event: MouseEvent) => {
            if (!ref.current || ref.current.contains(event.target as Node)) {
                return;
            }
            handler();
        };

        document.addEventListener("mousedown", listener);

        return () => {
            document.removeEventListener("mousedown", listener);
        };
    }, [ref, handler, enabled]);
}
