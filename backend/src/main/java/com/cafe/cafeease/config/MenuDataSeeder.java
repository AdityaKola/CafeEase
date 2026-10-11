package com.cafe.cafeease.config;

import com.cafe.cafeease.model.MenuItem;
import com.cafe.cafeease.repository.MenuItemRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class MenuDataSeeder {

    @Bean
    ApplicationRunner seedMenu(MenuItemRepository menuItemRepository) {
        return args -> {
            if (menuItemRepository.count() == 0) {
                menuItemRepository.saveAll(List.of(
                    createMenuItem("Cappuccino", "Beverages", 120.0, "Espresso with steamed milk foam."),
                    createMenuItem("Cold Coffee", "Beverages", 140.0, "Chilled coffee blended with milk."),
                    createMenuItem("Masala Chai", "Beverages", 60.0, "Indian spiced tea served hot."),
                    createMenuItem("Veg Sandwich", "Snacks", 110.0, "Toasted sandwich with fresh veggies."),
                    createMenuItem("Paneer Wrap", "Snacks", 150.0, "Soft wrap with paneer filling."),
                    createMenuItem("Brownie", "Desserts", 90.0, "Warm chocolate brownie square.")
                ));
            }
        };
    }

    private MenuItem createMenuItem(String name, String category, double price, String description) {
        MenuItem item = new MenuItem();
        item.setName(name);
        item.setCategory(category);
        item.setPrice(price);
        item.setDescription(description);
        return item;
    }
}
