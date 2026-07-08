import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import { Toaster } from "react-hot-toast";

// ================= WORKER CONTEXT =================

import {
  WorkerCustomerProvider,
} from "./context/workercustomer";

// ================= WORKER PAGES =================

import CustomerSelection from "./pages/customerselection";

// ================= CUSTOMER EXTRA PAGES =================

import OrderDetails from "./pages/orderdetails";
import Profile from "./pages/profile";
import Brands from "./pages/brand";
import BrandProducts from "./pages/brandProduct";
import BrandCategories from "./pages/brandcategory";

// ================= ROUTE GUARDS =================

import ProtectedRoute from "./components/protectedroute";
import AdminRoute from "./components/protectedroute";
import WorkerShoppingGuard from "./components/workershoppingguard";

// ================= CONTEXT =================

import { AuthProvider } from "./context/auth";
import { CartProvider } from "./context/cart";

// ================= LAYOUTS =================

import AdminLayout from "./layouts/AdminLayout";
import CustomerLayout from "./layouts/CustomerLayout";

// ================= PUBLIC =================

import Login from "./pages/login";
import Register from "./pages/register";

// ================= CUSTOMER =================

import Home from "./pages/home";
import CompanyProducts from "./pages/companyp";
import Products from "./pages/products";
import Cart from "./pages/cart";
import Orders from "./pages/orders";

import Categories from "./components/categories";
import CategoryProducts from "./pages/categoryProducts";

// ================= ADMIN =================

import AdminDashboard from "./pages/admin/dashboard";
import AdminCompanies from "./pages/admin/companies";
import AdminProducts from "./pages/admin/products";
import AdminOrders from "./pages/admin/orders";
import AdminUsers from "./pages/admin/users";
import AdminBrands from "./pages/admin/brands";
import AdminCategories from "./pages/admin/categories";
import AdminOrderDetails from "./pages/admin/orderDetails";

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WorkerCustomerProvider>
          <BrowserRouter>
            {/* ==========================================
                TOAST NOTIFICATIONS
            ========================================== */}

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,

                style: {
                  borderRadius: "12px",
                  background: "#ffffff",
                  color: "#1e293b",
                  padding: "14px 16px",
                },

                success: {
                  duration: 3000,
                },

                error: {
                  duration: 4000,
                },
              }}
            />

            <Routes>
              {/* ==========================================
                  PUBLIC ROUTES
              ========================================== */}

              <Route
                path="/"
                element={<Login />}
              />

              <Route
                path="/register"
                element={<Register />}
              />

              {/* ==========================================
                  WORKER CUSTOMER SELECTION
              ========================================== */}

              <Route
                path="/worker/customer"
                element={
                  <ProtectedRoute>
                    <CustomerSelection />
                  </ProtectedRoute>
                }
              />

              {/* ==========================================
                  CUSTOMER + WORKER SHOPPING ROUTES
              ========================================== */}

              {/* HOME */}

              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <WorkerShoppingGuard>
                      <CustomerLayout>
                        <Home />
                      </CustomerLayout>
                    </WorkerShoppingGuard>
                  </ProtectedRoute>
                }
              />

              {/* ==========================================
                  COMPANY
              ========================================== */}

              <Route
                path="/company/:companyId"
                element={
                  <ProtectedRoute>
                    <WorkerShoppingGuard>
                      <CustomerLayout>
                        <CompanyProducts />
                      </CustomerLayout>
                    </WorkerShoppingGuard>
                  </ProtectedRoute>
                }
              />

              {/* ==========================================
                  BRANDS
              ========================================== */}

              <Route
                path="/brands"
                element={
                  <ProtectedRoute>
                    <WorkerShoppingGuard>
                      <CustomerLayout>
                        <Brands />
                      </CustomerLayout>
                    </WorkerShoppingGuard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/brands/:brandId"
                element={
                  <ProtectedRoute>
                    <WorkerShoppingGuard>
                      <CustomerLayout>
                        <BrandProducts />
                      </CustomerLayout>
                    </WorkerShoppingGuard>
                  </ProtectedRoute>
                }
              />

              {/* BRAND → CATEGORIES */}

              <Route
                path="/brand/:brandId/categories"
                element={
                  <ProtectedRoute>
                    <WorkerShoppingGuard>
                      <CustomerLayout>
                        <BrandCategories />
                      </CustomerLayout>
                    </WorkerShoppingGuard>
                  </ProtectedRoute>
                }
              />

              {/* ==========================================
                  ALL PRODUCTS
              ========================================== */}

              <Route
                path="/products"
                element={
                  <ProtectedRoute>
                    <WorkerShoppingGuard>
                      <CustomerLayout>
                        <Products />
                      </CustomerLayout>
                    </WorkerShoppingGuard>
                  </ProtectedRoute>
                }
              />

              {/* ==========================================
                  CATEGORIES
              ========================================== */}

              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <WorkerShoppingGuard>
                      <CustomerLayout>
                        <Categories />
                      </CustomerLayout>
                    </WorkerShoppingGuard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/categories/:categoryId"
                element={
                  <ProtectedRoute>
                    <WorkerShoppingGuard>
                      <CustomerLayout>
                        <CategoryProducts />
                      </CustomerLayout>
                    </WorkerShoppingGuard>
                  </ProtectedRoute>
                }
              />

              {/* ==========================================
                  CART
              ========================================== */}

              <Route
                path="/cart"
                element={
                  <ProtectedRoute>
                    <WorkerShoppingGuard>
                      <CustomerLayout>
                        <Cart />
                      </CustomerLayout>
                    </WorkerShoppingGuard>
                  </ProtectedRoute>
                }
              />

              {/* ==========================================
                  ORDERS
              ========================================== */}

              <Route
                path="/orders"
                element={
                  <ProtectedRoute>
                    <WorkerShoppingGuard>
                      <CustomerLayout>
                        <Orders />
                      </CustomerLayout>
                    </WorkerShoppingGuard>
                  </ProtectedRoute>
                }
              />

              <Route
                path="/orders/:id"
                element={
                  <ProtectedRoute>
                    <WorkerShoppingGuard>
                      <CustomerLayout>
                        <OrderDetails />
                      </CustomerLayout>
                    </WorkerShoppingGuard>
                  </ProtectedRoute>
                }
              />

              {/* ==========================================
                  PROFILE
              ========================================== */}

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <WorkerShoppingGuard>
                      <CustomerLayout>
                        <Profile />
                      </CustomerLayout>
                    </WorkerShoppingGuard>
                  </ProtectedRoute>
                }
              />

              {/* ==========================================
                  ADMIN ROUTES
              ========================================== */}

              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                {/* DASHBOARD */}

                <Route
                  index
                  element={<AdminDashboard />}
                />

                {/* COMPANIES */}

                <Route
                  path="companies"
                  element={<AdminCompanies />}
                />

                {/* BRANDS */}

                <Route
                  path="brands"
                  element={<AdminBrands />}
                />

                {/* CATEGORIES */}

                <Route
                  path="categories"
                  element={<AdminCategories />}
                />

                {/* PRODUCTS */}

                <Route
                  path="products"
                  element={<AdminProducts />}
                />

                {/* CUSTOMERS */}

                <Route
                  path="customers"
                  element={<AdminUsers />}
                />

                {/* ORDERS */}

                <Route
                  path="orders"
                  element={<AdminOrders />}
                />

                {/* ORDER DETAILS */}

                <Route
                  path="orders/:id"
                  element={<AdminOrderDetails />}
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </WorkerCustomerProvider>
      </CartProvider>
    </AuthProvider>
  );
}