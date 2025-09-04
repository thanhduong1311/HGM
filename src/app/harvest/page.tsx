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
  Space,
  DatePicker,
  Select,
  notification,
  Tabs,
  Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import styles from "./page.module.css";
import { CropType, Harvest, harvestService } from "@/services/harvest.service";

const { TextArea } = Input;

export default function HarvestPage() {
  // State
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [harvests, setHarvests] = useState<Harvest[]>([]);
  const [loading, setLoading] = useState(true);
  const [cropTypeModalVisible, setCropTypeModalVisible] = useState(false);
  const [harvestModalVisible, setHarvestModalVisible] = useState(false);
  const [editingCropType, setEditingCropType] = useState<CropType | null>(null);
  const [cropTypeForm] = Form.useForm();
  const [harvestForm] = Form.useForm();

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [cropTypesData, harvestsData] = await Promise.all([
        harvestService.listCropTypes(),
        harvestService.listHarvests(),
      ]);
      setCropTypes(cropTypesData);
      setHarvests(harvestsData);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tải dữ liệu thu hoạch",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Crop Type handlers
  const handleCropTypeSubmit = async (values: any) => {
    try {
      if (editingCropType) {
        await harvestService.updateCropType(editingCropType.id, values);
        notification.success({ message: "Cập nhật loại cây trồng thành công" });
      } else {
        await harvestService.createCropType(values);
        notification.success({ message: "Thêm loại cây trồng mới thành công" });
      }
      setCropTypeModalVisible(false);
      cropTypeForm.resetFields();
      setEditingCropType(null);
      loadData();
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể lưu thông tin loại cây trồng",
      });
    }
  };

  const handleDeleteCropType = async (id: string) => {
    try {
      await harvestService.deleteCropType(id);
      notification.success({ message: "Xóa loại cây trồng thành công" });
      loadData();
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể xóa loại cây trồng",
      });
    }
  };

  // Harvest handlers
  const handleHarvestSubmit = async (values: any) => {
    try {
      const cropType = cropTypes.find((ct) => ct.id === values.crop_type_id);
      if (!cropType) throw new Error("Không tìm thấy thông tin loại cây trồng");

      const harvest = {
        ...values,
        harvest_date: values.harvest_date.format("YYYY-MM-DD"),
        total_amount: values.quantity * values.price_per_unit,
      };

      await harvestService.createHarvest(harvest);
      notification.success({ message: "Thêm thu hoạch thành công" });
      setHarvestModalVisible(false);
      harvestForm.resetFields();
      loadData();
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể thêm thu hoạch",
      });
    }
  };

  const handleDeleteHarvest = async (id: string) => {
    try {
      await harvestService.deleteHarvest(id);
      notification.success({ message: "Xóa thu hoạch thành công" });
      loadData();
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể xóa thu hoạch",
      });
    }
  };

  // Tab items
  const tabItems = [
    {
      key: "1",
      label: "Loại cây trồng",
      children: (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingCropType(null);
                cropTypeForm.resetFields();
                setCropTypeModalVisible(true);
              }}
            >
              Thêm loại cây
            </Button>
          </div>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
            dataSource={cropTypes}
            loading={loading}
            renderItem={(cropType: CropType) => (
              <List.Item>
                <Card
                  className={styles.card}
                  actions={[
                    <Button
                      key="edit"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingCropType(cropType);
                        cropTypeForm.setFieldsValue(cropType);
                        setCropTypeModalVisible(true);
                      }}
                    />,
                    <Popconfirm
                      title="Bạn có chắc muốn xóa loại cây này?"
                      onConfirm={() => handleDeleteCropType(cropType.id)}
                      okText="Có"
                      cancelText="Không"
                    >
                      <Button key="delete" danger icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]}
                >
                  <Space direction="vertical" className="w-full">
                    <div className="font-semibold">{cropType.name}</div>
                    {cropType.description && (
                      <div className="text-gray-500">
                        {cropType.description}
                      </div>
                    )}
                  </Space>
                </Card>
              </List.Item>
            )}
          />
        </div>
      ),
    },
    {
      key: "2",
      label: "Thu hoạch",
      children: (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setHarvestModalVisible(true)}
            >
              Thêm thu hoạch
            </Button>
          </div>
          <List
            dataSource={harvests}
            loading={loading}
            renderItem={(harvest: Harvest) => (
              <Card className={styles.card}>
                <Space direction="vertical" className="w-full">
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {harvest.crop_type?.name}
                    </span>
                    <span>
                      {dayjs(harvest.harvest_date).format("DD/MM/YYYY")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>
                      Số lượng: {harvest.quantity} {harvest.unit}
                    </span>
                    <span>
                      Đơn giá: {harvest.price_per_unit.toLocaleString("vi-VN")}
                      đ/{harvest.unit}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>
                      Thành tiền: {harvest.total_amount.toLocaleString("vi-VN")}
                      đ
                    </span>
                    <Popconfirm
                      title="Bạn có chắc muốn xóa thu hoạch này?"
                      onConfirm={() => handleDeleteHarvest(harvest.id)}
                      okText="Có"
                      cancelText="Không"
                    >
                      <Button danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                  </div>
                  {harvest.note && <div>Ghi chú: {harvest.note}</div>}
                </Space>
              </Card>
            )}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <AppHeader />
      <div className={styles.page}>
        <Card bodyStyle={{ padding: "12px" }}>
          <Tabs items={tabItems} />
        </Card>

        {/* Modal thêm/sửa loại cây trồng */}
        <Modal
          title={
            editingCropType
              ? "Sửa thông tin loại cây"
              : "Thêm loại cây trồng mới"
          }
          open={cropTypeModalVisible}
          onCancel={() => {
            setCropTypeModalVisible(false);
            setEditingCropType(null);
            cropTypeForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={cropTypeForm}
            layout="vertical"
            onFinish={handleCropTypeSubmit}
          >
            <Form.Item
              name="name"
              label="Tên loại cây"
              rules={[
                { required: true, message: "Vui lòng nhập tên loại cây!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="description" label="Mô tả">
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button
                  onClick={() => {
                    setCropTypeModalVisible(false);
                    setEditingCropType(null);
                    cropTypeForm.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingCropType ? "Cập nhật" : "Thêm mới"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal thêm thu hoạch */}
        <Modal
          title="Thêm thu hoạch"
          open={harvestModalVisible}
          onCancel={() => {
            setHarvestModalVisible(false);
            harvestForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={harvestForm}
            layout="vertical"
            onFinish={handleHarvestSubmit}
          >
            <Form.Item
              name="crop_type_id"
              label="Loại cây"
              rules={[{ required: true, message: "Vui lòng chọn loại cây!" }]}
            >
              <Select>
                {cropTypes.map((cropType) => (
                  <Select.Option key={cropType.id} value={cropType.id}>
                    {cropType.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="harvest_date"
              label="Ngày thu hoạch"
              rules={[
                { required: true, message: "Vui lòng chọn ngày thu hoạch!" },
              ]}
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item
              name="quantity"
              label="Số lượng"
              rules={[{ required: true, message: "Vui lòng nhập số lượng!" }]}
            >
              <InputNumber className="w-full" min={0} step={0.1} />
            </Form.Item>
            <Form.Item
              name="unit"
              label="Đơn vị"
              rules={[{ required: true, message: "Vui lòng nhập đơn vị!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="price_per_unit"
              label="Đơn giá"
              rules={[{ required: true, message: "Vui lòng nhập đơn giá!" }]}
            >
              <InputNumber
                className="w-full"
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
                parser={(value) => value!.replace(/\$\s?|(,*)/g, "")}
                step={1000}
              />
            </Form.Item>
            <Form.Item name="note" label="Ghi chú">
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button
                  onClick={() => {
                    setHarvestModalVisible(false);
                    harvestForm.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  Thêm mới
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        <BottomNav />
      </div>
    </>
  );
}
