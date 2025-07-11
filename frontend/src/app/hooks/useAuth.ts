import { useEffect, useState } from "react";
import { loginUser } from "./authService";
import { toast } from "react-toastify";
import { buildApiUrl, API_CONFIG } from '../../config/api';

type UserType = "HOD" | "MANAGER" | "EXECUTIVE" | "SUPERADMIN";

interface LoginResponse {
  access_token: string;
  id: number;
  userType: UserType;
  message: string;
}

interface UserDetails {
  id: number;
  username: string;
  name: string;
  userType: UserType;
  email?: string;
  departmentName?: string;
}

interface UseAuthReturn {
  login: (username: string, password: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
  userId: number | null;
  userType: UserType | null;
  userDetails: UserDetails | null;
  logout: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [userType, setUserType] = useState<UserType | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);

  const isTokenExpired = (token: string): boolean => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 < Date.now();
    } catch {
      return true;
    }
  };

  const fetchUserDetails = async (id: number): Promise<UserDetails | null> => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(buildApiUrl(`${API_CONFIG.ENDPOINTS.USERS}/${id}`), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user details');
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error fetching user details:', error);
      return null;
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { access_token, id, userType }: LoginResponse = await loginUser(
        username,
        password
      );

      if (isTokenExpired(access_token)) {
        throw new Error("Token is expired.");
      }

      localStorage.setItem("access_token", access_token);
      localStorage.setItem("userId", id.toString());
      localStorage.setItem("userType", userType);

      setUserId(id);
      setUserType(userType);

      // Fetch user details
      const userData = await fetchUserDetails(id);
      if (userData) {
        setUserDetails(userData);
      }

      toast.success("Login successful!");
      return true;
    } catch (error: any) {
      setError(error.message || "Login failed. Please try again.");
      toast.error(error.message || "Login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.clear();
    setUserId(null);
    setUserType(null);
    setUserDetails(null);
    toast.info("You have been logged out.");
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const storedUserId = localStorage.getItem("userId");
    const storedUserType = localStorage.getItem("userType");

    if (token && isTokenExpired(token)) {
      logout();
    } else if (storedUserId && storedUserType) {
      const id = Number(storedUserId);
      setUserId(id);
      setUserType(storedUserType as UserType);
      
      // Fetch user details if we have a valid token and user ID
      if (token) {
        fetchUserDetails(id).then(userData => {
          if (userData) {
            setUserDetails(userData);
          }
        });
      }
    }
  }, []);

  return { login, loading, error, userId, userType, userDetails, logout };
};
