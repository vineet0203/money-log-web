"use client";

import { useState, useEffect, useCallback, useTransition } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

/**
 * Hook to synchronize tab state with URL query parameters.
 * Allows persisting the active tab on page reload, bookmarks, and browser navigation.
 *
 * @param paramKey Query parameter key in the URL (default: 'tab')
 * @param defaultTab Default active tab if param is missing or invalid
 * @param validTabs Optional array of valid tab IDs to validate against
 */
export function useQueryTab<T extends string>(
  paramKey: string = 'tab',
  defaultTab: T,
  validTabs?: readonly T[] | T[]
): [T, (newTab: T) => void] {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const getResolvedTab = useCallback(
    (paramVal: string | null): T => {
      if (!paramVal) return defaultTab;
      if (validTabs && validTabs.length > 0) {
        const normalize = (s: string) => s.toLowerCase().replace(/[-_\s&/]+/g, '');
        const target = normalize(paramVal);
        const found = validTabs.find(
          (t) => normalize(t) === target || t.toLowerCase() === paramVal.toLowerCase()
        );
        return found || defaultTab;
      }
      return paramVal as T;
    },
    [defaultTab, validTabs]
  );

  const initialTab = getResolvedTab(searchParams.get(paramKey));
  const [activeTab, setActiveTabState] = useState<T>(initialTab);

  // Sync if URL searchParams changes externally (e.g. back/forward navigation)
  useEffect(() => {
    const fromUrl = getResolvedTab(searchParams.get(paramKey));
    setActiveTabState(fromUrl);
  }, [searchParams, paramKey, getResolvedTab]);

  const setActiveTab = useCallback(
    (newTab: T) => {
      setActiveTabState(newTab);
      startTransition(() => {
        const params = new URLSearchParams(searchParams.toString());
        params.set(paramKey, newTab);
        const newUrl = `${pathname}?${params.toString()}`;
        router.replace(newUrl, { scroll: false });
      });
    },
    [searchParams, pathname, router, paramKey]
  );

  return [activeTab, setActiveTab];
}
