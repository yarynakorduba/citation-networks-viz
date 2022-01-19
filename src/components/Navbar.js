import { useMemo } from 'react';

function Navbar() {
  const text = useMemo(() => (window.location.hash === '#/coauthorship' ? 'Coauthorship viz' : 'Publications viz'), []);
  return (
    <nav className="navbar">
      <span className="navbar-title">{text}</span>
      <span className="navbar-subtitle"> Nika Čić, Yaryna Korduba </span>
    </nav>
  );
}

export default Navbar;
