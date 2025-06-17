import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');

  useEffect(() => {
    // Fetch user data when component mounts
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      // Get the current user session
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.error('Error fetching user:', error);
        return;
      }

      // Fetch user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching profile:', profileError);
      }

      // Set the user name
      setUserName(user.user_metadata?.full_name || profile?.full_name || 'User');
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScan = () => {
    // Implement scan functionality here
    alert('Scan functionality will be implemented here');
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" color={tintColor} />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title" style={styles.title}>Welcome, {userName}</ThemedText>
        <ThemedText style={styles.subtitle}>What would you like to do today?</ThemedText>
      </View>
      
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={[styles.scanButton, { backgroundColor: tintColor }]}
          onPress={handleScan}
        >
          <Ionicons name="scan" size={40} color="white" />
          <ThemedText style={styles.scanButtonText}>Scan</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.recentScansContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Activity</ThemedText>
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={50} color="gray" />
          <ThemedText style={styles.emptyStateText}>No recent scans</ThemedText>
        </View>
      </View>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    marginTop: 5,
  },
  actionContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  scanButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scanButtonText: {
    color: 'white',
    fontWeight: 'bold',
    marginTop: 10,
    fontSize: 18,
  },
  recentScansContainer: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: 15,
    fontSize: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 10,
    opacity: 0.5,
  },
});