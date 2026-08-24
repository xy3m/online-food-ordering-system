import React, { createContext, useState, useEffect } from 'react';
import api, { TOKEN_KEY, REFRESH_TOKEN_KEY } from '../services/api';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists on initial load and refresh the user from the
    // backend so we always have a real userId (avoids stale localStorage state
    // where userId may be missing, breaking owner-based queries).
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      const storedUser = localStorage.getItem('ofos_user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Failed to parse user from local storage", e);
        }
      }

      // Refresh profile in the background to get the authoritative userId/role
      api.get('/users/profile')
        .then(res => {
          const profile = res.data?.data;
          if (profile) {
            const userObj = {
              userId: profile.id,
              fullName: profile.fullName,
              email: profile.email,
              phone: profile.phone,
              role: profile.role,
              latitude: profile.latitude,
              longitude: profile.longitude,
            };
            localStorage.setItem('ofos_user', JSON.stringify(userObj));
            setUser(userObj);
          }
        })
        .catch(err => {
          console.warn("Profile refresh failed; using cached user if any", err);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, role, ...userData } = response.data.data;
    
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    const userObj = { ...userData, role };
    localStorage.setItem('ofos_user', JSON.stringify(userObj));
    setUser(userObj);
    return userObj;
  };

  const register = async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { accessToken, refreshToken, role, ...userObj } = response.data.data;
    
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    
    const fullUser = { ...userObj, role };
    localStorage.setItem('ofos_user', JSON.stringify(fullUser));
    setUser(fullUser);
    return fullUser;
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error("Logout failed on server, clearing local storage anyway", error);
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem('ofos_user');
      setUser(null);
    }
  };

  const updateLocation = (latitude: number, longitude: number) => {
    setUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, latitude, longitude };
      localStorage.setItem('ofos_user', JSON.stringify(updated));
      return updated;
    });
  };

  const switchDemoRole = (role: 'ADMIN' | 'RESTAURANT_STAFF' | 'CUSTOMER') => {
    const demoEmail = role === 'ADMIN' ? 'admin@ofos.com' : role === 'RESTAURANT_STAFF' ? 'karim@kacchihouse.com' : 'tanvir@gmail.com';
    const fallbackUser = {
      userId: role === 'ADMIN' ? 1 : role === 'RESTAURANT_STAFF' ? 2 : 3,
      id: role === 'ADMIN' ? 1 : role === 'RESTAURANT_STAFF' ? 2 : 3,
      fullName: role === 'ADMIN' ? 'System Administrator' : role === 'RESTAURANT_STAFF' ? 'Karim Uddin (Kacchi House)' : 'Tanvir Hasan (Foodie)',
      email: demoEmail,
      phone: '+880 1711-000001',
      role: role,
      latitude: 23.7500,
      longitude: 90.3800
    };
    localStorage.setItem(TOKEN_KEY, 'demo_jwt_access_token_v1');
    localStorage.setItem(REFRESH_TOKEN_KEY, 'demo_jwt_refresh_token_v1');
    localStorage.setItem('ofos_user', JSON.stringify(fallbackUser));
    setUser(fallbackUser);
    return fallbackUser;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateLocation, switchDemoRole }}>
      {children}
    </AuthContext.Provider>
  );
};
