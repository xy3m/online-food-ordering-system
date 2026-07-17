package com.ofos.service;

import com.ofos.model.dto.request.RestaurantRequest;
import com.ofos.model.dto.response.RestaurantResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Restaurant service interface — ISP: separate from MenuService.
 * Controllers depend on this abstraction (DIP).
 */
public interface RestaurantService {

    Page<RestaurantResponse> getAllRestaurants(String search, Double lat, Double lng, Pageable pageable);

    RestaurantResponse getRestaurantById(Long id);

    RestaurantResponse createRestaurant(RestaurantRequest request);

    RestaurantResponse updateRestaurant(Long id, RestaurantRequest request, Long currentUserId);

    RestaurantResponse getRestaurantByOwnerId(Long ownerId);
}
