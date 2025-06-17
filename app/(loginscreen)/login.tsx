import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Dimensions, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { supabase } from '@/lib/supabase';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Input refs for keyboard navigation
  const passwordRef = useRef<TextInput>(null);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const isDark = useThemeColor({}, 'background') === '#151718';
  
  useEffect(() => {
    // Start animations when component mounts
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      })
    ]).start();
  }, []);
  
  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Missing Information', 'Please enter both email and password.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        Alert.alert('Error', error.message);
      } else {
        // Check if user has completed onboarding
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Check if user has a profile with onboarding_completed
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('id', user.id)
            .single();
          
          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Error fetching profile:', profileError);
          }
          
          // Redirect based on onboarding status
          if (profile?.onboarding_completed) {
            router.replace('/(homescreen)');
          } else {
            router.replace('/(homescreen)/onboarding');
          }
        } else {
          router.replace('/(homescreen)');
        }
      }
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToSignup = () => {
    router.replace('./signup');
  };

  const navigateToForgotPassword = () => {
    router.replace('./forgot-password');
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <StatusBar style={isDark ? "light" : "dark"} />
        <LinearGradient
          colors={isDark ? 
            ['#1f2224', '#252a2e', '#1f2224'] : 
            ['#f0f9ff', '#e0f2fe', '#f0f9ff']}
          style={styles.gradient}
        >
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Animated.View 
              style={[styles.contentContainer, {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }]}
            >
              <View style={styles.logoContainer}>
                <Image 
                  source={require('@/assets/images/react-logo.png')} 
                  style={styles.logo} 
                  contentFit="contain"
                />
              </View>
              
              <ThemedView style={styles.formContainer}>
                <ThemedText type="title" style={styles.title}>Food Scanner</ThemedText>
                <ThemedText style={styles.subtitle}>Scan. Check. Eat Safe.</ThemedText>
                
                <ThemedView style={styles.inputContainer}>
                  <ThemedView 
                    style={styles.inputWrapper}
                    lightColor="rgba(255,255,255,0.95)"
                    darkColor="rgba(40,45,50,0.8)"
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons 
                        name="mail-outline" 
                        size={20} 
                        color={isDark ? "#aaa" : tintColor} 
                      />
                    </View>
                    <TextInput 
                      value={email}
                      onChangeText={setEmail}
                      style={[styles.input, { color: textColor }]}
                      placeholder="Email"
                      placeholderTextColor={isDark ? "#aaa" : "#888"}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      returnKeyType="next"
                      onSubmitEditing={() => passwordRef.current?.focus()}
                      blurOnSubmit={false}
                    />
                  </ThemedView>
                  
                  <ThemedView 
                    style={styles.inputWrapper}
                    lightColor="rgba(255,255,255,0.95)"
                    darkColor="rgba(40,45,50,0.8)"
                  >
                    <View style={styles.iconContainer}>
                      <Ionicons 
                        name="lock-closed-outline" 
                        size={20} 
                        color={isDark ? "#aaa" : tintColor} 
                      />
                    </View>
                    <TextInput 
                      ref={passwordRef}
                      value={password}
                      onChangeText={setPassword}
                      style={[styles.input, { color: textColor }]}
                      placeholder="Password"
                      placeholderTextColor={isDark ? "#aaa" : "#888"}
                      secureTextEntry={!showPassword}
                      autoComplete="password"
                      returnKeyType="done"
                      onSubmitEditing={handleLogin}
                    />
                    <TouchableOpacity 
                      style={styles.passwordToggle} 
                      onPress={togglePasswordVisibility}
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off-outline" : "eye-outline"} 
                        size={20} 
                        color={isDark ? "#aaa" : "#888"} 
                      />
                    </TouchableOpacity>
                  </ThemedView>

                  <TouchableOpacity 
                    style={styles.forgotPassword}
                    onPress={navigateToForgotPassword}
                  >
                    <ThemedText style={styles.forgotPasswordText}>Forgot Password?</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
                
                <TouchableOpacity 
                  style={[styles.button, isLoading && styles.buttonDisabled]}
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={['#0a7ea4', '#0a9ec4']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <View style={styles.loadingContainer}>
                        <Animated.View style={{
                          transform: [{
                            rotate: fadeAnim.interpolate({
                              inputRange: [0, 1],
                              outputRange: ['0deg', '360deg']
                            })
                          }]
                        }}>
                          <Ionicons name="refresh-outline" size={20} color="white" />
                        </Animated.View>
                        <ThemedText style={[styles.buttonText, {marginLeft: 8}]}>Logging in...</ThemedText>
                      </View>
                    ) : (
                      <ThemedText style={styles.buttonText}>Login</ThemedText>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
                
                <ThemedView style={styles.footer}>
                  <ThemedText style={styles.footerText}>Don't have an account? </ThemedText>
                  <TouchableOpacity onPress={navigateToSignup}>
                    <ThemedText style={[styles.link, { color: tintColor }]}>Sign Up</ThemedText>
                  </TouchableOpacity>
                </ThemedView>
              </ThemedView>
            </Animated.View>
          </ScrollView>
        </LinearGradient>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Styles remain the same
const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 16,
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: width * 0.22,
    height: width * 0.22,
    maxWidth: 110,
    maxHeight: 110,
  },
  formContainer: {
    width: '100%',
    maxWidth: 380,
    padding: 28,
    borderRadius: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 36,
    textAlign: 'center',
    opacity: 0.8,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 1,
    height: 56,
  },
  iconContainer: {
    paddingLeft: 16,
    paddingRight: 8,
    width: 44,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  input: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    paddingHorizontal: 8,
    height: 56,
  },
  passwordToggle: {
    padding: 10,
    marginRight: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginTop: 4,
    marginBottom: 8,
    padding: 4, // Increase touch target
  },
  forgotPasswordText: {
    fontSize: 14,
    opacity: 0.7,
  },
  button: {
    width: '100%',
    marginBottom: 20,
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.8,
  },
  buttonGradient: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  footerText: {
    fontSize: 15,
  },
  link: {
    fontWeight: 'bold',
    fontSize: 15,
  },
});