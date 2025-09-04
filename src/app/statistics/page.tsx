"use client";

import { useEffect, useState } from "react";
import { Card, Statistic, Select, List, Space, DatePicker, Spin } from "antd";
import dayjs from "dayjs";
import { statisticsService } from "@/services/statistics.service";
import { showError } from "@/components/MessageProvider";
import AppHeader from "@/components/AppHeader";
import BottomNav from "@/components/BottomNav";

const { RangePicker } = DatePicker;

export default function StatisticsPage() {
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

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      <div style={{ paddingTop: "72px", paddingBottom: "80px" }}>
        <div className="p-4">
          <Card bodyStyle={{ padding: "12px" }} className="mb-4">
            <Space direction="vertical" className="w-full">
              <Select
                defaultValue="month"
                style={{ width: "100%" }}
                onChange={handleQuickSelect}
                options={[
                  { value: "week", label: "Tuần này" },
                  { value: "month", label: "Tháng này" },
                  { value: "quarter", label: "Quý này" },
                  { value: "year", label: "Năm nay" },
                ]}
              />
              <RangePicker
                value={dateRange}
                onChange={(dates) =>
                  dates && setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs])
                }
                format="DD/MM/YYYY"
                className="w-full"
              />
            </Space>
          </Card>

          {loading ? (
            <div className="flex justify-center p-8">
              <Spin size="large" />
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <Card bodyStyle={{ padding: "12px" }}>
                  <Statistic
                    title="Doanh thu"
                    value={stats?.revenue}
                    precision={0}
                    suffix="đ"
                  />
                </Card>
                <Card bodyStyle={{ padding: "12px" }}>
                  <Statistic
                    title="Chi phí"
                    value={stats?.expenses}
                    precision={0}
                    suffix="đ"
                  />
                </Card>
                <Card bodyStyle={{ padding: "12px" }}>
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
                <Card bodyStyle={{ padding: "12px" }}>
                  <Statistic title="Số đơn hàng" value={stats?.orderCount} />
                </Card>
              </div>

              <Card bodyStyle={{ padding: "12px" }} className="mb-4">
                <div className="grid grid-cols-2 gap-4">
                  <Statistic title="Số vườn" value={stats?.gardenCount} />
                  <Statistic title="Số luống" value={stats?.bedCount} />
                </div>
              </Card>

              <div className="grid grid-cols-3 gap-4 mb-4">
                <Card bodyStyle={{ padding: "12px" }}>
                  <Statistic title="Khách hàng" value={stats?.customerCount} />
                </Card>
                <Card bodyStyle={{ padding: "12px" }}>
                  <Statistic title="Công nhân" value={stats?.workerCount} />
                </Card>
                <Card bodyStyle={{ padding: "12px" }}>
                  <Statistic title="Loại cây" value={stats?.cropTypeCount} />
                </Card>
              </div>

              <Card bodyStyle={{ padding: "12px" }} className="mb-4">
                <Statistic
                  title="Giờ công nhân công"
                  value={stats?.laborHours}
                  suffix="giờ"
                />
              </Card>

              <Card
                title="Hoạt động chăm sóc gần đây"
                bodyStyle={{ padding: "12px" }}
              >
                <List
                  dataSource={stats?.lastCareActivities}
                  renderItem={(item: any) => (
                    <List.Item>
                      <Space direction="vertical" className="w-full">
                        <div className="flex justify-between w-full">
                          <span>
                            {item.activity_type === "bon_phan"
                              ? "Bón phân"
                              : "Xịt thuốc"}
                          </span>
                          <span>
                            {dayjs(item.activity_date).format("DD/MM")}
                          </span>
                        </div>
                        <div className="text-gray-500">{item.garden_name}</div>
                      </Space>
                    </List.Item>
                  )}
                />
              </Card>
            </>
          )}
        </div>
      </div>
      <BottomNav />
    </div>
  );
}
