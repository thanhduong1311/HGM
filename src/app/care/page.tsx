"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  List,
  Space,
  DatePicker,
  InputNumber,
  Row,
  Col,
  Popconfirm,
} from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

import { CareActivity, careService } from "@/services/care.service";
import { InventoryItem, inventoryService } from "@/services/inventory.service";
import { showError, showSuccess } from "@/components/MessageProvider";

export default function CarePage() {
  const [activities, setActivities] = useState<CareActivity[]>([]);
  const [gardens, setGardens] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  const loadData = async () => {
    try {
      setLoading(true);
      const [activitiesData, gardensData, itemsData] = await Promise.all([
        careService.listActivities(),
        careService.listGardens(),
        inventoryService.listItems(),
      ]);
      setActivities(activitiesData);
      setGardens(gardensData);
      setInventoryItems(itemsData);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      const activity = {
        garden_id: values.garden_id,
        activity_type: values.activity_type,
        activity_date: values.activity_date.toISOString(),
        note: values.note,
      };

      const details =
        values.details?.map((detail: any) => ({
          inventory_item_id: detail.inventory_item_id,
          quantity_used: detail.quantity_used,
          unit:
            inventoryItems.find((item) => item.id === detail.inventory_item_id)
              ?.unit || "",
        })) || [];

      await careService.createActivity(activity, details);

      showSuccess("Thêm hoạt động chăm sóc thành công");
      setModalVisible(false);
      form.resetFields();
      loadData();
    } catch (error: any) {
      showError(error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await careService.deleteActivity(id);
      showSuccess("Xóa hoạt động chăm sóc thành công");
      loadData();
    } catch (error: any) {
      showError(error);
    }
  };

  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);

  const filteredActivities = activities.filter((activity) => {
    if (!selectedDate) return true;
    return dayjs(activity.activity_date).isSame(selectedDate, "day");
  });

  return (
    <div style={{ paddingTop: "72px", paddingBottom: "80px" }}>
      <AppHeader />
      <div className="">
        <Card>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <DatePicker
              className="w-25"
              format="DD/MM/YYYY"
              placeholder="Lọc theo ngày"
              allowClear
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
            />
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              Thêm hoạt động chăm sóc
            </Button>
          </div>

          <List
            dataSource={filteredActivities}
            loading={loading}
            renderItem={(activity) => (
              <Card className="mb-4">
                <Space direction="vertical" className="w-100">
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <h3 className="fs-5 fw-medium">
                        {activity.activity_type === "bon_phan"
                          ? "Bón phân"
                          : "Xịt thuốc"}
                      </h3>
                      <p className="text-muted">
                        Vườn: {activity.garden?.name}
                      </p>
                    </div>
                    <div className="text-end">
                      <div>
                        {dayjs(activity.activity_date).format("DD/MM/YYYY")}
                      </div>
                      <Popconfirm
                        title="Xác nhận xóa"
                        description="Bạn có chắc muốn xóa hoạt động chăm sóc này?"
                        onConfirm={() => handleDelete(activity.id)}
                        okText="Có"
                        cancelText="Không"
                      >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </div>
                  </div>

                  <div className="border-top pt-2 mt-2">
                    {activity.details?.map(
                      (detail: CareActivity["details"][0]) => (
                        <div
                          key={detail.id}
                          className="d-flex justify-content-between mb-1"
                        >
                          <span>{detail.inventory_item?.name}</span>
                          <span>
                            {detail.quantity_used} {detail.inventory_item?.unit}
                          </span>
                        </div>
                      )
                    )}
                  </div>

                  {activity.note && (
                    <div className="border-top pt-2 mt-2">
                      <p className="text-muted">{activity.note}</p>
                    </div>
                  )}
                </Space>
              </Card>
            )}
          />
        </Card>

        {/* Modal thêm hoạt động */}
        <Modal
          title="Thêm hoạt động chăm sóc"
          open={modalVisible}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          footer={null}
          width={800}
        >
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <Form.Item
                  name="garden_id"
                  label="Vườn"
                  rules={[{ required: true, message: "Vui lòng chọn vườn!" }]}
                >
                  <Select placeholder="Chọn vườn">
                    {gardens.map((garden) => (
                      <Select.Option key={garden.id} value={garden.id}>
                        {garden.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>

              <Col xs={24} sm={12}>
                <Form.Item
                  name="activity_type"
                  label="Loại hoạt động"
                  rules={[
                    {
                      required: true,
                      message: "Vui lòng chọn loại hoạt động!",
                    },
                  ]}
                >
                  <Select placeholder="Chọn loại hoạt động">
                    <Select.Option value="bon_phan">Bón phân</Select.Option>
                    <Select.Option value="xit_thuoc">Xịt thuốc</Select.Option>
                  </Select>
                </Form.Item>
              </Col>
            </Row>

            <Form.Item
              name="activity_date"
              label="Ngày thực hiện"
              rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
              initialValue={dayjs()}
            >
              <DatePicker className="w-full" format="DD/MM/YYYY" />
            </Form.Item>

            <Form.List name="details" initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <div className="space-y-4">
                  <div className="font-medium mb-2">Chi tiết sử dụng:</div>
                  {fields.map(({ key, name, ...restField }) => (
                    <Card
                      key={key}
                      size="small"
                      className="bg-gray-50 mb-2"
                      extra={
                        fields.length > 1 && (
                          <DeleteOutlined
                            onClick={() => remove(name)}
                            className="text-red-500"
                          />
                        )
                      }
                    >
                      <div className="grid grid-cols-2 gap-4">
                        <Form.Item
                          {...restField}
                          name={[name, "inventory_item_id"]}
                          label="Vật tư"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng chọn vật tư!",
                            },
                          ]}
                        >
                          <Select
                            showSearch
                            placeholder="Chọn vật tư"
                            optionFilterProp="children"
                          >
                            {inventoryItems.map((item) => (
                              <Select.Option key={item.id} value={item.id}>
                                {item.name} ({item.current_quantity} {item.unit}
                                )
                              </Select.Option>
                            ))}
                          </Select>
                        </Form.Item>

                        <Form.Item
                          {...restField}
                          name={[name, "quantity_used"]}
                          label="Số lượng"
                          rules={[
                            {
                              required: true,
                              message: "Vui lòng nhập số lượng!",
                            },
                          ]}
                        >
                          <InputNumber
                            className="w-full"
                            min={0}
                            placeholder="Nhập số lượng"
                          />
                        </Form.Item>
                      </div>
                    </Card>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                  >
                    Thêm vật tư
                  </Button>
                </div>
              )}
            </Form.List>

            <Form.Item name="note" label="Ghi chú">
              <Input.TextArea rows={4} placeholder="Nhập ghi chú nếu có" />
            </Form.Item>

            <Form.Item className="mb-0">
              <Row className="w-100" gutter={[16, 16]}>
                <Col span={12}>
                  <Button
                    className="w-100"
                    onClick={() => {
                      setModalVisible(false);
                      form.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                </Col>
                <Col span={12}>
                  <Button className="w-100" type="primary" htmlType="submit">
                    Thêm mới
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Modal>

        <BottomNav />
      </div>
    </div>
  );
}
