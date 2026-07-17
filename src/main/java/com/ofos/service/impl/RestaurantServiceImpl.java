package com.ofos.service.impl;

import com.ofos.exception.ResourceNotFoundException;
import com.ofos.model.dto.request.RestaurantRequest;
import com.ofos.model.dto.response.RestaurantResponse;
import com.ofos.model.entity.Restaurant;
import com.ofos.model.entity.User;
import com.ofos.model.enums.Role;
import com.ofos.repository.RestaurantRepository;
import com.ofos.repository.UserRepository;
import com.ofos.service.RestaurantService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.data.domain.PageImpl;

/**
 * Restaurant service implementation.
 * SRP: handles ONLY restaurant CRUD — menu management is in MenuService.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RestaurantServiceImpl implements RestaurantService {

    private final RestaurantRepository restaurantRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<RestaurantResponse> getAllRestaurants(String search, Double lat, Double lng, Pageable pageable) {
        if (lat == null || lng == null) {
            // No location provided, return paginated results without distance filtering
            if (search != null && !search.trim().isEmpty()) {
                return restaurantRepository.findByActiveTrueAndNameContainingIgnoreCase(search.trim(), pageable)
                        .map(r -> toResponse(r, null));
            }
            return restaurantRepository.findByActiveTrue(pageable)
                    .map(r -> toResponse(r, null));
        }

        // Location provided: Fetch all, filter by 10km radius, sort by distance, and paginate
        List<Restaurant> allRestaurants;
        if (search != null && !search.trim().isEmpty()) {
            allRestaurants = restaurantRepository.findByActiveTrueAndNameContainingIgnoreCase(search.trim());
        } else {
            allRestaurants = restaurantRepository.findByActiveTrue();
        }

        List<RestaurantResponse> nearbyRestaurants = allRestaurants.stream()
                .filter(r -> r.getLatitude() != null && r.getLongitude() != null)
                .map(r -> {
                    double distance = calculateDistance(lat, lng, r.getLatitude(), r.getLongitude());
                    RestaurantResponse res = toResponse(r, distance);
                    return res;
                })
                .filter(r -> r.getDistance() <= 10.0)
                .sorted(Comparator.comparingDouble(RestaurantResponse::getDistance))
                .collect(Collectors.toList());

        int start = (int) pageable.getOffset();
        int end = Math.min((start + pageable.getPageSize()), nearbyRestaurants.size());
        
        List<RestaurantResponse> pagedList = start <= end ? nearbyRestaurants.subList(start, end) : List.of();
        return new PageImpl<>(pagedList, pageable, nearbyRestaurants.size());
    }

    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        // Haversine formula
        final int R = 6371; // Radius of the earth in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    @Override
    @Transactional(readOnly = true)
    public RestaurantResponse getRestaurantById(Long id) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", id));
        return toResponse(restaurant, null);
    }

    @Override
    @Transactional
    @PreAuthorize("hasRole('ADMIN')")
    public RestaurantResponse createRestaurant(RestaurantRequest request) {
        User owner = userRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getOwnerId()));

        if (owner.getRole() != Role.RESTAURANT_STAFF && owner.getRole() != Role.ADMIN) {
            throw new IllegalArgumentException("Owner must have RESTAURANT_STAFF or ADMIN role");
        }

        Restaurant restaurant = Restaurant.builder()
                .name(request.getName())
                .description(request.getDescription())
                .address(request.getAddress())
                .phone(request.getPhone())
                .imageUrl(request.getImageUrl())
                .openingTime(request.getOpeningTime())
                .closingTime(request.getClosingTime())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .owner(owner)
                .active(true)
                .build();

        restaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant created: {} (owner: {})", restaurant.getName(), owner.getEmail());
        return toResponse(restaurant, null);
    }

    @Override
    @Transactional
    public RestaurantResponse updateRestaurant(Long id, RestaurantRequest request, Long currentUserId) {
        Restaurant restaurant = restaurantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Restaurant", "id", id));

        // IDOR protection: verify ownership unless admin
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", currentUserId));

        if (currentUser.getRole() != Role.ADMIN && !restaurant.getOwner().getId().equals(currentUserId)) {
            throw new AccessDeniedException("You can only update your own restaurant");
        }

        restaurant.setName(request.getName());
        restaurant.setDescription(request.getDescription());
        restaurant.setAddress(request.getAddress());
        restaurant.setPhone(request.getPhone());
        if (request.getImageUrl() != null) {
            restaurant.setImageUrl(request.getImageUrl());
        }
        if (request.getOpeningTime() != null) {
            restaurant.setOpeningTime(request.getOpeningTime());
        }
        if (request.getClosingTime() != null) {
            restaurant.setClosingTime(request.getClosingTime());
        }
        if (request.getLatitude() != null) {
            restaurant.setLatitude(request.getLatitude());
        }
        if (request.getLongitude() != null) {
            restaurant.setLongitude(request.getLongitude());
        }

        restaurant = restaurantRepository.save(restaurant);
        log.info("Restaurant updated: {} by user {}", restaurant.getName(), currentUser.getEmail());
        return toResponse(restaurant, null);
    }

    // ==================== Mapper (manual — avoids MapStruct complexity for now) ====================

    @Override
    @Transactional(readOnly = true)
    public RestaurantResponse getRestaurantByOwnerId(Long ownerId) {
        List<Restaurant> owned = restaurantRepository.findByOwnerId(ownerId);
        if (owned.isEmpty()) {
            throw new ResourceNotFoundException("Restaurant", "ownerId", ownerId);
        }
        return toResponse(owned.get(0), null);
    }

    private RestaurantResponse toResponse(Restaurant restaurant, Double distance) {
        return RestaurantResponse.builder()
                .id(restaurant.getId())
                .name(restaurant.getName())
                .description(restaurant.getDescription())
                .address(restaurant.getAddress())
                .phone(restaurant.getPhone())
                .imageUrl(restaurant.getImageUrl())
                .openingTime(restaurant.getOpeningTime())
                .closingTime(restaurant.getClosingTime())
                .latitude(restaurant.getLatitude())
                .longitude(restaurant.getLongitude())
                .distance(distance != null ? Math.round(distance * 10.0) / 10.0 : null)
                .isCurrentlyOpen(restaurant.isCurrentlyOpen())
                .rating(restaurant.getRating() != null ? Math.round(restaurant.getRating() * 10.0) / 10.0 : 0.0)
                .ownerId(restaurant.getOwner().getId())
                .ownerName(restaurant.getOwner().getFullName())
                .active(restaurant.isActive())
                .menuItemCount(restaurant.getMenuItems() != null ? restaurant.getMenuItems().size() : 0)
                .createdAt(restaurant.getCreatedAt())
                .build();
    }
}
