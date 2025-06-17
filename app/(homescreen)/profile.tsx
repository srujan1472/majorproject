import { router, useNavigation } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, ScrollView, Alert, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { supabase } from '@/lib/supabase';

export default function ProfileScreen() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<{
    email: string | null;
    fullName: string | null;
    age: number | null;
    height: number | null;
    weight: number | null;
    allergies: string | null;
  }>({ 
    email: null, 
    fullName: null,
    age: null,
    height: null,
    weight: null,
    allergies: null
  });

  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');

  // Use useFocusEffect to fetch data every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('Profile screen focused - fetching fresh data');
      setLoading(true);
      fetchUserData();
      
      return () => {
        // Cleanup function when screen loses focus (optional)
      };
    }, [])
  );

  const fetchUserData = async () => {
    try {
      // Get the current user session
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        console.error('Error fetching user:', error);
        // Redirect to login if no user is found
        router.replace('/(loginscreen)/login');
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

      // Check if onboarding is completed
      if (!profile?.onboarding_completed) {
        // Redirect to onboarding if not completed
        router.replace('/(homescreen)/onboarding');
        return;
      }

      // Set the user data
      setUserData({
        email: user.email || null,
        fullName: user.user_metadata?.full_name || profile?.full_name || 'User',
        age: profile?.age || null,
        height: profile?.height || null,
        weight: profile?.weight || null,
        allergies: profile?.allergies || null
      });
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Logout", 
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              router.replace('/(loginscreen)/login');
            } catch (error) {
              console.error('Error signing out:', error);
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <ActivityIndicator size="large" color={tintColor} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.title}>Your Profile</ThemedText>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={textColor} />
            <ThemedText style={styles.logoutText}>Logout</ThemedText>
          </TouchableOpacity>
        </View>
        
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Personal Information</ThemedText>
            
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Name:</ThemedText>
              <ThemedText>{userData.fullName}</ThemedText>
            </View>
            
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Email:</ThemedText>
              <ThemedText>{userData.email}</ThemedText>
            </View>
          </View>

          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Health Information</ThemedText>
            
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Age:</ThemedText>
              <ThemedText>{userData.age !== null ? userData.age : 'Not provided'}</ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Height:</ThemedText>
              <ThemedText>{userData.height !== null ? `${userData.height} cm` : 'Not provided'}</ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Weight:</ThemedText>
              <ThemedText>{userData.weight !== null ? `${userData.weight} kg` : 'Not provided'}</ThemedText>
            </View>
          </View>

          <View style={styles.card}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>Dietary Information</ThemedText>
            
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Allergies:</ThemedText>
            </View>
            <ThemedText style={styles.allergyText}>{userData.allergies || 'None'}</ThemedText>
          </View>
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginTop: 10,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
  },
  logoutText: {
    marginLeft: 4,
    fontWeight: '600',
    color: '#FF3B30',
  },
  card: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#ccc',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
  },
  infoRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 4,
  },
  label: {
    fontWeight: 'bold',
    marginRight: 8,
    minWidth: 70,
  },
  allergyText: {
    marginTop: 4,
    paddingLeft: 4,
  },
});