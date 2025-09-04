import MainLayout from "@/components/layouts/MainLayout";

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
