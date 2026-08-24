import { Restaurant, MenuItem, Order, User } from '../types';

export interface DemoStoreData {
  users: User[];
  restaurants: Restaurant[];
  menuItems: MenuItem[];
  orders: Order[];
  metrics: {
    totalRevenue: number;
    totalOrders: number;
    activeRestaurants: number;
    activeUsers: number;
    averageDeliveryMinutes: number;
  };
}

const INITIAL_DEMO_DATA: DemoStoreData = {
  users: [
    {
      id: 1,
      fullName: 'System Administrator',
      email: 'admin@ofos.com',
      role: 'ADMIN',
      phone: '+880 1711-000001',
      active: true
    },
    {
      id: 2,
      fullName: 'Karim Uddin (Kacchi House)',
      email: 'karim@kacchihouse.com',
      role: 'RESTAURANT_STAFF',
      phone: '+880 1812-345678',
      active: true
    },
    {
      id: 3,
      fullName: 'Tanvir Hasan (Foodie)',
      email: 'tanvir@gmail.com',
      role: 'CUSTOMER',
      phone: '+880 1913-987654',
      active: true
    }
  ],
  restaurants: [
    {
      id: 1,
      name: 'Kacchi House',
      description: 'Authentic Basmati Mutton & Beef Kacchi Biryani cooked over slow woodfire with royal spices.',
      address: 'House 42, Road 7/A, Dhanmondi, Dhaka',
      rating: 4.9,
      active: true,
      ownerId: 2,
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=800&q=80',
      openingTime: '11:00 AM',
      closingTime: '11:30 PM',
      isCurrentlyOpen: true,
      distance: 1.2,
      latitude: 23.7465,
      longitude: 90.3760
    },
    {
      id: 2,
      name: "Sultan's Dine",
      description: 'Renowned wedding-style traditional Kacchi feasts, Borhani, and savory roast platters.',
      address: 'Gulshan 2 Circle, Dhaka',
      rating: 4.8,
      active: true,
      ownerId: 4,
      imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=800&q=80',
      openingTime: '12:00 PM',
      closingTime: '11:00 PM',
      isCurrentlyOpen: true,
      distance: 2.5,
      latitude: 23.7925,
      longitude: 90.4078
    },
    {
      id: 3,
      name: 'Pizza Hut Express',
      description: 'Freshly baked pan pizzas loaded with mozzarella, pepperoni, BBQ chicken, and garlic bread.',
      address: 'Road 11, Banani, Dhaka',
      rating: 4.7,
      active: true,
      ownerId: 5,
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&q=80',
      openingTime: '10:30 AM',
      closingTime: '12:00 AM',
      isCurrentlyOpen: true,
      distance: 3.1,
      latitude: 23.7940,
      longitude: 90.4043
    },
    {
      id: 4,
      name: 'Burger King',
      description: 'Flame-grilled Whopper burgers, crispy chicken tenders, onion rings, and golden fries.',
      address: 'Sector 3, Uttara, Dhaka',
      rating: 4.6,
      active: true,
      ownerId: 6,
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80',
      openingTime: '11:00 AM',
      closingTime: '11:00 PM',
      isCurrentlyOpen: true,
      distance: 4.0,
      latitude: 23.8680,
      longitude: 90.3980
    },
    {
      id: 5,
      name: 'Chillox Gourmet',
      description: 'Juicy smashed burgers, spicy Naga beef patties, cheesy curly fries, and cold milkshakes.',
      address: 'Mirpur 10 Circle, Dhaka',
      rating: 4.8,
      active: true,
      ownerId: 7,
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=800&q=80',
      openingTime: '12:00 PM',
      closingTime: '11:59 PM',
      isCurrentlyOpen: true,
      distance: 1.8,
      latitude: 23.8070,
      longitude: 90.3686
    }
  ],
  menuItems: [
    // Kacchi House
    {
      id: 101,
      restaurantId: 1,
      name: 'Royal Basmati Mutton Kacchi',
      description: 'Tender mutton cooked with aged aromatic basmati rice, saffron, aloo bukhara, and golden baby potatoes.',
      price: 490,
      category: 'Biryani',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
      available: true
    },
    {
      id: 102,
      restaurantId: 1,
      name: 'Old Dhaka Beef Tehari',
      description: 'Chinigura rice infused with pure mustard oil, tender marinated beef cubes, and green chilies.',
      price: 380,
      category: 'Biryani',
      imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?w=600&q=80',
      available: true
    },
    {
      id: 103,
      restaurantId: 1,
      name: 'Chicken Roast with Polao',
      description: 'Traditional rich wedding chicken roast served with fragrantly seasoned ghee polao.',
      price: 360,
      category: 'Platters',
      imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=600&q=80',
      available: true
    },
    {
      id: 104,
      restaurantId: 1,
      name: 'Traditional Shahi Borhani (500ml)',
      description: 'Cooling yogurt drink blended with mint, coriander, roasted cumin, and signature spices.',
      price: 110,
      category: 'Drinks',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&q=80',
      available: true
    },
    {
      id: 105,
      restaurantId: 1,
      name: 'Firni Sweet Pot',
      description: 'Creamy ground rice dessert flavored with green cardamom, saffron, and pistachio flakes.',
      price: 90,
      category: 'Desserts',
      imageUrl: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=600&q=80',
      available: true
    },
    // Sultan's Dine
    {
      id: 201,
      restaurantId: 2,
      name: "Sultan's Signature Mutton Kacchi Platter",
      description: 'Full platter featuring Mutton Kacchi, Chicken Roast, Borhani, Jali Kebab, and Firni.',
      price: 680,
      category: 'Platters',
      imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=600&q=80',
      available: true
    },
    // Pizza Hut Express
    {
      id: 301,
      restaurantId: 3,
      name: 'Super Supreme Pizza (12")',
      description: 'Generous toppings of beef pepperoni, seasoned chicken, mushrooms, green bell peppers, and olives.',
      price: 890,
      category: 'Pizzas',
      imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&q=80',
      available: true
    },
    {
      id: 302,
      restaurantId: 3,
      name: 'Cheesy Garlic Bread',
      description: 'Toasted French baguette slices covered in garlic herb butter and melted mozzarella.',
      price: 240,
      category: 'Sides',
      imageUrl: 'https://images.unsplash.com/photo-1619535860434-ba1d8fa12536?w=600&q=80',
      available: true
    },
    // Burger King & Chillox
    {
      id: 401,
      restaurantId: 4,
      name: 'Double Whopper with Cheese',
      description: 'Two flame-grilled beef patties topped with cheddar, fresh lettuce, pickles, tomatoes, and mayo.',
      price: 620,
      category: 'Burgers',
      imageUrl: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
      available: true
    },
    {
      id: 501,
      restaurantId: 5,
      name: 'Smoky Naga Beef Burger',
      description: 'Thick smashed beef patty tossed in authentic Ghost Pepper Naga glaze with melted cheddar.',
      price: 360,
      category: 'Burgers',
      imageUrl: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=600&q=80',
      available: true
    },
    {
      id: 502,
      restaurantId: 5,
      name: 'Loaded Cheesy Curly Fries',
      description: 'Crisp seasoned spiral fries drenched in warm cheddar cheese sauce and bacon bits.',
      price: 220,
      category: 'Sides',
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?w=600&q=80',
      available: true
    }
  ],
  orders: [
    {
      id: 1001,
      userId: 3,
      customerName: 'Tanvir Hasan',
      restaurantId: 1,
      restaurantName: 'Kacchi House',
      status: 'OUT_FOR_DELIVERY',
      totalAmount: 980,
      deliveryAddress: 'House 14, Road 3, Dhanmondi, Dhaka',
      estimatedDeliveryTime: '18 mins (Rider Nearby)',
      items: [
        { id: 1, itemName: 'Royal Basmati Mutton Kacchi', itemPrice: 490, quantity: 2, lineTotal: 980 }
      ],
      payment: {
        method: 'bKash',
        status: 'PAID',
        transactionRef: 'BK-89X24A09',
        paidAt: new Date(Date.now() - 15 * 60000).toISOString()
      },
      createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 5 * 60000).toISOString()
    },
    {
      id: 1002,
      userId: 3,
      customerName: 'Tanvir Hasan',
      restaurantId: 5,
      restaurantName: 'Chillox Gourmet',
      status: 'PREPARING',
      totalAmount: 580,
      deliveryAddress: 'House 14, Road 3, Dhanmondi, Dhaka',
      estimatedDeliveryTime: '25 mins',
      items: [
        { id: 2, itemName: 'Smoky Naga Beef Burger', itemPrice: 360, quantity: 1, lineTotal: 360 },
        { id: 3, itemName: 'Loaded Cheesy Curly Fries', itemPrice: 220, quantity: 1, lineTotal: 220 }
      ],
      payment: {
        method: 'Credit Card',
        status: 'PAID',
        transactionRef: 'TXN-9988214',
        paidAt: new Date(Date.now() - 10 * 60000).toISOString()
      },
      createdAt: new Date(Date.now() - 10 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60000).toISOString()
    },
    {
      id: 1003,
      userId: 3,
      customerName: 'Tanvir Hasan',
      restaurantId: 3,
      restaurantName: 'Pizza Hut Express',
      status: 'DELIVERED',
      totalAmount: 1130,
      deliveryAddress: 'House 14, Road 3, Dhanmondi, Dhaka',
      estimatedDeliveryTime: 'Delivered',
      items: [
        { id: 4, itemName: 'Super Supreme Pizza (12")', itemPrice: 890, quantity: 1, lineTotal: 890 },
        { id: 5, itemName: 'Cheesy Garlic Bread', itemPrice: 240, quantity: 1, lineTotal: 240 }
      ],
      payment: {
        method: 'Cash On Delivery',
        status: 'COMPLETED',
        transactionRef: 'COD-OFFLINE',
        paidAt: new Date(Date.now() - 2 * 86400000).toISOString()
      },
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 86400000 + 35 * 60000).toISOString()
    },
    {
      id: 1004,
      userId: 8,
      customerName: 'Ayesha Siddiqua',
      restaurantId: 1,
      restaurantName: 'Kacchi House',
      status: 'PLACED',
      totalAmount: 1470,
      deliveryAddress: 'Flat 5B, Green Road, Dhaka',
      estimatedDeliveryTime: '35 mins',
      items: [
        { id: 6, itemName: 'Royal Basmati Mutton Kacchi', itemPrice: 490, quantity: 3, lineTotal: 1470 }
      ],
      payment: {
        method: 'bKash',
        status: 'PAID',
        transactionRef: 'BK-55T990A1',
        paidAt: new Date(Date.now() - 2 * 60000).toISOString()
      },
      createdAt: new Date(Date.now() - 2 * 60000).toISOString(),
      updatedAt: new Date(Date.now() - 2 * 60000).toISOString()
    }
  ],
  metrics: {
    totalRevenue: 284500,
    totalOrders: 1420,
    activeRestaurants: 18,
    activeUsers: 3420,
    averageDeliveryMinutes: 26
  }
};

const STORAGE_KEY = 'ofos_demo_store_v1';

export const getDemoStore = (): DemoStoreData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DATA));
      return INITIAL_DEMO_DATA;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_DEMO_DATA;
  }
};

export const saveDemoStore = (store: DemoStoreData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  } catch (e) {
    console.error('Failed to save OFOS demo store', e);
  }
};

export const resetDemoStore = (): DemoStoreData => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_DEMO_DATA));
  return INITIAL_DEMO_DATA;
};
