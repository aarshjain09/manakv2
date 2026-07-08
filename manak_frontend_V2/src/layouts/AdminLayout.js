import { Outlet } from "react-router-dom";
import Sidebar from "../components/admin/Sidebar";
import Header from "../components/admin/Header";

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-background">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="ml-72">

        {/* Header */}
        <Header />

        {/* Page Content */}
        <main className="pt-24 px-8 pb-8 min-h-screen">

          <Outlet />

        </main>

      </div>

    </div>
  );
}