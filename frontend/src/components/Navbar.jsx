import React from 'react';
import { NavLink } from 'react-router-dom';
import { Coffee } from 'lucide-react';

const Navbar = () => {
  return (
    <nav className="navbar fade-in">
      <div className="nav-brand" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary-color)', fontSize: '1.5rem', fontWeight: 'bold' }}>
        <Coffee size={32} />
        <span>CafeEase</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Menu</NavLink>
        <NavLink to="/kitchen" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Kitchen</NavLink>
        <NavLink to="/admin" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>Admin</NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
