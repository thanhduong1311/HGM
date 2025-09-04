"use client";

import { Layout, Avatar, Dropdown, MenuProps } from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const { Header } = Layout;

const AppHeader = () => {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const handleMenuClick = async ({ key }: { key: string }) => {
    switch (key) {
      case "profile":
        router.push("/profile");
        break;
      case "settings":
        router.push("/settings");
        break;
      case "logout":
        try {
          await signOut();
          router.push("/auth/login");
        } catch (error) {
          console.error("Error signing out:", error);
        }
        break;
    }
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
    },
    {
      key: "settings",
      icon: <SettingOutlined />,
      label: "Cài đặt",
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      danger: true,
    },
  ];

  return (
    <header
      suppressHydrationWarning
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: "56px",
        backgroundColor: "#ffffff",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        zIndex: 1000,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Image
          src="/HGM_LOGO.jpg"
          alt="Home Garden Logo"
          width={40}
          height={40}
          style={{
            borderRadius: "8px",
            objectFit: "cover",
          }}
        />
        <span
          style={{
            fontSize: "16px",
            fontWeight: 600,
            color: "#333",
          }}
        >
          HGM
        </span>
      </div>
      {user ? (
        <Dropdown
          menu={{ items: menuItems, onClick: handleMenuClick }}
          placement="bottomRight"
          trigger={["click"]}
        >
          <Avatar
            icon={<UserOutlined />}
            style={{
              cursor: "pointer",
              backgroundColor: "#f0f0f0",
              color: "#666",
            }}
          />
        </Dropdown>
      ) : null}
    </header>
  );
};

export default AppHeader;
