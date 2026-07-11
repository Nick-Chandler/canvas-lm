'use client';

import Link from 'next/link';
import AuthControl from './AuthControl';

export default function Navbar() {
  return (
    <nav className="canvas-navbar">
      <Link className="navbar-btn" href="/dashboard">Dashboard</Link>
      <AuthControl />
    </nav>
  );
}
