"use client";

import {
  Layout,
  Avatar,
  Dropdown,
  Menu,
  Modal,
  Form,
  Input,
  message,
} from "antd";
import {
  UserOutlined,
  LogoutOutlined,
  KeyOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { authService } from "@/services/auth.service";

const { Header } = Layout;

const AppHeader = () => {
  const router = useRouter();
  const { user, signOut, session } = useAuth();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!user?.email) {
      message.error("Vui lòng đăng nhập lại để đổi mật khẩu");
      return;
    }

    try {
      setLoading(true);
      await authService.changePassword(
        values.currentPassword,
        values.newPassword
      );
      message.success("Đổi mật khẩu thành công");
      setIsModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error.message || "Đổi mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = async ({ key }: { key: string }) => {
    switch (key) {
      case "garden":
        router.push("/garden");
        break;
      case "change-password":
        setIsModalVisible(true);
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

  const userMenu = (
    <Menu
      onClick={handleMenuClick}
      items={[
        {
          key: "garden",
          icon: <InboxOutlined />,
          label: "Quản lý vườn",
        },
        {
          type: "divider",
        },
        {
          key: "change-password",
          icon: <KeyOutlined />,
          label: "Đổi mật khẩu",
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
      ]}
    />
  );

  return (
    <header
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
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          cursor: "pointer",
        }}
        onClick={() => router.push("/")}
      >
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
        <>
          <Dropdown
            overlay={userMenu}
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

          <Modal
            title="Đổi mật khẩu"
            open={isModalVisible}
            onOk={() => form.submit()}
            onCancel={() => {
              setIsModalVisible(false);
              form.resetFields();
            }}
            confirmLoading={loading}
            okText="Đổi mật khẩu"
            cancelText="Hủy"
          >
            <Form form={form} layout="vertical" onFinish={handleChangePassword}>
              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <Form.Item
                label="Xác nhận mật khẩu mới"
                name="confirmPassword"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu mới" },
                  { min: 6, message: "Mật khẩu phải có ít nhất 6 ký tự" },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("newPassword") === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(
                        new Error("Mật khẩu xác nhận không khớp")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Nhập lại mật khẩu mới" />
              </Form.Item>
            </Form>
          </Modal>
        </>
      ) : null}
    </header>
  );
};

export default AppHeader;
