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

  return (
    <div style={{ paddingTop: "72px", paddingBottom: "80px" }}>
      <AppHeader />
      <div className="px-4">
        <Card bodyStyle={{ padding: "12px" }}>
          <div className="flex justify-end mb-4">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalVisible(true)}
            >
              Thêm hoạt động chăm sóc
            </Button>
          </div>

          <List
            dataSource={activities}
            loading={loading}
            renderItem={(activity) => (
              <Card className="mb-4">
                <Space direction="vertical" className="w-full">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-medium">
                        {activity.activity_type === "bon_phan"
                          ? "Bón phân"
                          : "Xịt thuốc"}
                      </h3>
                      <p className="text-gray-500">
                        Vườn: {activity.garden?.name}
                      </p>
                    </div>
                    <div className="text-right">
                      <div>
                        {dayjs(activity.activity_date).format("DD/MM/YYYY")}
                      </div>
                      <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => handleDelete(activity.id)}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-2 mt-2">
                    {activity.details?.map(
                      (detail: CareActivity["details"][0]) => (
                        <div
                          key={detail.id}
                          className="flex justify-between mb-1"
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
                    <div className="border-t pt-2 mt-2">
                      <p className="text-gray-500">{activity.note}</p>
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
            <div className="grid grid-cols-2 gap-4">
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

              <Form.Item
                name="activity_type"
                label="Loại hoạt động"
                rules={[
                  { required: true, message: "Vui lòng chọn loại hoạt động!" },
                ]}
              >
                <Select placeholder="Chọn loại hoạt động">
                  <Select.Option value="bon_phan">Bón phân</Select.Option>
                  <Select.Option value="xit_thuoc">Xịt thuốc</Select.Option>
                </Select>
              </Form.Item>
            </div>

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
                      className="bg-gray-50"
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
              <Space className="w-full justify-end">
                <Button
                  onClick={() => {
                    setModalVisible(false);
                    form.resetFields();
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
    </div>
  );
}
