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
  Tabs,
  Select,
  DatePicker,
  notification,
  Row,
  Col,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ImportOutlined,
  ExportOutlined,
} from "@ant-design/icons";
import {
  InventoryItem,
  InventoryCategory,
  InventoryTransaction,
  inventoryService,
} from "@/services/inventory.service";
import dayjs from "dayjs";

export default function InventoryPage() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<InventoryCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<
    InventoryTransaction[]
  >([]);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [loading, setLoading] = useState(true);
  const [itemModalVisible, setItemModalVisible] = useState(false);
  const [transactionModalVisible, setTransactionModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [itemForm] = Form.useForm();
  const [transactionForm] = Form.useForm();

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsData, categoriesData, transactionsData] = await Promise.all([
        inventoryService.listItems(),
        inventoryService.listCategories(),
        inventoryService.listTransactions(),
      ]);
      setInventoryItems(itemsData);
      setFilteredItems(itemsData);
      setCategories(categoriesData);
      setTransactions(transactionsData);
      setFilteredTransactions(transactionsData);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tải dữ liệu vật tư",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = [...inventoryItems];
    if (selectedCategory) {
      filtered = filtered.filter(
        (item) => item.category_id === selectedCategory
      );
    }
    setFilteredItems(filtered);
  }, [inventoryItems, selectedCategory]);

  useEffect(() => {
    let filtered = [...transactions];
    if (selectedDate) {
      filtered = filtered.filter((transaction) =>
        dayjs(transaction.date).isSame(selectedDate, "day")
      );
    }
    setFilteredTransactions(filtered);
  }, [transactions, selectedDate]);

  const handleAddEditItem = async (values: any) => {
    try {
      if (selectedItem) {
        await inventoryService.updateItem(selectedItem.id, values);
        notification.success({ message: "Cập nhật vật tư thành công" });
      } else {
        await inventoryService.createItem(values);
        notification.success({ message: "Thêm vật tư mới thành công" });
      }
      setItemModalVisible(false);
      itemForm.resetFields();
      setSelectedItem(null);
      loadData();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể lưu thông tin vật tư",
      });
    }
  };

  const handleAddTransaction = async (values: any) => {
    try {
      const transaction = {
        ...values,
        date: values.date.toISOString(),
        total: values.quantity * values.price,
      };
      console.log("Transaction data:", transaction); // Debug log
      await inventoryService.createTransaction(transaction);
      notification.success({ message: "Thêm nhập/xuất thành công" });
      setTransactionModalVisible(false);
      transactionForm.resetFields();
      loadData();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể thêm nhập/xuất",
      });
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await inventoryService.deleteItem(id);
      notification.success({ message: "Xóa vật tư thành công" });
      loadData();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể xóa vật tư",
      });
    }
  };

  const showEditItemModal = (item: InventoryItem) => {
    setSelectedItem(item);
    itemForm.setFieldsValue(item);
    setItemModalVisible(true);
  };

  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [categoryForm] = Form.useForm();
  const [editingCategory, setEditingCategory] =
    useState<InventoryCategory | null>(null);

  const handleAddEditCategory = async (values: any) => {
    try {
      await inventoryService.createCategory(values);
      notification.success({ message: "Thêm loại vật tư thành công" });
      setCategoryModalVisible(false);
      categoryForm.resetFields();
      loadData();
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể lưu thông tin loại vật tư",
      });
    }
  };

  const tabItems = [
    {
      key: "1",
      label: "Lịch sử nhập/xuất",
      children: (
        <div>
          <div className="d-flex justify-content-end mb-4">
            <DatePicker
              className="w-100"
              format="DD/MM/YYYY"
              placeholder="Chọn ngày xem lịch sử"
              allowClear
              value={selectedDate}
              onChange={(date) => setSelectedDate(date)}
            />
          </div>
          <List
            dataSource={filteredTransactions}
            loading={loading}
            renderItem={(transaction) => (
              <Card
                className="mb-4"
                style={{
                  backgroundColor:
                    transaction.type === "nhap" ? "#f6ffed" : "#fff7e6",
                  borderLeft: `4px solid ${
                    transaction.type === "nhap" ? "#52c41a" : "#faad14"
                  }`,
                  transition: "all 0.3s ease",
                }}
              >
                <Space direction="vertical" className="w-100">
                  <div className="d-flex justify-content-between">
                    <span className="fw-bold">{transaction.item?.name}</span>
                    <span>{dayjs(transaction.date).format("DD/MM/YYYY")}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>
                      Loại:{" "}
                      <span
                        style={{
                          color:
                            transaction.type === "nhap" ? "#52c41a" : "#faad14",
                          fontWeight: 500,
                        }}
                      >
                        {transaction.type === "nhap" ? "Nhập kho" : "Xuất kho"}
                      </span>
                    </span>
                    <span>
                      Số lượng: {transaction.quantity} {transaction.item?.unit}
                    </span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span>Đơn giá: {transaction.price.toLocaleString()}đ</span>
                    <span>
                      Thành tiền: {transaction.total.toLocaleString()}đ
                    </span>
                  </div>
                  {transaction.note && (
                    <div className="text-muted mt-2">
                      Ghi chú: {transaction.note}
                    </div>
                  )}
                </Space>
              </Card>
            )}
          />
        </div>
      ),
    },
    {
      key: "2",
      label: "Danh sách vật tư",
      children: (
        <div className="space-y-4">
          <Row gutter={[16, 16]} className="mb-4">
            <Col xs={12} sm={12} md={8} lg={6}>
              <Select
                className="w-100"
                placeholder="Lọc theo loại vật tư"
                allowClear
                value={selectedCategory}
                onChange={(value) => setSelectedCategory(value)}
              >
                {categories.map((category) => (
                  <Select.Option key={category.id} value={category.id}>
                    {category.name}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col
              xs={12}
              sm={12}
              md={16}
              lg={18}
              className="d-flex justify-content-end"
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => {
                  setSelectedItem(null);
                  itemForm.resetFields();
                  setItemModalVisible(true);
                }}
              >
                Thêm vật tư
              </Button>
            </Col>
          </Row>

          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
            dataSource={filteredItems}
            loading={loading}
            renderItem={(item: InventoryItem) => (
              <List.Item>
                <Card
                  actions={[
                    <Button
                      key="import"
                      icon={<ImportOutlined />}
                      onClick={() => {
                        setSelectedItem(item);
                        transactionForm.setFieldsValue({
                          item_id: item.id,
                          type: "nhap",
                        });
                        setTransactionModalVisible(true);
                      }}
                    >
                      Nhập
                    </Button>,
                    <Button
                      key="export"
                      icon={<ExportOutlined />}
                      onClick={() => {
                        setSelectedItem(item);
                        transactionForm.setFieldsValue({
                          item_id: item.id,
                          type: "xuat",
                        });
                        setTransactionModalVisible(true);
                      }}
                    >
                      Xuất
                    </Button>,
                    <EditOutlined
                      color="warning"
                      onClick={() => showEditItemModal(item)}
                    />,
                    <Popconfirm
                      title="Bạn có chắc muốn xóa vật tư này?"
                      onConfirm={() => handleDeleteItem(item.id)}
                      okText="Có"
                      cancelText="Không"
                    >
                      <DeleteOutlined key="delete" />
                    </Popconfirm>,
                  ]}
                >
                  <Card.Meta
                    title={item.name}
                    description={
                      <Space direction="vertical">
                        <div>Loại: {item.category?.name}</div>
                        <div>Đơn vị: {item.unit}</div>
                        <div>Tồn kho: {item.current_quantity}</div>
                      </Space>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        </div>
      ),
    },

    {
      key: "3",
      label: "Loại vật tư",
      children: (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button
              className="w-100 mb-2"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCategoryModalVisible(true);
              }}
            >
              Thêm loại vật tư
            </Button>
          </div>

          <List
            dataSource={categories}
            loading={loading}
            renderItem={(category: InventoryCategory) => (
              <Card className="mb-2">
                <div className="d-flex justify-content-between align-items-start">
                  <div>
                    <h3 className="fs-5 fw-medium">{category.name}</h3>
                    <p className="text-muted">{category.description}</p>
                  </div>
                </div>
              </Card>
            )}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="p-0">
      <h3>Quản lý kho vật tư</h3>
      <Tabs items={tabItems} />

      {/* Modal thêm loại vật tư */}
      <Modal
        title="Thêm loại vật tư mới"
        open={categoryModalVisible}
        onCancel={() => {
          setCategoryModalVisible(false);
          categoryForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleAddEditCategory}
        >
          <Form.Item
            name="name"
            label="Tên loại vật tư"
            rules={[
              { required: true, message: "Vui lòng nhập tên loại vật tư" },
            ]}
          >
            <Input placeholder="Nhập tên loại vật tư" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: "Vui lòng nhập mô tả" }]}
          >
            <Input.TextArea placeholder="Nhập mô tả" rows={4} />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-100 justify-end">
              <Button
                onClick={() => {
                  setCategoryModalVisible(false);
                  categoryForm.resetFields();
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

      {/* Modal thêm/sửa vật tư */}
      <Modal
        title={selectedItem ? "Sửa thông tin vật tư" : "Thêm vật tư mới"}
        open={itemModalVisible}
        onCancel={() => {
          setItemModalVisible(false);
          setSelectedItem(null);
          itemForm.resetFields();
        }}
        footer={null}
      >
        <Form form={itemForm} layout="vertical" onFinish={handleAddEditItem}>
          <Form.Item
            name="name"
            label="Tên vật tư"
            rules={[{ required: true, message: "Vui lòng nhập tên vật tư" }]}
          >
            <Input placeholder="Nhập tên vật tư" />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Loại vật tư"
            rules={[{ required: true, message: "Vui lòng chọn loại vật tư" }]}
          >
            <Select placeholder="Chọn loại vật tư">
              {categories.map((category) => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="unit"
            label="Đơn vị tính"
            rules={[{ required: true, message: "Vui lòng nhập đơn vị tính" }]}
          >
            <Input placeholder="Nhập đơn vị tính" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-100 justify-end">
              <Button
                onClick={() => {
                  setItemModalVisible(false);
                  setSelectedItem(null);
                  itemForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {selectedItem ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal nhập/xuất vật tư */}
      <Modal
        title={`${
          transactionForm.getFieldValue("type") === "nhap" ? "Nhập" : "Xuất"
        } vật tư`}
        open={transactionModalVisible}
        onCancel={() => {
          setTransactionModalVisible(false);
          transactionForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={transactionForm}
          layout="vertical"
          onFinish={handleAddTransaction}
        >
          <Form.Item name="item_id" hidden>
            <Input />
          </Form.Item>

          <Form.Item name="type" hidden>
            <Input />
          </Form.Item>

          <Form.Item
            name="date"
            label="Ngày nhập/xuất"
            rules={[{ required: true, message: "Vui lòng chọn ngày" }]}
          >
            <DatePicker className="w-100" format="DD/MM/YYYY" />
          </Form.Item>

          <Row className="w-100" gutter={[16, 16]}>
            <Col xs={8}>
              <Form.Item
                name="quantity"
                label="Số lượng"
                rules={[{ required: true, message: "Vui lòng nhập số lượng" }]}
              >
                <InputNumber
                  min={0}
                  className="w-100"
                  placeholder="Nhập số lượng"
                />
              </Form.Item>
            </Col>

            <Col xs={16}>
              <Form.Item
                name="price"
                label="Đơn giá"
                rules={[{ required: true, message: "Vui lòng nhập đơn giá" }]}
              >
                <InputNumber
                  min={0}
                  className="w-100"
                  placeholder="Nhập đơn giá"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="note" label="Ghi chú">
            <Input.TextArea placeholder="Nhập ghi chú" />
          </Form.Item>

          <Form.Item className="mb-0">
            <Space className="w-100 justify-end">
              <Button
                onClick={() => {
                  setTransactionModalVisible(false);
                  transactionForm.resetFields();
                }}
              >
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {transactionForm.getFieldValue("type") === "nhap"
                  ? "Nhập kho"
                  : "Xuất kho"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
