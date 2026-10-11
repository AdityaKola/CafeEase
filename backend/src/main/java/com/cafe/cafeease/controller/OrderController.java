package com.cafe.cafeease.controller;

import com.cafe.cafeease.dto.LoginRequest;
import com.cafe.cafeease.dto.OrderRequest;
import com.cafe.cafeease.dto.StatusRequest;
import com.cafe.cafeease.model.OrderEntity;
import com.cafe.cafeease.model.OrderItem;
import com.cafe.cafeease.repository.OrderRepository;
import com.cafe.cafeease.service.ChefAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api")
public class OrderController {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private ChefAuthService chefAuthService;

    @PostMapping("/chef/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest login) {
        String token = chefAuthService.login(login.getUsername(), login.getPassword());
        if (token != null) {
            Map<String, String> res = new HashMap<>();
            res.put("token", token);
            return ResponseEntity.ok(res);
        }
        Map<String, String> res = new HashMap<>();
        res.put("error", "Invalid credentials");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(res);
    }

    @PostMapping("/chef/logout")
    public ResponseEntity<?> logout(@RequestHeader(value="Authorization", required=false) String auth) {
        chefAuthService.logout(auth);
        Map<String, Boolean> res = new HashMap<>();
        res.put("ok", true);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/orders")
    public ResponseEntity<?> getOrders(@RequestHeader(value="Authorization", required=false) String auth) {
        if (!chefAuthService.isChefAuthorized(auth)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", "Unauthorized"));
        }
        List<OrderEntity> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(Collections.singletonMap("orders", orders));
    }

    @PostMapping("/orders")
    public ResponseEntity<?> createOrder(@RequestBody OrderRequest req) {
        if (req.getItems() == null || req.getItems().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Invalid order payload"));
        }

        OrderEntity order = new OrderEntity();
        order.setCustomerName(req.getCustomerName() != null ? req.getCustomerName() : "Guest");
        order.setTableNumber(req.getTableNumber() != null && req.getTableNumber() > 0 ? req.getTableNumber() : null);
        order.setType(req.getType());
        order.setCreatedAt(LocalDateTime.now());
        order.setStatus("Placed");

        double total = 0;
        for (OrderItem item : req.getItems()) {
            double price = item.getPrice() != null ? item.getPrice() : 0;
            int qty = item.getQty() != null ? item.getQty() : 0;
            total += price * qty;
        }
        order.setTotal(total);
        order.setItems(req.getItems());

        OrderEntity saved = orderRepository.save(order);
        return ResponseEntity.status(HttpStatus.CREATED).body(Collections.singletonMap("order", saved));
    }

    @PatchMapping("/orders/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id, @RequestBody StatusRequest req, @RequestHeader(value="Authorization", required=false) String auth) {
        if (!chefAuthService.isChefAuthorized(auth)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", "Unauthorized"));
        }
        
        Optional<OrderEntity> opt = orderRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", "Order not found"));
        }
        
        OrderEntity order = opt.get();
        List<String> allowed = Arrays.asList("Placed", "Preparing", "Completed");
        if (!allowed.contains(req.getStatus())) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Invalid status"));
        }

        order.setStatus(req.getStatus());
        orderRepository.save(order);
        return ResponseEntity.ok(Collections.singletonMap("order", order));
    }

    @DeleteMapping("/orders/{id}")
    public ResponseEntity<?> deleteOrder(@PathVariable Long id, @RequestHeader(value="Authorization", required=false) String auth) {
        if (!chefAuthService.isChefAuthorized(auth)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", "Unauthorized"));
        }
        
        if (!orderRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", "Order not found"));
        }
        
        orderRepository.deleteById(id);
        return ResponseEntity.ok(Collections.singletonMap("ok", true));
    }
}
