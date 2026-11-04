import { useNavigate } from 'react-router-dom';
import { useShop } from './shop';

export const useAccountNav = () => {
  const navigate = useNavigate();
  const { user, openAuth } = useShop();
  return () => (user ? navigate('/account') : openAuth('login'));
};
