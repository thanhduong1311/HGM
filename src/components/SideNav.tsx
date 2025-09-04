import { Layout, Menu } from "antd";
import {
  HomeOutlined,
  InboxOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { Sider } = Layout;

const SideNav = () => {
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
      label: "Quản Lý Vườn",
    },
    {
      key: "/inventory",
      icon: <InboxOutlined />,
      label: "Quản Lý Vật Tư",
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
    <Sider breakpoint="lg" collapsedWidth="0" style={{ minHeight: "100vh" }}>
      <div
        style={{
          height: 32,
          margin: 16,
          background: "rgba(255, 255, 255, 0.2)",
        }}
      />
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={["/"]}
        items={menuItems}
        onClick={({ key }) => router.push(key)}
      />
    </Sider>
  );
};

export default SideNav;
