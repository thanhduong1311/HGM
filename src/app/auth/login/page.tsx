"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Form, Input, Button, Alert, Typography } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";

const { Text } = Typography;

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();

  const onFinish = async (values: {
    emailOrPhone: string;
    password: string;
  }) => {
    setError("");
    setLoading(true);

    try {
      await signIn({
        emailOrPhone: values.emailOrPhone,
        password: values.password,
      });
      router.push("/"); // Redirect to home page after successful login
    } catch (err: any) {
      setError(err.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-2xl font-bold text-center mb-8">Đăng nhập</h1>
      {error && (
        <Alert
          message="Lỗi đăng nhập"
          description={error}
          type="error"
          showIcon
          className="mb-6"
        />
      )}
      <Form
        name="login"
        initialValues={{ remember: true }}
        onFinish={onFinish}
        layout="vertical"
        size="large"
      >
        <Form.Item
          name="emailOrPhone"
          rules={[
            {
              required: true,
              message: "Vui lòng nhập email hoặc số điện thoại!",
            },
            {
              validator: (_, value) => {
                if (!value) return Promise.resolve();
                const isEmail = value.includes("@");
                const isPhone = /^[0-9]{10}$/.test(value);
                if (isEmail || isPhone) return Promise.resolve();
                return Promise.reject("Email hoặc số điện thoại không hợp lệ!");
              },
            },
          ]}
        >
          <Input
            prefix={<UserOutlined />}
            placeholder="Email hoặc số điện thoại"
          />
        </Form.Item>

        <Form.Item
          name="password"
          rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Mật khẩu"
            autoComplete="current-password"
          />
        </Form.Item>

        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            Đăng nhập
          </Button>
        </Form.Item>
      </Form>

      <div className="text-center">
        <Text className="text-gray-600">
          Chưa có tài khoản?{" "}
          <Link
            href="/auth/register"
            className="text-green-600 hover:underline"
          >
            Đăng ký
          </Link>
        </Text>
      </div>
    </>
  );
}
