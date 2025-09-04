import { Card, Col, Row, Statistic } from "antd";
import {
  ShoppingCartOutlined,
  TeamOutlined,
  DollarOutlined,
  LineChartOutlined,
} from "@ant-design/icons";

export default function Home() {
  const stats = [
    {
      title: "Doanh Thu Tháng Này",
      value: 11280000,
      prefix: <DollarOutlined />,
      suffix: "đ",
      valueStyle: { color: "#3f8600" },
      xs: 12,
      sm: 12,
      md: 6,
    },
    {
      title: "Đơn Hàng Đang Xử Lý",
      value: 3,
      prefix: <ShoppingCartOutlined />,
      valueStyle: { color: "#cf1322" },
      xs: 12,
      sm: 12,
      md: 6,
    },
    {
      title: "Nhân Công Hôm Nay",
      value: 2,
      prefix: <TeamOutlined />,
      xs: 12,
      sm: 12,
      md: 6,
    },
    {
      title: "Lợi Nhuận Tháng Này",
      value: 6450000,
      prefix: <LineChartOutlined />,
      suffix: "đ",
      valueStyle: { color: "#3f8600" },
      xs: 12,
      sm: 12,
      md: 6,
    },
  ];

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Tổng Quan</h1>

      <Row gutter={[16, 16]}>
        {stats.map((stat, index) => (
          <Col key={index} xs={stat.xs} sm={stat.sm} md={stat.md}>
            <Card bodyStyle={{ padding: "12px" }} className="stat-card">
              <Statistic
                title={stat.title}
                value={stat.value}
                precision={0}
                valueStyle={stat.valueStyle}
                prefix={stat.prefix}
                suffix={stat.suffix}
              />
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
