import React, { useState, useEffect } from "react";
import { Table, Select, Pagination, Row, Col, Button, Space, Tooltip } from "antd";
import axios from "axios";
import dayjs from "dayjs";
import CustomerAddModal from "./CustomerAddModal";
import CustomerServerConfig from "./CustomerServerConfig"; 
import { PlusOutlined } from "@ant-design/icons";

const CustomerTable = ({ accessToken, initialPage = 0, initialPageSize = 10 }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Modal server config
  const [serverConfigModalOpen, setServerConfigModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  const fetchCustomers = async (pageIndex = page, size = pageSize) => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const res = await axios.get(
        `http://tb.giamsatdinhvi.com:8080/api/customers?pageSize=${size}&page=${pageIndex}&sortProperty=createdTime&sortOrder=DESC`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      setCustomers(res.data.data || []);
      setTotal(res.data.totalElements || 0);
    } catch (err) {
      console.error("❌ Lỗi lấy khách hàng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [accessToken, page, pageSize]);

  const columns = [
    {
      title: "Ngày tạo",
      dataIndex: "createdTime",
      key: "createdTime",
      render: (timestamp) => dayjs(timestamp).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tên khách hàng",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <a
          onClick={() => {
            setSelectedCustomerId(record.id.id);
            setServerConfigModalOpen(true);
          }}
        >
          {text}
        </a>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (email) => email || "-",
    },
  ];

  return (
    <>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Select
            value={pageSize}
            onChange={(val) => {
              setPageSize(val);
              setPage(0);
            }}
            style={{ width: 120 }}
            options={[
              { label: "10 / trang", value: 10 },
              { label: "20 / trang", value: 20 },
              { label: "30 / trang", value: 30 },
            ]}
          />
        </Col>
        <Col>
          <Space>
            <Pagination
              current={page + 1}
              pageSize={pageSize}
              total={total}
              onChange={(p, size) => {
                setPage(p - 1);
                setPageSize(size);
              }}
              showSizeChanger={false}
            />
            <Tooltip title="Thêm khách hàng">
              <Button
                type="primary"
                size="middle"
                icon={<PlusOutlined />}
                onClick={() => setIsAddModalOpen(true)}
              />
            </Tooltip>
          </Space>
        </Col>
      </Row>

      <CustomerAddModal
        open={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdded={() => fetchCustomers()}
      />

      <CustomerServerConfig
        open={serverConfigModalOpen}
        onClose={() => setServerConfigModalOpen(false)}
        customerId={selectedCustomerId}
        accessToken={accessToken}
      />

      <Table
        columns={columns}
        dataSource={customers.map((c) => ({ ...c, key: c.id.id }))}
        loading={loading}
        pagination={false}
      />
    </>
  );
};

export default CustomerTable;
