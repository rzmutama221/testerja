'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Navbar Landing Page
 *
 * Features:
 * - Logo rzdkstore
 * - Menu: Beranda, Produk, Cara Order, FAQ
 * - Tombol Login & Daftar
 * - Mobile hamburger menu
 * - Sticky on scroll with backdrop blur
 */
export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Beranda', href: '#beranda' },
    { label: 'Produk', href: '#produk' },
    { label: 'Cara Order', href: '#cara-order' },
    { label: 'FAQ', href: '#faq' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-dark/80 backdrop-blur-lg border-b border-dark-border">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-heading text-xl font-bold text-white">
              <span className="text-primary">rzdk</span>store
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-body-sm text-muted-foreground hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-body-sm text-white hover:text-primary-hover transition-colors"
            >
              Login
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-body-sm font-medium rounded-lg transition-colors"
            >
              Daftar
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            type="button"
            className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-dark-card transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-dark-border py-4 space-y-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-body-sm text-muted-foreground hover:text-white hover:bg-dark-card rounded-lg transition-colors"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 border-t border-dark-border flex flex-col gap-2">
              <Link
                href="/login"
                className="px-3 py-2 text-body-sm text-white text-center border border-dark-border rounded-lg hover:bg-dark-card transition-colors"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-3 py-2 text-body-sm text-white text-center bg-primary hover:bg-primary-hover rounded-lg font-medium transition-colors"
              >
                Daftar
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
