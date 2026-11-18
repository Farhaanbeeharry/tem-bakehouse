import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { StoreLayout } from './components/StoreLayout';
import { ShopProvider } from './lib/shop';
import { HomePage } from './pages/HomePage';
import { MenuPage } from './pages/MenuPage';
import { ProductPage } from './pages/ProductPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { SubmittedPage } from './pages/SubmittedPage';
import { AccountPage } from './pages/AccountPage';
import { HowPage } from './pages/HowPage';
import { AboutPage } from './pages/AboutPage';
import { GalleryPage } from './pages/GalleryPage';
import { ContactPage } from './pages/ContactPage';
import { PolicyPage } from './pages/PolicyPage';
import { CookieCollectionPage } from './pages/CookieCollectionPage';
import { NotFoundPage } from './pages/NotFoundPage';

const AdminApp = lazy(() => import('./admin/AdminApp'));
const AdminGate = lazy(() => import('./admin/AdminGate').then((m) => ({ default: m.AdminGate })));

export const App = () => (
  <Routes>
    <Route
      path="/admin/*"
      element={
        <Suspense fallback={null}>
          <AdminGate>
            <AdminApp />
          </AdminGate>
        </Suspense>
      }
    />
    <Route
      element={
        <ShopProvider>
          <StoreLayout />
        </ShopProvider>
      }
    >
      <Route index element={<HomePage />} />
      <Route path="cookies" element={<MenuPage />} />
      <Route path="cookies/:id" element={<ProductPage />} />
      <Route path="checkout" element={<CheckoutPage />} />
      <Route path="submitted/:ref" element={<SubmittedPage />} />
      <Route path="account" element={<AccountPage />} />
      <Route path="account/orders/:ref" element={<AccountPage />} />
      <Route path="how-to-order" element={<HowPage />} />
      <Route path="cookie-collection" element={<CookieCollectionPage />} />
      <Route path="about" element={<AboutPage />} />
      <Route path="gallery" element={<GalleryPage />} />
      <Route path="contact" element={<ContactPage />} />
      <Route path="policies/:kind" element={<PolicyPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Route>
  </Routes>
);
