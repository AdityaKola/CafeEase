package com.cafe.cafeease.repository;

import com.cafe.cafeease.model.OrderEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {
    List<OrderEntity> findAllByOrderByCreatedAtDesc();
    Optional<OrderEntity> findByClientRequestId(String clientRequestId);
}
