"use client";

import React from 'react';
import { Tabs, TabsProps, TabItem } from '@/components/ui/Tabs';

export type PosTabItem = TabItem;
export type PosTabsProps = TabsProps;

export function PosTabs(props: TabsProps) {
  return <Tabs variant={props.variant || 'card'} standalone={props.standalone ?? true} {...props} />;
}
