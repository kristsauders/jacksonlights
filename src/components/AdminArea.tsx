"use client";
import dynamic from 'next/dynamic';
import AdminPanel from './AdminPanel';

// AdminDashboard imports recharts, so it is only fetched after signing in.
const AdminDashboard = dynamic(
  () => import('./AdminDashboard').then((m) => m.AdminDashboard),
  { ssr: false }
);

export default function AdminArea() {
  return (
    <AdminPanel>
      <AdminDashboard />
    </AdminPanel>
  );
}
