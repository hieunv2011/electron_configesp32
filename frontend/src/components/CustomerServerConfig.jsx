import React, { useEffect, useState } from "react";
import { Drawer, Form, Input, Button, Spin, message, Space } from "antd";
import axios from "axios";

const THINGSBOARD_URL = "http://tb.giamsatdinhvi.com:8080";
const SOURCE_CUSTOMER_ID = "bb1d7310-b38f-11f0-8917-8786cbc91d5e";

const CustomerServerConfig = ({ open, onClose, customerId, accessToken }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [serverData, setServerData] = useState([]); // dữ liệu gốc từ server
  const [initialValues, setInitialValues] = useState({}); // giá trị ban đầu để so sánh

  const fetchServerScope = async () => {
    if (!customerId || !accessToken) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${THINGSBOARD_URL}/api/plugins/telemetry/CUSTOMER/${customerId}/values/attributes/SERVER_SCOPE`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      const data = res.data || [];
      setServerData(data);

      const values = {};
      data.forEach((i) => (values[i.key] = i.value));
      form.setFieldsValue(values);
      setInitialValues(values); // lưu giá trị gốc
    } catch {
      message.error("Lỗi lấy cấu hình server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) fetchServerScope();
  }, [open]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // So sánh với giá trị ban đầu để chỉ gửi những trường thay đổi
      const changedFields = {};
      for (const key of Object.keys(values)) {
        if (values[key] !== initialValues[key]) {
          changedFields[key] = values[key];
        }
      }

      if (Object.keys(changedFields).length === 0) {
        message.info("Không có thay đổi nào để lưu");
        setLoading(false);
        return;
      }

      // Gửi 1 lần tất cả các trường thay đổi
      await axios.post(
        `${THINGSBOARD_URL}/api/plugins/telemetry/CUSTOMER/${customerId}/attributes/SERVER_SCOPE`,
        changedFields,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      message.success("Đã lưu thay đổi");
      setInitialValues(values); // cập nhật lại giá trị gốc
    } catch {
      message.error("Lưu thay đổi thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDefaultConfig = async () => {
    if (!customerId || !accessToken) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `${THINGSBOARD_URL}/api/plugins/telemetry/CUSTOMER/${SOURCE_CUSTOMER_ID}/values/attributes/SERVER_SCOPE`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const attrs = res.data || [];
      if (!attrs.length) return message.warning("Không có cấu hình mặc định");
      const payload = {};
      attrs.forEach((a) => (payload[a.key] = a.value));
      await axios.post(
        `${THINGSBOARD_URL}/api/plugins/telemetry/CUSTOMER/${customerId}/attributes/SERVER_SCOPE`,
        payload,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      message.success("Đã thêm cấu hình mặc định");
      fetchServerScope();
    } catch {
      message.error("Lỗi thêm cấu hình mặc định");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      title="Cấu hình Server"
      placement="right"
      width={600}
      onClose={onClose}
      open={open}
      styles={{
        maxHeight: "80vh",
        overflowY: "auto",
        paddingRight: 10,
      }}
    >
      {loading ? (
        <div style={{ textAlign: "center", padding: 20 }}>
          <Spin />
        </div>
      ) : (
        <Form
          form={form}
          layout="horizontal"
          labelAlign="left"
          onFinish={handleSave}
          labelCol={{ span: 8 }}
          wrapperCol={{ span: 16 }}
        >
          {serverData.map((item) => (
            <Form.Item label={item.key} name={item.key} key={item.key}>
              <Input />
            </Form.Item>
          ))}

          <Form.Item wrapperCol={{ offset: 8 }}>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Lưu
              </Button>
              <Button onClick={handleAddDefaultConfig}>
                Thêm cấu hình mặc định
              </Button>
            </Space>
          </Form.Item>
        </Form>
      )}
    </Drawer>
  );
};

export default CustomerServerConfig;
