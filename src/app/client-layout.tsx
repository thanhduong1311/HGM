"use client";

import dynamic from "next/dynamic";

const AppHeader = dynamic(() => import("@/components/AppHeader"), {
  ssr: false,
});

const BottomNav = dynamic(() => import("@/components/BottomNav"), {
  ssr: false,
});

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 mt-16 mb-16 p-4">{children}</main>
      <BottomNav />
    </div>
  );
}
