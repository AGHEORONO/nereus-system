import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import { LanguageProvider } from './contexts/LanguageContext'

function Nav() {
  const { pathname } = useLocation()
  if (pathname === '/') return null  // Dashboard has its own top bar
  return null
}

export default function App() {
  return (
    <LanguageProvider>
      <BrowserRouter>
        <Nav />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}
