import { useEffect, useRef, useState } from 'react';
import { asset, probeFile } from '../lib/assets';
import type { CookieScene } from '../three/CookieScene';

type Props = { flavour: string; broken: boolean; onBreakChange?: (on: boolean) => void };

/** Real-time 3D cookie. Loads /models/tem_{flavour}.glb when present, otherwise renders the procedural cookie. */
export const CookieViewer = ({ flavour, broken, onBreakChange }: Props) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CookieScene | null>(null);
  const breakCb = useRef(onBreakChange);
  breakCb.current = onBreakChange;
  const initial = useRef(flavour);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let scene: CookieScene | null = null;
    let alive = true;
    import('../three/CookieScene')
      .then(({ CookieScene: Scene }) => {
        if (!alive || !hostRef.current) return;
        scene = new Scene(hostRef.current, {
          flavour: initial.current,
          modelUrl: asset.model,
          hasModel: (id) => probeFile(asset.model(id)),
          onBreak: (on) => breakCb.current?.(on),
        });
        sceneRef.current = scene;
      })
      .catch(() => setFailed(true));
    return () => {
      alive = false;
      scene?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (sceneRef.current && flavour !== initial.current) {
      sceneRef.current.setFlavour(flavour);
      initial.current = flavour;
    }
  }, [flavour]);

  useEffect(() => {
    sceneRef.current?.setBroken(broken);
  }, [broken]);

  if (failed) return null;
  return <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} aria-label="Interactive 3D cookie — drag to turn, double-click to break" role="img" />;
};
