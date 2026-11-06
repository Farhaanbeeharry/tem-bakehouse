import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useStore } from '../lib/store';
import { AdminNav } from './AdminNav';
import { SECTION_TITLES } from './adminData';
import { CalendarView } from './CalendarView';
import { ContentView } from './ContentView';
import { CustomersView } from './CustomersView';
import { OrderDrawer } from './OrderDrawer';
import { OrdersView } from './OrdersView';
import { OverviewView } from './OverviewView';
import { PaymentsView } from './PaymentsView';
import { ProductsView } from './ProductsView';
import { SettingsView } from './SettingsView';
import { useOrderDrawer } from './useOrderDrawer';
import './admin.css';

const todayText = () =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const AdminApp = () => {
  const { orders } = useStore();
  const { pathname } = useLocation();
  const { openRef, close } = useOrderDrawer();
  const section = pathname.replace(/^\/admin\/?/, '').split('/')[0] || 'overview';
  const title = SECTION_TITLES[section] ?? 'Overview';
  const order = openRef ? orders.find((o) => o.ref === openRef) : undefined;

  useEffect(() => {
    document.title = `${title} · TEM Back office`;
  }, [title]);

  return (
    <div className="adm">
      <AdminNav />
      <main className="adm-main">
        <div className="adm-head">
          <div>
            <h1 className="adm-title">{title}</h1>
            <span className="adm-muted" style={{ fontSize: 13 }}>
              {todayText()}
            </span>
          </div>
        </div>
        <Routes>
          <Route index element={<OverviewView />} />
          <Route path="orders" element={<OrdersView />} />
          <Route path="calendar" element={<CalendarView />} />
          <Route path="payments" element={<PaymentsView />} />
          <Route path="products" element={<ProductsView />} />
          <Route path="customers" element={<CustomersView />} />
          <Route path="content" element={<ContentView />} />
          <Route path="settings" element={<SettingsView />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
      {order && <OrderDrawer key={order.ref} order={order} onClose={close} />}
    </div>
  );
};

export default AdminApp;
