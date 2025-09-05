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
  Divider,
  Row,
  Col,
} from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";

dayjs.extend(isBetween);
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

import styles from "./page.module.css";
import { Customer, Order, orderService } from "@/services/order.service";
import { CropType, harvestService } from "@/services/harvest.service";

const { TextArea } = Input;

export default function OrderPage() {
  // State
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [cropTypes, setCropTypes] = useState<CropType[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [orderModalVisible, setOrderModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(null);
  const [customerForm] = Form.useForm();
  const [orderForm] = Form.useForm();

  // Load data
  const loadData = async () => {
    try {
      setLoading(true);
      const [customersData, ordersData, cropTypesData] = await Promise.all([
        orderService.listCustomers(),
        orderService.listOrders(),
        harvestService.listCropTypes(),
      ]);
      setCustomers(customersData);
      setOrders(ordersData);
      setFilteredOrders(ordersData);
      setCropTypes(cropTypesData);
    } catch (error) {
      notification.error({
        message: "Lỗi",
        description: "Không thể tải dữ liệu đơn hàng",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter orders based on selected date
  useEffect(() => {
    let filtered = [...orders];

    // Filter by date
    if (selectedDate) {
      filtered = filtered.filter((order) => {
        const orderDate = dayjs(order.order_date);
        return (
          orderDate.format("YYYY-MM-DD") === selectedDate.format("YYYY-MM-DD")
        );
      });
    }

    setFilteredOrders(filtered);
  }, [orders, selectedDate]);

  // Customer handlers
  const handleCustomerSubmit = async (values: any) => {
    try {
      if (editingCustomer) {
        await orderService.updateCustomer(editingCustomer.id, values);
        notification.success({ message: "Cập nhật khách hàng thành công" });
      } else {
        await orderService.createCustomer(values);
        notification.success({ message: "Thêm khách hàng mới thành công" });
      }
      setCustomerModalVisible(false);
      customerForm.resetFields();
      setEditingCustomer(null);
      loadData();
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể lưu thông tin khách hàng",
      });
    }
  };

  const handleDeleteCustomer = async (id: string) => {
    try {
      await orderService.deleteCustomer(id);
      notification.success({ message: "Xóa khách hàng thành công" });
      loadData();
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể xóa khách hàng",
      });
    }
  };

  // Order handlers
  const handleOrderSubmit = async (values: any) => {
    try {
      const order = {
        customer_id: values.customer_id,
        order_date: values.order_date.format("YYYY-MM-DD"),
        delivery_date: values.delivery_date.format("YYYY-MM-DD"),
        shipping_fee: values.shipping_fee,
        shipping_type: values.shipping_type,
        deposit_amount: values.deposit_amount,
        deposit_date: values.deposit_date?.format("YYYY-MM-DD"),
        note: values.note,
        items: values.items.map((item: any) => ({
          crop_type_id: item.crop_type_id,
          quantity: item.quantity,
          unit: item.unit,
          price_per_unit: item.price_per_unit,
        })),
      };

      await orderService.createOrder(order);

      notification.success({ message: "Tạo đơn hàng thành công" });
      setOrderModalVisible(false);
      orderForm.resetFields();
      loadData();
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể tạo đơn hàng",
      });
    }
  };

  const handleDeleteOrder = async (id: string) => {
    try {
      await orderService.deleteOrder(id);
      notification.success({ message: "Xóa đơn hàng thành công" });
      loadData();
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể xóa đơn hàng",
      });
    }
  };

  const handleOrderStatusChange = async (
    orderId: string,
    status: Order["status"]
  ) => {
    try {
      await orderService.updateOrderStatus(orderId, status);
      notification.success({ message: "Cập nhật trạng thái thành công" });
      loadData();
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể cập nhật trạng thái",
      });
    }
  };

  const handlePaymentStatusChange = async (
    orderId: string,
    status: Order["payment_status"],
    depositAmount?: number,
    depositDate?: string
  ) => {
    try {
      await orderService.updatePaymentStatus(orderId, {
        payment_status: status,
        deposit_amount: depositAmount,
        deposit_date: depositDate,
      });
      notification.success({ message: "Cập nhật thanh toán thành công" });
      loadData();
    } catch (error: any) {
      notification.error({
        message: "Lỗi",
        description: error.message || "Không thể cập nhật thanh toán",
      });
    }
  };

  const getStatusTag = (status: Order["status"]) => {
    const statusConfig = {
      moi: { className: styles.new, text: "Mới" },
      xac_nhan: { className: styles.confirmed, text: "Xác nhận" },
      dang_giao: { className: styles.delivering, text: "Đang giao" },
      hoan_thanh: { className: styles.completed, text: "Hoàn thành" },
    };

    const config = statusConfig[status];
    return (
      <span className={`${styles.statusTag} ${config.className}`}>
        {config.text}
      </span>
    );
  };

  const getPaymentTag = (status: Order["payment_status"]) => {
    const paymentConfig = {
      chua_coc: { className: styles.unpaid, text: "Chưa cọc" },
      da_coc: { className: styles.deposited, text: "Đã cọc" },
      da_thanh_toan: { className: styles.paid, text: "Đã thanh toán" },
    };

    const config = paymentConfig[status];
    return (
      <span className={`${styles.paymentTag} ${config.className}`}>
        {config.text}
      </span>
    );
  };

  // Tab items
  const tabItems = [
    {
      key: "1",
      label: "Đơn hàng",
      children: (
        <div className="space-y-4 mb-5">
          <Row gutter={16} className="w-100 mb-2">
            <Col span={12}>
              <DatePicker
                className="w-full"
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                allowClear
                value={selectedDate}
                onChange={(date) => {
                  setSelectedDate(date);
                }}
              />
            </Col>
            <Col span={12}>
              <Button
                className="w-100"
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setOrderModalVisible(true)}
              >
                Tạo đơn hàng
              </Button>
            </Col>
          </Row>
          <List
            dataSource={filteredOrders}
            loading={loading}
            renderItem={(order: Order) => (
              <Card className={styles.card}>
                <Space direction="vertical" className="w-full">
                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <span className="font-semibold text-lg mr-2">
                        {order.customer?.name}
                      </span>
                      {getStatusTag(order.status)}
                    </div>
                    <div>{dayjs(order.order_date).format("DD/MM/YYYY")}</div>
                  </div>

                  <Divider style={{ margin: "0px 0" }} />

                  <div className="grid grid-cols-2 gap-2 mb-1">
                    <div>
                      <span className="text-gray-500">Giao hàng:</span>{" "}
                      {dayjs(order.delivery_date).format("DD/MM/YYYY")}
                    </div>
                    <div>
                      <span className="text-gray-500">Ship:</span>{" "}
                      {order.shipping_type === "nha_vuon_chiu"
                        ? "Nhà vườn"
                        : "Khách hàng"}
                    </div>
                  </div>

                  <Divider style={{ margin: "8px 0" }} />
                  <span>Sản phẩm:</span>
                  <div className="mb-1">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="d-flex justify-content-between mb-2"
                      >
                        <span className="text-gray-700">
                          {item.crop_type?.name}
                        </span>
                        <span className="font-medium">
                          {item.quantity} {item.unit} x{" "}
                          {item.price_per_unit.toLocaleString("vi-VN")}đ
                        </span>
                      </div>
                    ))}
                  </div>

                  <Divider style={{ margin: "8px 0" }} />

                  <div className="space-y-2">
                    <div className="d-flex justify-content-between items-center text-gray-500">
                      <span>Tạm tính:</span>
                      <span>{order.sub_total.toLocaleString("vi-VN")}đ</span>
                    </div>
                    {order.shipping_type === "nha_vuon_chiu" &&
                      order.shipping_fee > 0 && (
                        <div className="d-flex justify-content-between items-center text-gray-500">
                          <span>Ship:</span>
                          <span>
                            {order.shipping_fee.toLocaleString("vi-VN")}đ
                          </span>
                        </div>
                      )}
                    <div className="d-flex justify-content-between items-center font-bold text-lg">
                      <span>Tổng:</span>
                      <span>{order.total_amount.toLocaleString("vi-VN")}đ</span>
                    </div>
                    <div className="d-flex justify-content-between items-center text-gray-500">
                      <span>Đã cọc:</span>
                      <span>
                        {order.deposit_amount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="d-flex justify-content-between items-center text-gray-500 w-100">
                      <span>Còn lại:</span>
                      <span>
                        {order.remaining_amount.toLocaleString("vi-VN")}đ
                      </span>
                    </div>
                    <div className="d-flex justify-content-between items-center">
                      <span>Trạng thái thanh toán:</span>
                      <span>{getPaymentTag(order.payment_status)}</span>
                    </div>
                  </div>

                  <Row className="w-100" gutter={[16, 16]}>
                    <Col span={11}>
                      {" "}
                      <Select
                        value={order.status}
                        style={{ width: 120 }}
                        onChange={(value) =>
                          handleOrderStatusChange(order.id, value)
                        }
                      >
                        <Select.Option value="moi">Mới</Select.Option>
                        <Select.Option value="xac_nhan">Xác nhận</Select.Option>
                        <Select.Option value="dang_giao">
                          Đang giao
                        </Select.Option>
                        <Select.Option value="hoan_thanh">
                          Hoàn thành
                        </Select.Option>
                      </Select>
                    </Col>
                    <Col span={11}>
                      <Select
                        value={order.payment_status}
                        style={{ width: 120 }}
                        onChange={(value) =>
                          handlePaymentStatusChange(order.id, value)
                        }
                      >
                        <Select.Option value="chua_coc">Chưa cọc</Select.Option>
                        <Select.Option value="da_coc">Đã cọc</Select.Option>
                        <Select.Option value="da_thanh_toan">
                          Đã thanh toán
                        </Select.Option>
                      </Select>
                    </Col>

                    <Col span={2}>
                      <Popconfirm
                        title="Bạn có chắc muốn xóa đơn hàng này?"
                        onConfirm={() => handleDeleteOrder(order.id)}
                        okText="Có"
                        cancelText="Không"
                      >
                        <Button danger icon={<DeleteOutlined />} />
                      </Popconfirm>
                    </Col>
                  </Row>
                </Space>
              </Card>
            )}
          />
        </div>
      ),
    },
    {
      key: "2",
      label: "Khách hàng",
      children: (
        <div className="space-y-4 mb-5">
          <div className="flex justify-end mb-4">
            <Button
              className="w-100"
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingCustomer(null);
                customerForm.resetFields();
                setCustomerModalVisible(true);
              }}
            >
              Thêm khách hàng
            </Button>
          </div>
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3, xl: 3, xxl: 4 }}
            dataSource={customers}
            loading={loading}
            renderItem={(customer: Customer) => (
              <List.Item>
                <Card
                  className={styles.card}
                  actions={[
                    <Button
                      key="edit"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingCustomer(customer);
                        customerForm.setFieldsValue(customer);
                        setCustomerModalVisible(true);
                      }}
                    />,
                    <Popconfirm
                      title="Bạn có chắc muốn xóa khách hàng này?"
                      onConfirm={() => handleDeleteCustomer(customer.id)}
                      okText="Có"
                      cancelText="Không"
                    >
                      <Button key="delete" danger icon={<DeleteOutlined />} />
                    </Popconfirm>,
                  ]}
                >
                  <Space direction="vertical" className="w-full">
                    <div className="font-semibold">{customer.name}</div>
                    <div>{customer.phone}</div>
                    <div className="text-gray-500">{customer.address}</div>
                  </Space>
                </Card>
              </List.Item>
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
        <Card>
          <h3>Quản lý đơn hàng</h3>

          <Tabs items={tabItems} />
        </Card>

        {/* Modal thêm/sửa khách hàng */}
        <Modal
          title={
            editingCustomer ? "Sửa thông tin khách hàng" : "Thêm khách hàng mới"
          }
          open={customerModalVisible}
          onCancel={() => {
            setCustomerModalVisible(false);
            setEditingCustomer(null);
            customerForm.resetFields();
          }}
          footer={null}
        >
          <Form
            form={customerForm}
            layout="vertical"
            onFinish={handleCustomerSubmit}
          >
            <Form.Item
              name="name"
              label="Tên khách hàng"
              rules={[
                { required: true, message: "Vui lòng nhập tên khách hàng!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="phone"
              label="Số điện thoại"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại!" },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="address"
              label="Địa chỉ"
              rules={[{ required: true, message: "Vui lòng nhập địa chỉ!" }]}
            >
              <TextArea rows={3} />
            </Form.Item>

            <Form.Item className="mb-0">
              <Row className="w-100" gutter={[16, 16]}>
                <Col span={12}>
                  <Button
                    className="w-100"
                    onClick={() => {
                      setCustomerModalVisible(false);
                      setEditingCustomer(null);
                      customerForm.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                </Col>
                <Col span={12}>
                  <Button className="w-100" type="primary" htmlType="submit">
                    {editingCustomer ? "Cập nhật" : "Thêm mới"}
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Modal>

        {/* Modal thêm đơn hàng */}
        <Modal
          title="Tạo đơn hàng"
          open={orderModalVisible}
          width={800}
          onCancel={() => {
            setOrderModalVisible(false);
            orderForm.resetFields();
          }}
          footer={null}
        >
          <Form form={orderForm} layout="vertical" onFinish={handleOrderSubmit}>
            <Form.Item
              name="customer_id"
              label="Khách hàng"
              rules={[{ required: true, message: "Vui lòng chọn khách hàng!" }]}
            >
              <Select showSearch optionFilterProp="children">
                {customers.map((customer) => (
                  <Select.Option key={customer.id} value={customer.id}>
                    {customer.name} - {customer.phone}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Row className="w-100" gutter={[16, 16]}>
              <Col span={12}>
                <Form.Item
                  className="w-100"
                  name="order_date"
                  label="Ngày đặt"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày đặt!" },
                  ]}
                  initialValue={dayjs()}
                >
                  <DatePicker className="w-full" format="DD/MM/YYYY" />
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  className="w-100"
                  name="delivery_date"
                  label="Ngày giao"
                  rules={[
                    { required: true, message: "Vui lòng chọn ngày giao!" },
                  ]}
                >
                  <DatePicker className="w-full" format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
            </Row>

            <Form.List name="items" initialValue={[{}]}>
              {(fields, { add, remove }) => (
                <div
                  className="space-y-4 mt-2"
                  style={{ marginBottom: "24px" }}
                >
                  {fields.map(({ key, name, ...restField }) => (
                    <div
                      className="mt-2"
                      key={key}
                      style={{
                        border: "1px solid #d9d9d9",
                        borderRadius: "12px",
                        padding: "24px",
                        backgroundColor: "#f8f8f8",
                        position: "relative",
                      }}
                    >
                      <Row gutter={[16, 16]} className="mt-2">
                        <Col span={14}>
                          <Form.Item
                            {...restField}
                            name={[name, "crop_type_id"]}
                            rules={[
                              {
                                required: true,
                                message: "Vui lòng chọn loại!",
                              },
                            ]}
                            label="Loại cây"
                          >
                            <Select
                              showSearch
                              optionFilterProp="children"
                              placeholder="Chọn loại cây"
                            >
                              {cropTypes.map((cropType) => (
                                <Select.Option
                                  key={cropType.id}
                                  value={cropType.id}
                                >
                                  {cropType.name}
                                </Select.Option>
                              ))}
                            </Select>
                          </Form.Item>
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "quantity"]}
                            rules={[
                              { required: true, message: "Nhập số lượng!" },
                            ]}
                            label="Số lượng"
                          >
                            <InputNumber
                              className="w-full"
                              placeholder="Nhập số lượng"
                              min={1}
                            />
                          </Form.Item>
                        </Col>
                        <Col span={2} style={{ textAlign: "right" }}>
                          <Button
                            color="red"
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => fields.length > 1 && remove(name)}
                            disabled={fields.length === 1}
                          />
                        </Col>
                        <Col span={8}>
                          <Form.Item
                            {...restField}
                            name={[name, "unit"]}
                            rules={[
                              { required: true, message: "Nhập đơn vị!" },
                            ]}
                            label="Đơn vị"
                          >
                            <Input placeholder="VD: kg, bó, cây" />
                          </Form.Item>
                        </Col>
                        <Col span={14}>
                          <Form.Item
                            {...restField}
                            name={[name, "price_per_unit"]}
                            rules={[
                              { required: true, message: "Nhập đơn giá!" },
                            ]}
                            label="Đơn giá"
                          >
                            <InputNumber
                              className="w-100"
                              placeholder="Nhập đơn giá"
                              formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                              }
                              parser={(value) =>
                                value ? Number(value.replace(/[^\d]/g, "")) : 0
                              }
                              min={0}
                              step={1000}
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </div>
                  ))}
                  <Button
                    type="dashed"
                    onClick={() => add()}
                    block
                    icon={<PlusOutlined />}
                    style={{ marginTop: "12px" }}
                  >
                    Thêm sản phẩm
                  </Button>
                </div>
              )}
            </Form.List>

            <Row className="w-100" gutter={[16, 16]}>
              <Col span={12}>
                {" "}
                <Form.Item
                  name="shipping_type"
                  label="Phí ship"
                  rules={[
                    { required: true, message: "Vui lòng chọn loại ship!" },
                  ]}
                >
                  <Select>
                    <Select.Option value="nha_vuon_chiu">
                      Nhà vườn chịu
                    </Select.Option>
                    <Select.Option value="khach_hang_chiu">
                      Khách hàng chịu
                    </Select.Option>
                  </Select>
                </Form.Item>
              </Col>

              <Col span={12}>
                <Form.Item
                  noStyle
                  shouldUpdate={(prevValues, currentValues) =>
                    prevValues.shipping_type !== currentValues.shipping_type
                  }
                >
                  {({ getFieldValue }) =>
                    getFieldValue("shipping_type") === "nha_vuon_chiu" ? (
                      <Form.Item name="shipping_fee" label="Phí ship">
                        <InputNumber
                          className="w-100"
                          formatter={(value) =>
                            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                          }
                          parser={(value) =>
                            value ? Number(value.replace(/[^\d]/g, "")) : 0
                          }
                          step={1000}
                        />
                      </Form.Item>
                    ) : null
                  }
                </Form.Item>
              </Col>
            </Row>

            <div className="grid grid-cols-2 gap-4">
              <Form.Item name="deposit_amount" label="Tiền cọc">
                <InputNumber
                  className="w-100"
                  formatter={(value) =>
                    `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                  }
                  parser={(value) =>
                    value ? Number(value.replace(/[^\d]/g, "")) : 0
                  }
                  step={1000}
                />
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.deposit_amount !== currentValues.deposit_amount
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("deposit_amount") > 0 ? (
                    <Form.Item
                      name="deposit_date"
                      label="Ngày cọc"
                      initialValue={dayjs()}
                    >
                      <DatePicker className="w-full" format="DD/MM/YYYY" />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </div>

            <Form.Item name="note" label="Ghi chú">
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item className="mb-0">
              <Row className="w-100" gutter={[16, 16]}>
                <Col span={12}>
                  <Button
                    className="w-100"
                    onClick={() => {
                      setOrderModalVisible(false);
                      orderForm.resetFields();
                    }}
                  >
                    Hủy
                  </Button>
                </Col>
                <Col span={12}>
                  <Button className="w-100" type="primary" htmlType="submit">
                    Tạo đơn
                  </Button>
                </Col>
              </Row>
            </Form.Item>
          </Form>
        </Modal>

        <BottomNav />
      </div>
    </>
  );
}
