import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OnboardingScreen() {
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [allergies, setAllergies] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<{
    email: string | null;
    fullName: string | null;
  }>({ email: null, fullName: null });

  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const isDark = useThemeColor({}, 'background') === '#151718';

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
        // Redirect to login if no user is found
        router.replace('/(loginscreen)/login');
        return;
      }

      // Set the user data
      setUserData({
        email: user.email || null,
        fullName: user.user_metadata?.full_name || 'User',
      });
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    }
  };

  const handleSubmit = async () => {
    if (!age || !height || !weight || !allergies) {
      Alert.alert('Missing Information', 'Please fill in all fields to complete your profile.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'User not found. Please log in again.');
        router.replace('/(loginscreen)/login');
        return;
      }
      
      // Insert user profile data into a new 'profiles' table
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name,
          age: parseInt(age),
          height: parseFloat(height),
          weight: parseFloat(weight),
          allergies: allergies,
          onboarding_completed: true
        });
      
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        // Redirect to home screen after successful onboarding
        router.replace('/(homescreen)');
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Onboarding error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <LinearGradient
          colors={isDark ? 
            ['#1f2224', '#252a2e', '#1f2224'] : 
            ['#f8fafc', '#ffffff', '#f8fafc']}
          style={styles.gradient}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <ThemedText type="title" style={styles.title}>Complete Your Profile</ThemedText>
            <ThemedText style={styles.subtitle}>We need some information to personalize your experience</ThemedText>
            
            <View style={styles.formSection}>
              <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
              
              <ThemedText style={styles.label}>Name</ThemedText>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={userData.fullName || ''}
                  editable={false}
                  placeholderTextColor="#888"
                />
              </View>
              
              <ThemedText style={styles.label}>Email</ThemedText>
              <View style={styles.inputContainer}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  value={userData.email || ''}
                  editable={false}
                  placeholderTextColor="#888"
                />
              </View>
              
              <ThemedText style={styles.sectionTitle}>Health Information</ThemedText>
              
              <ThemedText style={styles.label}>Age <ThemedText style={styles.required}>*</ThemedText></ThemedText>
              <View style={[styles.inputContainer, !age && styles.requiredField]}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Enter your age"
                  value={age}
                  onChangeText={setAge}
                  keyboardType="number-pad"
                  placeholderTextColor="#888"
                />
              </View>
              
              <ThemedText style={styles.label}>Height (cm) <ThemedText style={styles.required}>*</ThemedText></ThemedText>
              <View style={[styles.inputContainer, !height && styles.requiredField]}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Enter your height in cm"
                  value={height}
                  onChangeText={setHeight}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#888"
                />
              </View>
              
              <ThemedText style={styles.label}>Weight (kg) <ThemedText style={styles.required}>*</ThemedText></ThemedText>
              <View style={[styles.inputContainer, !weight && styles.requiredField]}>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="Enter your weight in kg"
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="decimal-pad"
                  placeholderTextColor="#888"
                />
              </View>
              
              <ThemedText style={styles.sectionTitle}>Dietary Information</ThemedText>
              
              <ThemedText style={styles.label}>Food Allergies <ThemedText style={styles.required}>*</ThemedText></ThemedText>
              <View style={[styles.inputContainer, !allergies && styles.requiredField]}>
                <TextInput
                  style={[styles.input, { color: textColor }, styles.textArea]}
                  placeholder="List any food allergies (or type 'None' if you have no allergies)"
                  value={allergies}
                  onChangeText={setAllergies}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor="#888"
                />
              </View>
            </View>
            
            <LinearGradient
              colors={isDark ? ['#4a90e2', '#63b3ed'] : ['#3182ce', '#4299e1']}
              style={styles.button}
            >
              <TouchableOpacity 
                style={styles.buttonTouchable}
                onPress={handleSubmit}
                disabled={isLoading}
              >
                <ThemedText style={styles.buttonText}>
                  {isLoading ? 'Saving...' : 'Complete Profile'}
                </ThemedText>
              </TouchableOpacity>
            </LinearGradient>
            
            <ThemedText style={styles.note}>All fields marked with <ThemedText style={styles.required}>*</ThemedText> are required</ThemedText>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.8,
  },
  formSection: {
    marginBottom: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    marginTop: 16,
  },
  label: {
    marginBottom: 8,
    fontWeight: '500',
  },
  required: {
    color: '#ff3b30',
    fontWeight: 'bold',
  },
  requiredField: {
    borderColor: 'rgba(255, 59, 48, 0.3)',
  },
  inputContainer: {
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  input: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
    paddingTop: 14,
  },
  button: {
    borderRadius: 16,
    marginBottom: 16,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  buttonTouchable: {
    width: '100%',
    paddingVertical: 18,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
    letterSpacing: 0.5,
  },
  note: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
    fontSize: 14,
  },
});