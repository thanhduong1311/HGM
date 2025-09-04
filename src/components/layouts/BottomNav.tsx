import { useRouter } from "next/navigation";
import {
  HomeOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  BarChartOutlined,
} from "@ant-design/icons";

const BottomNav = () => {
  const router = useRouter();

  const menuItems = [
    {
      key: "/",
      icon: <HomeOutlined />,
      label: "Trang Chủ",
    },
    {
      key: "/garden",
      icon: <InboxOutlined />,
      label: "Vườn",
    },
    {
      key: "/orders",
      icon: <ShoppingCartOutlined />,
      label: "Đơn Hàng",
    },
    {
      key: "/workers",
      icon: <TeamOutlined />,
      label: "Nhân Công",
    },
    {
      key: "/statistics",
      icon: <BarChartOutlined />,
      label: "Thống Kê",
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
              color: "#666",
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
