"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  List,
  Popconfirm,
  Space,
  notification,
  Row,
  Col,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Garden, gardenService } from "@/services/garden.service";
import { useAuth } from "@/contexts/AuthContext";

export default function GardenPage() {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingGarden, setEditingGarden] = useState<Garden | null>(null);
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);

  const loadGardens = async () => {
    try {
      const data = await gardenService.list();
      setGardens(data);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tải danh sách vườn",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGardens();
  }, []);

  const handleAddEdit = async (values: any) => {
    try {
      if (editingGarden) {
        await gardenService.update(editingGarden.id, {
          ...values,
          updated_at: new Date().toISOString(),
        });
        notification.success({ message: "Cập nhật vườn thành công" });
      } else {
        await gardenService.create({
          ...values,
          user_id: user?.id as string,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        notification.success({ message: "Thêm vườn mới thành công" });
      }
      setIsModalVisible(false);
      form.resetFields();
      setEditingGarden(null);
      loadGardens();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể lưu thông tin vườn",
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await gardenService.delete(id);
      notification.success({ message: "Xóa vườn thành công" });
      loadGardens();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể xóa vườn",
      });
    }
  };

  const showEditModal = (garden: Garden) => {
    setEditingGarden(garden);
    form.setFieldsValue(garden);
    setIsModalVisible(true);
  };

  const showAddModal = () => {
    setEditingGarden(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Quản lý vườn</h1>
        <Button
          className="w-100 mt-2"
          type="primary"
          icon={<PlusOutlined />}
          onClick={showAddModal}
        >
          Thêm vườn
        </Button>
      </div>

      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
        dataSource={gardens}
        loading={loading}
        renderItem={(garden) => (
          <List.Item>
            <Card
              actions={[
                <EditOutlined
                  key="edit"
                  onClick={() => showEditModal(garden)}
                />,
                <Popconfirm
                  title="Bạn có chắc muốn xóa vườn này?"
                  onConfirm={() => handleDelete(garden.id)}
                  okText="Có"
                  cancelText="Không"
                >
                  <DeleteOutlined key="delete" />
                </Popconfirm>,
              ]}
            >
              <Card.Meta
                title={garden.name}
                description={
                  <Space direction="vertical">
                    <div>Vị trí: {garden.location}</div>
                    <div>Diện tích: {garden.area} m²</div>
                    <div>Số luống: {garden.number_of_beds}</div>
                  </Space>
                }
              />
            </Card>
          </List.Item>
        )}
      />

      <Modal
        title={editingGarden ? "Sửa thông tin vườn" : "Thêm vườn mới"}
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setEditingGarden(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleAddEdit}>
          <Form.Item
            name="name"
            label="Tên vườn"
            rules={[{ required: true, message: "Vui lòng nhập tên vườn" }]}
          >
            <Input placeholder="Nhập tên vườn" />
          </Form.Item>

          <Form.Item
            name="location"
            label="Vị trí"
            rules={[{ required: true, message: "Vui lòng nhập vị trí vườn" }]}
          >
            <Input placeholder="Nhập vị trí vườn" />
          </Form.Item>

          <Row className="w-100" gutter={[16, 16]}>
            <Col span={12}>
              <Form.Item
                className="w-100"
                name="area"
                label="Diện tích (m²)"
                rules={[{ required: true, message: "Vui lòng nhập diện tích" }]}
              >
                <InputNumber
                  min={0}
                  className="w-100"
                  placeholder="Nhập diện tích vườn"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                className="w-100"
                name="number_of_beds"
                label="Số luống"
                rules={[{ required: true, message: "Vui lòng nhập số luống" }]}
              >
                <InputNumber
                  min={0}
                  className="w-100"
                  placeholder="Nhập số luống"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item className="mb-0">
            <Row className="w-100" gutter={16}>
              <Col span={12}>
                <Button
                  className="w-100"
                  onClick={() => {
                    setIsModalVisible(false);
                    setEditingGarden(null);
                    form.resetFields();
                  }}
                >
                  Hủy
                </Button>
              </Col>
              <Col span={12}>
                <Button className="w-100" type="primary" htmlType="submit">
                  {editingGarden ? "Cập nhật" : "Thêm mới"}
                </Button>
              </Col>
            </Row>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
}
