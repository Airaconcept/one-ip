import { useState } from "react";
import { atom, useAtom } from "jotai";

// Component-lifetime Jotai state for reusable controls and dialog instances.
// URL state, React Query data and React Hook Form values stay with their owners.
export function useLocalAtom<T>(initial: T | (() => T)) {
  const [state] = useState(() =>
    atom<T>(typeof initial === "function" ? (initial as () => T)() : initial),
  );
  return useAtom(state);
}
