import MainLayout from "@/components/layouts/MainLayout";

export default function GardenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <MainLayout>{children}</MainLayout>;
}
