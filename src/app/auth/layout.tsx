"use client";

import { Layout } from "antd";
import Image from "next/image";
import logo from "../../../public/HGM_LOGO.jpg";

const { Content } = Layout;

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Layout className="min-h-screen bg-[#3fbccb] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,rgba(0,0,0,0.1)_100%)]">
      <Content className="flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md backdrop-blur-sm">
          <div className="flex flex-col items-center mb-8">
            <Image
              src={logo}
              alt="Home Garden Logo"
              width={64}
              height={64}
              style={{
                borderRadius: "12px",
                objectFit: "cover",
              }}
            />
            <h1 className="text-2xl font-bold mt-4 text-gray-800">HGM</h1>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            {children}
          </div>
        </div>
      </Content>
    </Layout>
  );
}
