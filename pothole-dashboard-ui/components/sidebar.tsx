'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Map,
  List,
  Zap,
  Building2,
  Menu,
  X,
  Users,
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/route-planner',
    label: 'Route Planner',
    icon: Map,
  },
  {
    href: '/potholes',
    label: 'Pothole List',
    icon: List,
  },
  {
    href: '/roads',
    label: 'Road Management',
    icon: Building2,
  },
  {
    href: '/contractors',
    label: 'Contractors',
    icon: Users,
  },
  {
    href: '/recommendations',
    label: 'AI Recommendations',
    icon: Zap,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 md:hidden p-2 rounded-lg bg-sidebar-accent text-sidebar-accent-foreground"
        aria-label="Toggle menu"
      >
        {isOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-transform duration-300 z-30 md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-sidebar-primary to-sidebar-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-black">P</span>
            </div>
            <span>Pothole</span>
          </h1>
          <p className="text-sm text-sidebar-foreground/60 mt-1">
            Smart City Roads
          </p>
        </div>

        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/20'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 p-4 bg-sidebar-accent/10 rounded-lg border border-sidebar-accent/30">
          <p className="text-sm font-semibold text-sidebar-primary mb-1">
            System Status
          </p>
          <p className="text-xs text-sidebar-foreground/70">
            ✓ 5 rovers active
          </p>
          <p className="text-xs text-sidebar-foreground/70">✓ All systems OK</p>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
        />
      )}
    </>
  );
}
