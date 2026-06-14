import React from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'

const Layout = () => {
  const location = useLocation();

  return (
    <>
      <nav className="navbar">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
          <Link to="/" className="nav-brand">Prince Parfait GANZA</Link>
          <div className="nav-links">
            <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="/about" className={`nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
            <Link to="/impact" className={`nav-link ${location.pathname === '/impact' ? 'active' : ''}`}>Impact</Link>
            <Link to="/experience" className={`nav-link ${location.pathname === '/experience' ? 'active' : ''}`}>Experience</Link>
            <Link to="/projects" className={`nav-link ${location.pathname === '/projects' ? 'active' : ''}`}>Projects</Link>
            <Link to="/expertise" className={`nav-link ${location.pathname === '/expertise' ? 'active' : ''}`}>Expertise</Link>
            <Link to="/evidence" className={`nav-link ${location.pathname === '/evidence' ? 'active' : ''}`}>Evidence</Link>
            <Link to="/contact" className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem' }}>Hire Me</Link>
          </div>
        </div>
      </nav>
      
      <main>
        <Outlet />
      </main>

      <footer className="footer">
        <div className="container">
          <h2 className="mb-md">Ready to transform your operations?</h2>
          <Link to="/contact" className="btn mb-lg">Initiate a Conversation</Link>
          <p className="text-secondary-color" style={{ fontSize: '0.9rem', marginBottom: 0 }}>
            &copy; {new Date().getFullYear()} Prince Parfait GANZA. Strategic Identity • Execution Evidence.
          </p>
        </div>
      </footer>
    </>
  )
}

export default Layout
