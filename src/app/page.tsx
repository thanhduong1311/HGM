"use client";

import { useEffect, useState } from "react";
import {
  Card,
  Statistic,
  Select,
  List,
  Space,
  DatePicker,
  Spin,
  Row,
  Col,
  Table,
} from "antd";
import dayjs from "dayjs";
import { statisticsService } from "@/services/statistics.service";
import { showError } from "@/components/MessageProvider";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

const { RangePicker } = DatePicker;

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs]>([
    dayjs().startOf("month"),
    dayjs().endOf("month"),
  ] as [dayjs.Dayjs, dayjs.Dayjs]);
  const [stats, setStats] = useState<any>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [start, end] = dateRange;
      const data = await statisticsService.getSummary(
        start.toISOString(),
        end.toISOString()
      );
      setStats(data);
    } catch (error) {
      showError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  const handleQuickSelect = (value: string) => {
    switch (value) {
      case "week":
        setDateRange([dayjs().startOf("week"), dayjs().endOf("week")]);
        break;
      case "month":
        setDateRange([dayjs().startOf("month"), dayjs().endOf("month")]);
        break;
      case "quarter":
        setDateRange([
          dayjs().startOf("month").subtract(2, "month"),
          dayjs().endOf("month"),
        ] as [dayjs.Dayjs, dayjs.Dayjs]);
        break;
      case "year":
        setDateRange([dayjs().startOf("year"), dayjs().endOf("year")]);
        break;
    }
  };

  console.log("Stats:", stats?.lastCareActivities);

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div style={{ paddingTop: "72px", paddingBottom: "80px" }}>
        <h2 className="text-center">Thống kê tổng quan</h2>
        <Card className="mb-4">
          <Space direction="vertical" className="w-100">
            <Select
              className="w-100"
              defaultValue="month"
              onChange={handleQuickSelect}
              options={[
                { value: "week", label: "Tuần này" },
                { value: "month", label: "Tháng này" },
                { value: "quarter", label: "Quý này" },
                { value: "year", label: "Năm nay" },
              ]}
            />
            <RangePicker
              className="w-100"
              value={dateRange}
              onChange={(dates) =>
                dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
              }
              format="DD/MM/YYYY"
            />
          </Space>
        </Card>

        {loading ? (
          <div className="flex justify-center p-8">
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]} className="w-100 p-2">
            <Col xs={24}>
              <Card className="mt-2 w-100">
                <Statistic
                  title="Doanh thu"
                  value={stats?.revenue}
                  precision={0}
                  suffix="đ"
                />
              </Card>
            </Col>
            <Col xs={24}>
              <Card className="mt-2 w-100">
                <Statistic
                  valueStyle={{
                    color: "#a9b826ff",
                  }}
                  title="Chi phí"
                  value={stats?.expenses}
                  precision={0}
                  suffix="đ"
                />
              </Card>
            </Col>
            <Col xs={24}>
              <Card className="mt-2">
                <Statistic
                  title="Lợi nhuận"
                  value={stats?.profit}
                  precision={0}
                  suffix="đ"
                  valueStyle={{
                    color: stats?.profit >= 0 ? "#3f8600" : "#cf1322",
                  }}
                />
              </Card>
            </Col>
            <Col xs={10}>
              <Card className="mt-2">
                <Statistic title="Số đơn hàng" value={stats?.orderCount} />
              </Card>
            </Col>

            <Col xs={14}>
              <Card className="mt-2">
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic title="Số vườn" value={stats?.gardenCount} />
                  </Col>
                  <Col span={12}>
                    <Statistic title="Số luống" value={stats?.bedCount} />
                  </Col>
                </Row>
              </Card>
            </Col>

            <Row gutter={[16, 16]} className="w-100">
              <Col span={12}>
                <Card className="mt-2">
                  <Statistic title="Khách hàng" value={stats?.customerCount} />
                </Card>
              </Col>
              <Col span={12}>
                <Card className="mt-2">
                  <Statistic title="Công nhân" value={stats?.workerCount} />
                </Card>
              </Col>
              <Col span={12}>
                <Card className="mt-2">
                  <Statistic title="Loại cây" value={stats?.cropTypeCount} />
                </Card>
              </Col>
              <Col span={12}>
                <Card className="mt-2">
                  <Statistic
                    title="Giờ công nhân công"
                    value={stats?.laborHours}
                    suffix="giờ"
                  />
                </Card>
              </Col>
            </Row>

            <Card title="Hoạt động chăm sóc gần đây" className="  w-100">
              <Table
                className="w-100"
                dataSource={stats?.lastCareActivities}
                pagination={false}
                columns={[
                  {
                    title: "Hoạt động",
                    dataIndex: "activity_type",
                    key: "activity_type",
                    render: (text) =>
                      text === "bon_phan" ? "Bón phân" : "Xịt thuốc",
                  },
                  {
                    title: "Ngày",
                    dataIndex: "activity_date",
                    key: "activity_date",
                    render: (date) => dayjs(date).format("DD/MM"),
                  },
                  {
                    title: "Vườn",
                    dataIndex: "garden_name",
                    key: "garden_name",
                  },
                ]}
              />
            </Card>
          </Row>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
