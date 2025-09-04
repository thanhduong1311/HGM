"use client";

import React, { useEffect } from "react";
import { message } from "antd";
import { MessageInstance } from "antd/es/message/interface";

let messageApi: MessageInstance;

export const MessageProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [api, contextHolder] = message.useMessage();

  useEffect(() => {
    messageApi = api;
  }, [api]);

  return (
    <>
      {contextHolder}
      {children}
    </>
  );
};

export const showError = (error: any) => {
  if (!messageApi) {
    console.error("MessageApi not initialized");
    return;
  }

  const errorMessage =
    error?.message || error?.error_description || "Có lỗi xảy ra";
  messageApi.error({
    content: errorMessage,
    duration: 3,
    style: {
      marginTop: "64px",
    },
  });
};

export const showSuccess = (content: string) => {
  if (!messageApi) {
    console.error("MessageApi not initialized");
    return;
  }

  messageApi.success({
    content,
    duration: 3,
    style: {
      marginTop: "64px",
    },
  });
};
