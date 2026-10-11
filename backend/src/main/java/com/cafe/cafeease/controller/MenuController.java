package com.cafe.cafeease.controller;

import com.cafe.cafeease.model.MenuItem;
import com.cafe.cafeease.repository.MenuItemRepository;
import com.cafe.cafeease.service.ChefAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class MenuController {

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private ChefAuthService chefAuthService;

    @GetMapping("/menu")
    public ResponseEntity<?> getMenu(@RequestHeader(value = "Authorization", required = false) String auth) {
        List<MenuItem> items = menuItemRepository.findAllByOrderByIdAsc();
        return ResponseEntity.ok(items);
    }

    @PostMapping("/menu")
    public ResponseEntity<?> createMenuItem(@RequestBody MenuItem item, @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!chefAuthService.isChefAuthorized(auth)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", "Unauthorized"));
        }

        if (item == null || item.getName() == null || item.getCategory() == null || item.getPrice() == null) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("error", "Invalid menu item payload"));
        }

        MenuItem saved = menuItemRepository.save(item);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/menu/{id}")
    public ResponseEntity<?> updateMenuItem(@PathVariable Long id, @RequestBody MenuItem updatedItem, @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!chefAuthService.isChefAuthorized(auth)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", "Unauthorized"));
        }

        Optional<MenuItem> opt = menuItemRepository.findById(id);
        if (opt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", "Menu item not found"));
        }

        MenuItem existing = opt.get();
        existing.setName(updatedItem.getName());
        existing.setCategory(updatedItem.getCategory());
        existing.setPrice(updatedItem.getPrice());
        existing.setDescription(updatedItem.getDescription());

        return ResponseEntity.ok(menuItemRepository.save(existing));
    }

    @DeleteMapping("/menu/{id}")
    public ResponseEntity<?> deleteMenuItem(@PathVariable Long id, @RequestHeader(value = "Authorization", required = false) String auth) {
        if (!chefAuthService.isChefAuthorized(auth)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Collections.singletonMap("error", "Unauthorized"));
        }

        if (!menuItemRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Collections.singletonMap("error", "Menu item not found"));
        }

        menuItemRepository.deleteById(id);
        return ResponseEntity.ok(Map.of("ok", true));
    }
}
