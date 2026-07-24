import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { createPortal } from 'react-dom';

export type MenuItemType = 
  | {
      isDivider: true;
    }
  | {
      isDivider?: false;
      label: string; // Required for all non-divider items
      icon?: React.ReactNode;
      color?: string; // e.g. text-red-600
      hoverColor?: string; // e.g. hover:bg-red-50 hover:text-red-600
      onClick?: () => void;
      href?: string;
      disabled?: boolean;
    };

interface MenuProps {
  items: MenuItemType[];
  icon?: React.ReactNode; // Optional custom trigger icon, defaults to MoreVertical
}

export function Menu({ items, icon }: MenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll, true);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [isOpen]);

  const toggleMenu = () => {
    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuHeight = items.length * 40 + 16; // Approx height
      
      let top = rect.bottom + window.scrollY;
      // If it overflows the bottom of the window, render it above the button
      if (rect.bottom + menuHeight > window.innerHeight) {
        top = rect.top + window.scrollY - menuHeight;
      }

      setCoords({
        top: top + 4, // slight offset
        left: rect.right + window.scrollX - 192, // 192px = w-48
      });
    }
    setIsOpen(!isOpen);
  };

  const handleItemClick = (onClick?: () => void) => {
    if (onClick) {
      onClick();
    }
    setIsOpen(false); // Close menu after action
  };

  const dropdown = isOpen ? createPortal(
    <div 
      ref={menuRef}
      className="absolute bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-[9999]"
      style={{ top: coords.top, left: coords.left, width: '192px' }}
    >
      {items.map((item, idx) => {
        if (item.isDivider) {
          return <div key={`divider-${idx}`} className="h-px bg-slate-100 my-1 mx-4" />;
        }

        const baseClasses = `flex items-center gap-3 px-4 py-2.5 text-sm font-semibold transition-colors w-full text-left ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}`;
        const colorClasses = item.hoverColor 
          ? `${item.color || 'text-slate-700'} ${item.hoverColor}` 
          : `${item.color || 'text-slate-700'} hover:bg-slate-50 hover:text-[#159A1D]`;

        if (item.href) {
          return (
            <Link 
              key={idx}
              href={item.href}
              className={`${baseClasses} ${colorClasses}`}
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        }

        return (
          <button
            key={idx}
            onClick={() => handleItemClick(item.onClick)}
            disabled={item.disabled}
            className={`${baseClasses} ${colorClasses}`}
          >
            {item.icon}
            {item.label}
          </button>
        );
      })}
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button 
        ref={triggerRef}
        onClick={toggleMenu}
        className="p-2 text-[#849AB4] hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50 flex items-center justify-center"
      >
        {icon || <MoreVertical size={20} />}
      </button>
      {dropdown}
    </>
  );
}
