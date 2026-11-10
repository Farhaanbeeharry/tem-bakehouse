import { useEffect, useRef, useState } from 'react';
import { asset, heavyAssetsReady, probeFile } from '../lib/assets';
import { MODEL_FLAVOURS } from '../data/catalog';
import type { CookieScene } from '../three/CookieScene';

type Props = { flavour: string; broken: boolean; onBreakChange?: (on: boolean) => void };

/** Real-time 3D cookie. Loads /models/tem_{flavour}.glb on demand, one flavour at a time. */
export const CookieViewer = ({ flavour, broken, onBreakChange }: Props) => {
  const hostRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<CookieScene | null>(null);
  const breakCb = useRef(onBreakChange);
  breakCb.current = onBreakChange;
  const initial = useRef(flavour);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let scene: CookieScene | null = null;
    let alive = true;
    heavyAssetsReady()
      .then(() => import('../three/CookieScene'))
      .then(({ CookieScene: Scene }) => {
        if (!alive || !hostRef.current) return;
        scene = new Scene(hostRef.current, {
          flavour: initial.current,
          modelUrl: asset.model,
          hasModel: (id) => (MODEL_FLAVOURS.includes(id) ? probeFile(asset.model(id)) : Promise.resolve(false)),
          onBreak: (on) => breakCb.current?.(on),
          onLoading: (on) => alive && setLoading(on),
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
  return (
    <>
      <div ref={hostRef} style={{ position: 'absolute', inset: 0 }} aria-label="Interactive 3D cookie — drag to turn, double-click to break" role="img" aria-busy={loading} />
      <div
        aria-hidden="true"
        style={{ position: 'absolute', left: '50%', top: '50%', width: 44, height: 44, margin: -22, borderRadius: '50%', border: '3px solid rgba(113,29,44,.18)', borderTopColor: '#711D2C', animation: 'temSpin .8s linear infinite', opacity: loading ? 1 : 0, transition: loading ? 'opacity .3s .3s' : 'opacity .2s', pointerEvents: 'none' }}
      />
    </>
  );
};
