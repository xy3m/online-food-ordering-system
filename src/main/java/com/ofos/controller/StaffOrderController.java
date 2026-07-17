package com.ofos.controller;

import com.ofos.model.dto.request.OrderStatusUpdateRequest;
import com.ofos.model.dto.response.ApiResponse;
import com.ofos.model.dto.response.OrderResponse;
import com.ofos.model.dto.response.RestaurantResponse;
import com.ofos.service.OrderService;
import com.ofos.service.RestaurantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import com.ofos.repository.UserRepository;

@RestController
@RequestMapping("/api/v1/restaurant-staff")
@RequiredArgsConstructor
@Tag(name = "Staff Orders", description = "Order management for restaurant staff")
@PreAuthorize("hasAnyRole('RESTAURANT_STAFF', 'ADMIN')")
public class StaffOrderController {

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final RestaurantService restaurantService;

    @GetMapping("/my-restaurant")
    @Operation(summary = "Get the restaurant owned by the currently authenticated staff member")
    public ResponseEntity<ApiResponse<RestaurantResponse>> getMyRestaurant(
            @AuthenticationPrincipal UserDetails userDetails) {
        Long staffId = getUserIdFromEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(restaurantService.getRestaurantByOwnerId(staffId)));
    }

    @GetMapping("/orders/restaurant/{restaurantId}")
    @Operation(summary = "View incoming orders for a restaurant")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getRestaurantOrders(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long restaurantId,
            Pageable pageable) {
        Long staffId = getUserIdFromEmail(userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success(
                orderService.getRestaurantOrders(restaurantId, staffId, pageable)));
    }

    @PatchMapping("/orders/{orderId}/status")
    @Operation(summary = "Advance order lifecycle state (Confirmed, Preparing, etc)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable Long orderId,
            @Valid @RequestBody OrderStatusUpdateRequest request) {
        Long staffId = getUserIdFromEmail(userDetails.getUsername());
        OrderResponse response = orderService.updateOrderStatus(orderId, request, staffId);
        return ResponseEntity.ok(ApiResponse.success("Order status updated", response));
    }

    private Long getUserIdFromEmail(String email) {
        return userRepository.findByEmail(email).orElseThrow().getId();
    }
}
