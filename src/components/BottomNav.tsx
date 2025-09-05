"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  HomeOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  BarChartOutlined,
  CodeSandboxOutlined,
  FileTextOutlined,
} from "@ant-design/icons";

const BottomNav = () => {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    {
      key: "/",
      icon: <BarChartOutlined />,
      label: "Thống Kê",
    },
    {
      key: "/orders",
      icon: <ShoppingCartOutlined />,
      label: "Đơn Hàng",
    },
    {
      key: "/harvest",
      icon: <InboxOutlined />,
      label: "Thu Hoạch",
    },
    {
      key: "/inventory",
      icon: <CodeSandboxOutlined />,
      label: "Vật Tư",
    },
    {
      key: "/labor",
      icon: <TeamOutlined />,
      label: "Nhân Công",
    },
    {
      key: "/care",
      icon: <FileTextOutlined />,
      label: "Nhật Ký",
    },
  ];

  return (
    <nav
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        background: "#ffffff",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      <div
        style={{
          height: "60px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        {menuItems.map((item) => (
          <button
            key={item.key}
            onClick={() => router.push(item.key)}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              height: "100%",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: pathname === item.key ? "#1890ff" : "#666",
              padding: "8px 0",
              fontSize: "12px",
            }}
          >
            <span style={{ fontSize: "20px", marginBottom: "4px" }}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
