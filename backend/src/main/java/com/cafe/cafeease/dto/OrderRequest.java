package com.cafe.cafeease.dto;

import com.cafe.cafeease.model.OrderItem;
import java.util.List;

public class OrderRequest {
    private String customerName;
    private Integer tableNumber;
    private String type;
    private List<OrderItem> items;

    // getters and setters
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public Integer getTableNumber() { return tableNumber; }
    public void setTableNumber(Integer tableNumber) { this.tableNumber = tableNumber; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public List<OrderItem> getItems() { return items; }
    public void setItems(List<OrderItem> items) { this.items = items; }
}
