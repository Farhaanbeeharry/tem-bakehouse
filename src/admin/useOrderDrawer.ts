import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useOrderDrawer = () => {
  const [params, setParams] = useSearchParams();
  const openRef = params.get('order');

  const open = useCallback(
    (ref: string) =>
      setParams((p) => {
        const next = new URLSearchParams(p);
        next.set('order', ref);
        return next;
      }),
    [setParams],
  );

  const close = useCallback(
    () =>
      setParams((p) => {
        const next = new URLSearchParams(p);
        next.delete('order');
        return next;
      }),
    [setParams],
  );

  return { openRef, open, close };
};
