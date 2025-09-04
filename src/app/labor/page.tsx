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
  Row,
  Col,
  Tabs,
  Popconfirm,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { Worker, LaborRecord, workerService } from "@/services/worker.service";
import dayjs from "dayjs";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";
import styles from "./page.module.css";

export default function LaborPage() {
  // State
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [laborRecords, setLaborRecords] = useState<LaborRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [workerModalVisible, setWorkerModalVisible] = useState(false);
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [editingWorker, setEditingWorker] = useState<Worker | null>(null);
  const [workerForm] = Form.useForm();
  const [recordForm] = Form.useForm();

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [workersData, recordsData] = await Promise.all([
        workerService.listWorkers(),
        workerService.listLaborRecords(),
      ]);
      setWorkers(workersData);
      setLaborRecords(recordsData);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tải dữ liệu nhân công",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Worker handlers
  const handleWorkerSubmit = async (values: any) => {
    try {
      if (editingWorker) {
        await workerService.updateWorker(editingWorker.id, values);
        notification.success({ message: "Cập nhật người làm thành công" });
      } else {
        await workerService.createWorker(values);
        notification.success({ message: "Thêm người làm mới thành công" });
      }
      setWorkerModalVisible(false);
      workerForm.resetFields();
      setEditingWorker(null);
      loadData();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể lưu thông tin người làm",
      });
    }
  };

  const handleDeleteWorker = async (id: string) => {
    try {
      await workerService.deleteWorker(id);
      notification.success({ message: "Xóa người làm thành công" });
      loadData();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể xóa người làm",
      });
    }
  };

  // Labor record handlers
  const handleLaborRecordSubmit = async (values: any) => {
    try {
      const worker = workers.find((w) => w.id === values.worker_id);
      if (!worker) throw new Error("Không tìm thấy thông tin người làm");

      const record = {
        ...values,
        work_date: values.work_date.format("YYYY-MM-DD"),
        hourly_rate: worker.hourly_rate,
        total_amount: worker.hourly_rate * values.hours_worked,
      };

      await workerService.createLaborRecord(record);
      notification.success({ message: "Thêm bảng công thành công" });
      setRecordModalVisible(false);
      recordForm.resetFields();
      loadData();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể thêm bảng công",
      });
    }
  };

  const handlePaymentStatusChange = async (
    recordId: string,
    status: "chua_thanh_toan" | "da_thanh_toan"
  ) => {
    try {
      await workerService.updatePaymentStatus(recordId, status);
      notification.success({
        message: "Cập nhật trạng thái thanh toán thành công",
      });
      loadData();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể cập nhật trạng thái thanh toán",
      });
    }
  };

  // No need for table columns as we're using List and Card components

  // Tab items
  const tabItems = [
    {
      key: "1",
      label: "Danh sách người làm",
      children: (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingWorker(null);
                workerForm.resetFields();
                setWorkerModalVisible(true);
              }}
            >
              Thêm người làm
            </Button>
          </div>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
            dataSource={workers}
            loading={loading}
            renderItem={(worker: Worker) => (
              <List.Item>
                <Card
                  actions={[
                    <Button
                      key="edit"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingWorker(worker);
                        workerForm.setFieldsValue(worker);
                        setWorkerModalVisible(true);
                      }}
                    />,
                    <Popconfirm
                      title="Bạn có chắc muốn xóa người làm này?"
                      onConfirm={() => handleDeleteWorker(worker.id)}
                      okText="Có"
                      cancelText="Không"
                    >
                      <Button key="delete" danger icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]}
                >
                  <Space direction="vertical" className="w-full">
                    <div className="font-semibold">{worker.name}</div>
                    {worker.phone && <div>SĐT: {worker.phone}</div>}
                    <div>
                      Giá/giờ: {worker.hourly_rate.toLocaleString("vi-VN")}đ
                    </div>
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
      label: "Bảng công",
      children: (
        <div className="space-y-4">
          <div className="flex justify-end mb-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setRecordModalVisible(true)}
            >
              Thêm bảng công
            </Button>
          </div>
          <List
            dataSource={laborRecords}
            loading={loading}
            renderItem={(record: LaborRecord) => (
              <Card className="mb-4">
                <Space direction="vertical" className="w-full">
                  <div className="flex justify-between">
                    <span className="font-semibold">{record.worker?.name}</span>
                    <span>{dayjs(record.work_date).format("DD/MM/YYYY")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Số giờ: {record.hours_worked}</span>
                    <span>
                      Thành tiền: {record.total_amount.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Trạng thái:</span>
                    <Select
                      value={record.payment_status}
                      style={{ width: 140 }}
                      onChange={(value: "chua_thanh_toan" | "da_thanh_toan") =>
                        handlePaymentStatusChange(record.id, value)
                      }
                      options={[
                        { value: "chua_thanh_toan", label: "Chưa Trả Công" },
                        { value: "da_thanh_toan", label: "Đã Trả Công" },
                      ]}
                    />
                  </div>
                  {record.note && <div>Ghi chú: {record.note}</div>}
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
        <div className="flex-grow overflow-auto">
          <Card bodyStyle={{ padding: "12px" }}>
            <Tabs items={tabItems} />
          </Card>
        </div>

        {/* Modal thêm/sửa người làm */}
        <Modal
          title={
            editingWorker ? "Sửa thông tin người làm" : "Thêm người làm mới"
          }
          open={workerModalVisible}
          onCancel={() => {
            setWorkerModalVisible(false);
            setEditingWorker(null);
            workerForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={workerForm}
            layout="vertical"
            onFinish={handleWorkerSubmit}
          >
            <Form.Item
              name="name"
              label="Tên"
              rules={[{ required: true, message: "Vui lòng nhập tên!" }]}
            >
              <Input />
            </Form.Item>
            <Form.Item name="phone" label="Số điện thoại">
              <Input />
            </Form.Item>
            <Form.Item
              name="hourly_rate"
              label="Giá theo giờ"
              rules={[
                { required: true, message: "Vui lòng nhập giá theo giờ!" },
              ]}
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

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button
                  onClick={() => {
                    setWorkerModalVisible(false);
                    setEditingWorker(null);
                    workerForm.resetFields();
                  }}
                >
                  Hủy
                </Button>
                <Button type="primary" htmlType="submit">
                  {editingWorker ? "Cập nhật" : "Thêm mới"}
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal thêm bảng công */}
        <Modal
          title="Thêm bảng công"
          open={recordModalVisible}
          onCancel={() => {
            setRecordModalVisible(false);
            recordForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={recordForm}
            layout="vertical"
            onFinish={handleLaborRecordSubmit}
          >
            <Form.Item
              name="worker_id"
              label="Người làm"
              rules={[{ required: true, message: "Vui lòng chọn người làm!" }]}
            >
              <Select>
                {workers.map((worker) => (
                  <Select.Option key={worker.id} value={worker.id}>
                    {worker.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="work_date"
              label="Ngày làm"
              rules={[{ required: true, message: "Vui lòng chọn ngày làm!" }]}
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>
            <Form.Item
              name="hours_worked"
              label="Số giờ làm"
              rules={[{ required: true, message: "Vui lòng nhập số giờ làm!" }]}
            >
              <InputNumber className="w-full" min={0} step={0.5} />
            </Form.Item>
            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea />
            </Form.Item>

            <Form.Item className="mb-0">
              <Space className="w-full justify-end">
                <Button
                  onClick={() => {
                    setRecordModalVisible(false);
                    recordForm.resetFields();
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
