import React, { useState, useEffect } from "react";
import {
  Table,
  Select,
  Pagination,
  Row,
  Col,

} from "antd";
import axios from "axios";
import dayjs from "dayjs";

const CustomerTable = ({ initialPage = 0, initialPageSize = 10 }) => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);
  const fetchCustomers = async (pageIndex = page, size = pageSize) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Chưa đăng nhập");

      const res = await axios.get(
        `http://tb.giamsatdinhvi.com:8080/api/customers?pageSize=${size}&page=${pageIndex}&sortProperty=createdTime&sortOrder=DESC`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setCustomers(res.data.data || []);
      setTotal(res.data.totalElements || 0);
    } catch (err) {
      console.error("❌ Lỗi lấy khách hàng:", err);
      messageApi.error("Không thể tải danh sách khách hàng");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [page, pageSize]);

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
              setPage(0); // reset page khi thay đổi pageSize
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
        </Col>
      </Row>
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
