import { useCallback, useEffect, useRef, useState } from "react";

export function useTransientFeedback(duration = 1400) {
  const [active, setActive] = useState(false);
  const [sequence, setSequence] = useState(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const trigger = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActive(true);
    setSequence((current) => current + 1);
    timeoutRef.current = setTimeout(() => {
      setActive(false);
      timeoutRef.current = null;
    }, duration);
  }, [duration]);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  return { active, sequence, trigger };
}
