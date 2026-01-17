import React, { useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import Customers from './pages/Customers'
import Sales from './pages/Sales'
import SaleDetail from './pages/SaleDetail'
import CreateSale from './pages/CreateSale'
import DeliveryView from './pages/DeliveryView'
import Analytics from './pages/Analytics'
import CustomerHome from './pages/CustomerHome'
import CustomerOrder from './pages/CustomerOrder'
import CustomerKeyEntry from './pages/CustomerKeyEntry'
import { isNativePlatform, setupNotificationListeners } from './services/pushNotifications'

function App() {
  // Set up push notification listeners on app start
  useEffect(() => {
    if (isNativePlatform()) {
      setupNotificationListeners(
        // Notification received in foreground
        (notification) => {
          console.log('Foreground notification:', notification)
        },
        // User tapped on notification
        (action) => {
          console.log('Notification tap:', action)
          // Navigate based on notification data
          const data = action.notification?.data
          if (data?.sale_id) {
            // Could navigate to the sale, but we need the token
            // The token should be stored in Preferences
          }
        }
      )
    }
  }, [])

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Mobile app key entry screen */}
          <Route path="/app" element={<CustomerKeyEntry />} />

          {/* Public customer routes - NO authentication required */}
          <Route path="/customer/:token" element={<CustomerHome />} />
          <Route path="/customer/:token/sale/:saleId" element={<CustomerOrder />} />

          {/* Admin authentication routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Admin protected routes */}
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="products" element={<Products />} />
            <Route path="customers" element={<Customers />} />
            <Route path="sales" element={<Sales />} />
            <Route path="sales/new" element={<CreateSale />} />
            <Route path="sales/:id" element={<SaleDetail />} />
            <Route path="sales/:id/edit" element={<CreateSale />} />
            <Route path="sales/:id/delivery" element={<DeliveryView />} />
            <Route path="analytics" element={<Analytics />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
