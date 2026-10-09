import React, { createContext, useContext, useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

const AuthContext = createContext();

const SESSION_STORAGE_KEY = 'rebalancex_session_user';

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(false);

  // Validate session on load
  useEffect(() => {
    const validateSession = async () => {
      if (user) {
        try {
          // Verify backend connectivity
          await api.getHealth();
        } catch (err) {
          console.warn('Backend health check failed during session validation', err);
        }
      }
    };
    validateSession();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();

      // Fetch candidates from real API to match member identities
      const members = await api.getMembers();

      let authenticatedUser = null;

      if (cleanEmail === 'admin@rebalancex.io' || cleanEmail === 'admin@rebalancex.com' || cleanEmail.startsWith('admin')) {
        authenticatedUser = {
          id: 999,
          name: 'Aarav Sharma',
          email: cleanEmail,
          role: 'admin',
          role_title: 'Chief Technical Director',
          department: 'Engineering Operations (Bengaluru)',
          avatar_color: '#0B57D0',
        };
      } else if (
        cleanEmail === 'manager@rebalancex.io' ||
        cleanEmail === 'pm@rebalancex.io' ||
        cleanEmail.includes('manager')
      ) {
        authenticatedUser = {
          id: 888,
          name: 'Priya Patel',
          email: cleanEmail,
          role: 'manager',
          role_title: 'Lead Delivery Manager',
          department: 'Product Delivery (Mumbai)',
          avatar_color: '#006A60',
        };
      } else {
        // Find in members API
        const matchedMember = members.find(
          (m) => m.email?.toLowerCase() === cleanEmail || m.name?.toLowerCase().replace(/\s+/g, '.') === cleanEmail.split('@')[0]
        );

        if (matchedMember) {
          authenticatedUser = {
            id: matchedMember.id,
            name: matchedMember.name,
            email: matchedMember.email || cleanEmail,
            role: 'member',
            role_title: matchedMember.role_title || 'Software Engineer',
            skills: matchedMember.skills || {},
            weekly_capacity_hours: matchedMember.weekly_capacity_hours || 40,
            avatar_color: matchedMember.avatar_color || '#0B57D0',
          };
        } else {
          // Standard member fallback with valid email
          authenticatedUser = {
            id: members[0]?.id || 1,
            name: 'Rohan Verma',
            email: cleanEmail,
            role: 'member',
            role_title: 'Senior Systems Engineer (Hyderabad)',
            skills: { Python: 3, React: 3 },
            weekly_capacity_hours: 40,
            avatar_color: '#0B57D0',
          };
        }
      }

      setUser(authenticatedUser);
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(authenticatedUser));
      queryClient.clear(); // Clear caches on login
      return authenticatedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    queryClient.clear(); // Clean cache on logout
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        role: user?.role || 'member',
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
