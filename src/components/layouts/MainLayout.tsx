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
      <Content style={{ marginTop: 50, marginBottom: 50 }}>{children}</Content>
      <BottomNav />
    </Layout>
  );
}
