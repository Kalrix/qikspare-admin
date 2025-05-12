import { DatePicker, Space, Select } from "antd";
const { RangePicker } = DatePicker;

const FilterBar = () => {
  return (
    <div style={{ padding: "16px 0" }}>
      <Space size="large">
        <Select defaultValue="today" style={{ width: 160 }}>
          <Select.Option value="today">Today</Select.Option>
          <Select.Option value="week">This Week</Select.Option>
          <Select.Option value="month">This Month</Select.Option>
          <Select.Option value="year">This Year</Select.Option>
          <Select.Option value="custom">Custom Range</Select.Option>
          <Select.Option value="all">All Time</Select.Option>
        </Select>

        <RangePicker />
      </Space>
    </div>
  );
};

export default FilterBar;
