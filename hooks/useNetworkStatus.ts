import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import { studentDataService } from '../services/studentDataService';

// Conditional import for NetInfo (only for React Native)
let NetInfo: any = null;
if (Platform.OS !== 'web') {
  try {
    NetInfo = require('@react-native-community/netinfo');
  } catch (error) {
    console.log('NetInfo not available on this platform');
  }
}

interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type: string;
  isOffline: boolean;
}

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
    type: 'unknown',
    isOffline: false,
  });

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    if (Platform.OS === 'web') {
      // Web-specific network detection
      const handleOnline = () => {
        setNetworkStatus(prev => ({
          ...prev,
          isConnected: true,
          isInternetReachable: true,
          isOffline: false,
        }));
        studentDataService.checkNetworkStatus();
      };

      const handleOffline = () => {
        setNetworkStatus(prev => ({
          ...prev,
          isConnected: false,
          isInternetReachable: false,
          isOffline: true,
        }));
      };

      // Initial check
      setNetworkStatus(prev => ({
        ...prev,
        isConnected: navigator.onLine,
        isInternetReachable: navigator.onLine,
        isOffline: !navigator.onLine,
        type: 'web',
      }));

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      // React Native network detection
      if (NetInfo) {
        unsubscribe = NetInfo.addEventListener(state => {
          const isOffline = !state.isConnected || !state.isInternetReachable;

          setNetworkStatus({
            isConnected: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable ?? false,
            type: state.type || 'unknown',
            isOffline,
          });

          // Update student data service offline status
          if (isOffline) {
            console.log('Network: Going offline');
          } else {
            console.log('Network: Back online');
            studentDataService.checkNetworkStatus();
          }
        });
      } else {
        // Fallback for platforms without NetInfo
        console.log('NetInfo not available, assuming online');
      }

      return () => {
        if (unsubscribe) {
          unsubscribe();
        }
      };
    }
  }, []);

  // Manual network check function
  const checkNetworkStatus = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // For web, we can try a simple fetch to check connectivity
        const response = await fetch('https://www.google.com/favicon.ico', {
          method: 'HEAD',
          mode: 'no-cors',
        });
        const isOnline = true; // If fetch doesn't throw, we're online
        
        setNetworkStatus(prev => ({
          ...prev,
          isConnected: isOnline,
          isInternetReachable: isOnline,
          isOffline: !isOnline,
        }));
        
        return isOnline;
      } else {
        // For React Native, use NetInfo if available
        if (NetInfo) {
          const state = await NetInfo.fetch();
          const isOnline = state.isConnected && state.isInternetReachable;

          setNetworkStatus({
            isConnected: state.isConnected ?? false,
            isInternetReachable: state.isInternetReachable ?? false,
            type: state.type || 'unknown',
            isOffline: !isOnline,
          });

          return isOnline;
        } else {
          // Fallback: assume online
          setNetworkStatus(prev => ({
            ...prev,
            isConnected: true,
            isInternetReachable: true,
            isOffline: false,
          }));
          return true;
        }
      }
    } catch (error) {
      console.log('Network check failed:', error);
      setNetworkStatus(prev => ({
        ...prev,
        isConnected: false,
        isInternetReachable: false,
        isOffline: true,
      }));
      return false;
    }
  };

  return {
    ...networkStatus,
    checkNetworkStatus,
    refresh: checkNetworkStatus,
  };
}

// Simplified hook for just offline status
export function useOfflineStatus() {
  const { isOffline } = useNetworkStatus();
  return isOffline;
}

// Hook for network-aware data fetching
export function useNetworkAwareData<T>(
  fetchFunction: () => Promise<T>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isOffline, checkNetworkStatus } = useNetworkStatus();

  const fetchData = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      // Check network status first
      const isOnline = await checkNetworkStatus();
      
      if (!isOnline && !forceRefresh) {
        console.log('Offline - using cached data if available');
      }

      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      console.error('Network-aware data fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, dependencies);

  // Refetch when coming back online
  useEffect(() => {
    if (!isOffline && data === null) {
      fetchData();
    }
  }, [isOffline]);

  return {
    data,
    loading,
    error,
    isOffline,
    refetch: () => fetchData(true),
    refresh: () => fetchData(false),
  };
}

export default useNetworkStatus;
