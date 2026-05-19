import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider }    from './contexts/ThemeContext'
import { ToastProvider }    from './contexts/ToastContext'
import { AuthProvider }     from './contexts/AuthContext'
import { CartProvider }     from './contexts/CartContext'
import { Navbar }           from './components/Navbar'
import { ProtectedRoute }   from './components/ProtectedRoute'
import { Home }     from './pages/Home'
import { Login }    from './pages/Login'
import { Register } from './pages/Register'
import { Product }  from './pages/Product'
import { Cart }     from './pages/Cart'
import { Checkout } from './pages/Checkout'
import { Orders }   from './pages/Orders'
import { Admin }    from './pages/Admin'

function Layout({ children }) {
  return <><Navbar />{children}</>
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <Layout>
                <Routes>
                  <Route path="/"         element={<Home />} />
                  <Route path="/login"    element={<Login />} />
                  <Route path="/cadastro" element={<Register />} />
                  <Route path="/produto"  element={<Product />} />
                  <Route path="/carrinho" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                  <Route path="/pagamento" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="/pedidos"  element={<ProtectedRoute><Orders /></ProtectedRoute>} />
                  <Route path="/admin"    element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
                </Routes>
              </Layout>
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
