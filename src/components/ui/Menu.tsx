"use client";

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
      title?: string;
    };

export interface MenuProps {
  items: MenuItemType[];
  icon?: React.ReactNode; // Optional custom trigger icon, defaults to MoreVertical
  triggerClassName?: string;
  menuClassName?: string;
  align?: 'left' | 'right';
  width?: number | string;
  ariaLabel?: string;
}

export function Menu({
  items,
  icon,
  triggerClassName = '',
  menuClassName = '',
  align = 'right',
  width = 192,
  ariaLabel = 'Action menu',
}: MenuProps) {
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
      window.addEventListener('resize', handleScroll);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();

    if (!isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const menuWidth = typeof width === 'number' ? width : 192;
      const menuHeight = items.length * 38 + 16;

      // Position directly below or above the button (viewport coords for fixed positioning)
      let top = rect.bottom + 4;
      if (rect.bottom + menuHeight > window.innerHeight && rect.top > menuHeight) {
        top = rect.top - menuHeight - 4;
      }

      let left = align === 'left' ? rect.left : rect.right - menuWidth;

      // Ensure menu remains fully inside viewport
      left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));
      top = Math.max(8, top);

      setCoords({ top, left });
    }

    setIsOpen(!isOpen);
  };

  const handleItemClick = (e: React.MouseEvent, onClick?: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent?.stopImmediatePropagation?.();

    if (onClick) {
      onClick();
    }
    setIsOpen(false);
  };

  const dropdown = isOpen ? createPortal(
    <div 
      ref={menuRef}
      role="menu"
      data-no-row-click="true"
      onClick={(e) => {
        e.stopPropagation();
        e.nativeEvent?.stopImmediatePropagation?.();
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
        e.nativeEvent?.stopImmediatePropagation?.();
      }}
      className={`fixed bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-[9999] animate-in fade-in zoom-in-95 duration-100 ${menuClassName}`}
      style={{
        top: coords.top,
        left: coords.left,
        width: typeof width === 'number' ? `${width}px` : width,
      }}
    >
      {items.map((item, idx) => {
        if (item.isDivider) {
          return <div key={`divider-${idx}`} className="h-px bg-slate-100 my-1 mx-2" />;
        }

        const baseClasses = `flex items-center gap-2.5 px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg mx-1 transition-colors w-[calc(100%-8px)] text-left cursor-pointer select-none ${
          item.disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''
        }`;
        const colorClasses = item.hoverColor 
          ? `${item.color || 'text-slate-700'} ${item.hoverColor}` 
          : `${item.color || 'text-slate-700'} hover:bg-slate-50 hover:text-[#159A1D]`;

        if (item.href) {
          return (
            <Link 
              key={idx}
              href={item.href}
              role="menuitem"
              data-no-row-click="true"
              title={item.title}
              className={`${baseClasses} ${colorClasses}`}
              onClick={(e) => {
                e.stopPropagation();
                e.nativeEvent?.stopImmediatePropagation?.();
                setIsOpen(false);
              }}
            >
              {item.icon && <span className="shrink-0">{item.icon}</span>}
              <span className="truncate">{item.label}</span>
            </Link>
          );
        }

        return (
          <button
            key={idx}
            type="button"
            role="menuitem"
            data-no-row-click="true"
            onClick={(e) => handleItemClick(e, item.onClick)}
            disabled={item.disabled}
            title={item.title}
            className={`${baseClasses} ${colorClasses}`}
          >
            {item.icon && <span className="shrink-0">{item.icon}</span>}
            <span className="truncate">{item.label}</span>
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
        type="button"
        data-no-row-click="true"
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        onClick={toggleMenu}
        onMouseDown={(e) => {
          e.stopPropagation();
          e.nativeEvent?.stopImmediatePropagation?.();
        }}
        className={`p-1.5 sm:p-2 text-slate-400 hover:text-slate-800 transition-colors rounded-lg hover:bg-slate-100 flex items-center justify-center cursor-pointer ${
          isOpen ? 'bg-slate-100 text-slate-900 shadow-2xs' : ''
        } ${triggerClassName}`}
      >
        {icon || <MoreVertical size={16} />}
      </button>
      {dropdown}
    </>
  );
}

export default Menu;
