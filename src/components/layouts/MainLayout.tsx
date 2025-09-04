"use client";

import { Layout } from "antd";
import AppHeader from "../AppHeader";
import BottomNav from "../BottomNav";

const { Content } = Layout;

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Layout className="min-h-screen">
      <AppHeader />
      <Content className="pt-[56px] pb-[76px]">{children}</Content>
      <BottomNav />
    </Layout>
  );
}
