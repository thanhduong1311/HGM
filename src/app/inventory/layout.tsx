import MainLayout from "@/components/layouts/MainLayout";
import { Card } from "antd";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout>
      <Card>{children}</Card>
    </MainLayout>
  );
}
