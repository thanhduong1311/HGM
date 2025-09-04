"use client";

import React from "react";
import { notification } from "antd";
import { NotificationInstance } from "antd/es/notification/interface";

let notificationApi: NotificationInstance;

export const ErrorBoundary = ({ children }: { children: React.ReactNode }) => {
  const [api, contextHolder] = notification.useNotification();
  notificationApi = api;

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
};

export const showError = (error: any) => {
  const message = error?.message || error?.error_description || "Có lỗi xảy ra";
  notificationApi?.error({
    message: "Lỗi",
    description: message,
    placement: "top",
    duration: 3,
  });
};

export const showSuccess = (message: string) => {
  notificationApi?.success({
    message: "Thành công",
    description: message,
    placement: "top",
    duration: 3,
  });
};
