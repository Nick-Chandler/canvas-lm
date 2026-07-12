'use client';

import Link from 'next/link';
import Image from 'next/image';
import logo from '@/app/icon.png';
import AuthControl from './AuthControl';

export default function Navbar() {
  return (
    <nav className="canvas-navbar">
      <Link className="navbar-btn" href="/dashboard">Dashboard</Link>
      <Image className="navbar-logo" src={logo} alt="Canvas LM" width={36} height={36} priority />
      <AuthControl />
    </nav>
  );
}
