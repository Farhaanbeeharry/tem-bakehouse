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
import { NEW_ORDER_SETTING, useOrderAlerts } from './useOrderAlerts';
import './admin.css';

const todayText = () =>
  new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

const AdminApp = () => {
  const { orders, ready, settings } = useStore();
  const { pathname } = useLocation();
  const { openRef, close, open } = useOrderDrawer();
  const { alerts, dismiss } = useOrderAlerts(orders, ready, settings.notifications?.[NEW_ORDER_SETTING] ?? true);
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
      {alerts.length > 0 && (
        <div role="status" aria-live="polite" style={{ position: 'fixed', right: 16, bottom: 16, zIndex: 80, display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 'calc(100vw - 32px)' }}>
          {alerts.map((a) => (
            <div key={a.ref} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 12, background: '#711D2C', color: '#FBF8F2', boxShadow: '0 12px 30px rgba(30,19,16,.3)', fontSize: 14 }}>
              <span>
                <strong>New order request</strong>
                <br />
                {a.ref} from {a.name}
              </span>
              <button
                type="button"
                className="adm-btn sm"
                onClick={() => {
                  open(a.ref);
                  dismiss(a.ref);
                }}
              >
                Open
              </button>
              <button type="button" aria-label="Dismiss" onClick={() => dismiss(a.ref)} style={{ border: 'none', background: 'transparent', color: 'inherit', fontSize: 18, cursor: 'pointer' }}>
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminApp;
