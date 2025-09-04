"use client";

import { Layout } from "antd";
import dynamic from "next/dynamic";

const AppHeader = dynamic(() => import("@/components/AppHeader"), {
  ssr: false,
});

const BottomNav = dynamic(() => import("@/components/BottomNav"), {
  ssr: false,
});

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Layout className="min-h-screen">
      <AppHeader />
      <main className="flex-1 mt-14 mb-16 p-4">{children}</main>
      <BottomNav />
    </Layout>
  );
}
