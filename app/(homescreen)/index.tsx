import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { supabase } from '@/lib/supabase';

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  
  const tintColor = useThemeColor({}, 'tint');
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const isDarkMode = useThemeColor({}, 'background') === '#151718';

  useEffect(() => {
    // Fetch user data when component mounts
    fetchUserData();
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
      const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (cameraPermission.status !== 'granted' || libraryPermission.status !== 'granted') {
        Alert.alert(
          'Permissions Required',
          'Please grant camera and media library permissions to use all features of this app.',
          [{ text: 'OK' }]
        );
      }
    }
  };

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

  const handleCameraCapture = async () => {
    try {
      // Request camera permissions
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Camera permission is required to take photos');
        return;
      }
      
      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Camera capture result:', result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
  };

  const handleImageUpload = async () => {
    try {
      // Request media library permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Media library permission is required to select images');
        return;
      }
      
      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      
      if (!result.canceled && result.assets && result.assets.length > 0) {
        console.log('Image upload result:', result.assets[0].uri);
        setSelectedImage(result.assets[0].uri);
        setShowPreview(true);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  const closePreview = () => {
    setShowPreview(false);
  };

  const processImage = () => {
    setProcessingImage(true);
    
    // Simulate processing with a timeout
    setTimeout(() => {
      setProcessingImage(false);
      Alert.alert('Processing Complete', 'Your image has been processed successfully!');
      closePreview();
    }, 2000);
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
          style={[styles.actionButton, { backgroundColor: tintColor }]}
          onPress={handleCameraCapture}
        >
          <Ionicons name="camera" size={30} color={isDarkMode ? '#000' : 'white'} />
          <ThemedText style={[styles.buttonText, { color: isDarkMode ? '#000' : 'white' }]}>Capture</ThemedText>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: tintColor }]}
          onPress={handleImageUpload}
        >
          <Ionicons name="image" size={30} color={isDarkMode ? '#000' : 'white'} />
          <ThemedText style={[styles.buttonText, { color: isDarkMode ? '#000' : 'white' }]}>Upload</ThemedText>
        </TouchableOpacity>
      </View>
      
      <View style={styles.recentScansContainer}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Recent Activity</ThemedText>
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={50} color="gray" />
          <ThemedText style={styles.emptyStateText}>No recent scans</ThemedText>
        </View>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressIndicator}>
        <ThemedText style={styles.progressText}>Image capture and preview implemented</ThemedText>
        <ThemedText style={styles.progressText}>Remaining: Image processing and analysis</ThemedText>
      </View>

      {/* Image Preview Modal */}
      <Modal
        visible={showPreview}
        transparent={true}
        animationType="slide"
        onRequestClose={closePreview}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor }]}>
            <View style={styles.modalHeader}>
              <ThemedText type="subtitle">Image Preview</ThemedText>
              <TouchableOpacity onPress={closePreview}>
                <Ionicons name="close" size={24} color={tintColor} />
              </TouchableOpacity>
            </View>
            
            {selectedImage ? (
              <View style={styles.imageContainer}>
                <Image 
                  source={{ uri: selectedImage }} 
                  style={styles.previewImage} 
                  resizeMode="contain"
                />
              </View>
            ) : (
              <View style={styles.noImageContainer}>
                <Ionicons name="image-outline" size={50} color="gray" />
                <ThemedText style={styles.emptyStateText}>No image selected</ThemedText>
              </View>
            )}
            
            <TouchableOpacity 
              style={[styles.processButton, { backgroundColor: tintColor }]}
              onPress={processImage}
              disabled={processingImage}
            >
              {processingImage ? (
                <ActivityIndicator color={isDarkMode ? '#000' : 'white'} />
              ) : (
                <ThemedText style={[styles.buttonText, { color: isDarkMode ? '#000' : 'white' }]}>Process Image</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
  actionButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    fontWeight: 'bold',
    marginTop: 2,
    fontSize: 16,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '90%',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  imageContainer: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginBottom: 20,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  processButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 50,
  },
  noImageContainer: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'gray',
    borderStyle: 'dashed',
  },
  progressIndicator: {
    padding: 15,
    marginTop: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'gray',
    borderStyle: 'dashed',
  },
  progressText: {
    fontSize: 14,
    marginBottom: 5,
  }
});