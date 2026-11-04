import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { flavourById, type Product } from '../data/catalog';
import type { Custom, OrderLine } from './store';
import { uid } from './format';

export type User = { name: string; email: string; phone: string };
export type AuthMode = 'login' | 'register' | 'forgot' | 'sent' | 'reset';

type AddOptions = { pack?: string; qty?: number; diet?: 'regular' | 'gf'; flavour?: string; custom?: Custom | null };

type ShopContextValue = {
  cart: OrderLine[];
  setCart: (fn: (c: OrderLine[]) => OrderLine[]) => void;
  addLine: (p: Product, o?: AddOptions) => void;
  cartCount: number;
  estimate: number;
  user: User | null;
  setUser: (u: User | null) => void;
  favs: string[];
  toggleFav: (id: string) => void;
  drawerOpen: boolean;
  setDrawerOpen: (v: boolean) => void;
  auth: AuthMode | null;
  authPending: boolean;
  openAuth: (mode: AuthMode, pending?: boolean) => void;
  closeAuth: () => void;
  toast: string | null;
  showToast: (msg: string) => void;
  verifyBanner: boolean;
  setVerifyBanner: (v: boolean) => void;
};

const ShopContext = createContext<ShopContextValue | null>(null);

const load = <T,>(key: string, fallback: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const save = (key: string, value: unknown) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable */
  }
};

export const ShopProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCartState] = useState<OrderLine[]>(() => load('tem_cart', []));
  const [user, setUser] = useState<User | null>(() => load('tem_user', null));
  const [favs, setFavs] = useState<string[]>(() => load('tem_favs', []));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [auth, setAuth] = useState<AuthMode | null>(null);
  const [authPending, setAuthPending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [verifyBanner, setVerifyBanner] = useState(false);
  const toastTimer = useRef<number | undefined>(undefined);

  useEffect(() => save('tem_cart', cart), [cart]);
  useEffect(() => save('tem_user', user), [user]);
  useEffect(() => save('tem_favs', favs), [favs]);

  const setCart = useCallback((fn: (c: OrderLine[]) => OrderLine[]) => setCartState(fn), []);

  const addLine = useCallback((p: Product, o: AddOptions = {}) => {
    if (p.status !== 'available') return;
    const pk = p.packs.find((x) => x.id === o.pack) ?? p.packs[0];
    const fl = o.flavour ?? p.flavour;
    const line: OrderLine = {
      key: uid(),
      pid: p.id,
      name: p.name + (p.flavourPick ? ' — ' + flavourById[fl].name : ''),
      flavour: fl,
      pack: pk.label,
      packId: pk.id,
      qty: o.qty ?? 1,
      diet: o.diet ?? (p.diet === 'gf' ? 'gf' : 'regular'),
      unit: p.price * pk.mult,
      custom: o.custom ?? null,
    };
    setCartState((c) => [...c, line]);
  }, []);

  const showToast = useCallback((msg: string) => {
    window.clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const value = useMemo<ShopContextValue>(
    () => ({
      cart,
      setCart,
      addLine,
      cartCount: cart.reduce((a, l) => a + l.qty, 0),
      estimate: cart.reduce((a, l) => a + l.unit * l.qty, 0),
      user,
      setUser,
      favs,
      toggleFav: (id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id])),
      drawerOpen,
      setDrawerOpen,
      auth,
      authPending,
      openAuth: (mode, pending = false) => {
        setAuth(mode);
        setAuthPending(pending);
      },
      closeAuth: () => setAuth(null),
      toast,
      showToast,
      verifyBanner,
      setVerifyBanner,
    }),
    [cart, setCart, addLine, user, favs, drawerOpen, auth, authPending, toast, showToast, verifyBanner],
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
};

export const useShop = () => {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error('useShop must be used inside ShopProvider');
  return ctx;
};

export const useIsMobile = (breakpoint = 1080) => {
  const [mobile, setMobile] = useState(() => window.innerWidth < breakpoint);
  useEffect(() => {
    const on = () => setMobile(window.innerWidth < breakpoint);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, [breakpoint]);
  return mobile;
};

export const useReducedMotion = () => {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
};
