// Test the API connection
import { buildApiUrl, API_CONFIG } from '../config/api';

export const testApiConnection = async () => {
  try {
    // Test a simple endpoint
    const response = await fetch(buildApiUrl('/vendors/count'), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API connection test successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('API connection test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

export const testLoginEndpoint = async () => {
  try {
    const response = await fetch(buildApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username: 'admin', password: 'admin123' }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      throw new Error(errorData?.message || 'Login failed');
    }

    const data = await response.json();
    console.log('Login test successful:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Login test failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};
