import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./context/AuthContext"
import { ParkingProvider } from "./context/ParkingContext"
import ProtectedRoute from "./components/ProtectedRoute"
import LoginPage from "./pages/LoginPage"
import RegisterPage from "./pages/RegisterPage"
import DashboardLayout from "./layouts/DashboardLayout"
import DashboardPage from "./pages/DashboardPage"
import ParkingSpacesPage from "./pages/ParkingSpacesPage"
import MyParkingPage from "./pages/MyParkingPage"
import PaymentPage from "./pages/PaymentPage"
import ProfilePage from "./pages/ProfilePage"

function App() {
  return (
    <AuthProvider>
      <ParkingProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }
            >
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="parking-spaces" element={<ParkingSpacesPage />} />
              <Route path="my-parking" element={<MyParkingPage />} />
              <Route path="payment" element={<PaymentPage />} />
              <Route path="profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </ParkingProvider>
    </AuthProvider>
  )
}

export default App
