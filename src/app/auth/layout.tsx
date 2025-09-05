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
    <Content>
      <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div className="w-100" style={{ maxWidth: "400px" }}>
          <div className="text-center mb-4 dlex flex-column align-items-center">
            <Image
              src={logo}
              alt="Home Garden Logo"
              width={64}
              height={64}
              style={{
                borderRadius: "12px",
                objectFit: "cover",
              }}
              className="mb-2"
            />
            <h1 className="h3 mb-0 text-center">HGM</h1>
          </div>
          <div>{children}</div>
        </div>
      </div>
    </Content>
  );
}
