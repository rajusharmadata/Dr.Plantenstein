import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from "react-native";
import { FontAwesome5 } from "@expo/vector-icons";
import { COLORS, RADIUS, SPACING } from "../../src/constants/theme";
import { TYPOGRAPHY } from "../../src/constants/typography";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Button } from "../../src/components/Button";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { analyzeLeaf } from "../../src/services/api";

export default function ScanScreen() {
  const router = useRouter();
  const { preselectedUri } = useLocalSearchParams<{ preselectedUri?: string }>();

  // Permissions hooks
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [locationPermission, setLocationPermission] = useState<Location.PermissionStatus | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const cameraRef = useRef<CameraView>(null);

  // Request permissions on mount
  useEffect(() => {
    (async () => {
      if (!cameraPermission?.granted && cameraPermission?.canAskAgain) {
        await requestCameraPermission();
      }
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status);
    })();
  }, [cameraPermission, requestCameraPermission]);

  // If opened from gallery button on home screen, auto-run analysis
  useEffect(() => {
    if (preselectedUri && !isUploading) {
      runAnalysis(preselectedUri);
    }
  }, [preselectedUri]);

  const runAnalysis = async (imageUri: string) => {
    setIsUploading(true);
    try {
      let location: { latitude: number; longitude: number } | undefined;
      if (locationPermission === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        location = { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
      }

      const result = await analyzeLeaf(imageUri, location);

      // Navigate to results with the record ID from MongoDB
      router.push({ pathname: "/results", params: { id: result._id, uri: imageUri } });
    } catch (err: any) {
      Alert.alert("Analysis Failed", err.message || "Could not reach the server. Make sure it's running.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync();
      if (photo?.uri) {
        await runAnalysis(photo.uri);
      }
    } catch (err) {
      Alert.alert("Camera Error", "Failed to take picture. Please try again.");
    }
  };

  const handleUpload = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      await runAnalysis(result.assets[0].uri);
    }
  };

  if (!cameraPermission) {
    // Camera permissions are still loading
    return <View style={styles.container} />;
  }

  if (!cameraPermission.granted) {
    // Camera permissions are not granted yet
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permissionText}>We need your permission to show the camera</Text>
        <Button 
          title="Grant Permission" 
          onPress={requestCameraPermission} 
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Live Camera View */}
      <CameraView style={styles.cameraView} facing="back" ref={cameraRef} />

      {/* Overlays (No longer children of CameraView to fix Expo warning) */}
      <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
        {/* Header Overlay */}
        <View style={styles.headerOverlay}>
          <View style={styles.headerTitle}>
            <FontAwesome5 name="leaf" size={18} color={COLORS.primary} style={{ marginRight: SPACING.sm }} />
            <Text style={[TYPOGRAPHY.h3, { color: COLORS.primary }]}>Dr. Planteinstein</Text>
          </View>
          <Text style={[TYPOGRAPHY.small, { color: COLORS.primary, fontWeight: "700" }]}>HI/EN</Text>
        </View>

        {/* Framing Box */}
        <View style={styles.frameContainer}>
          <View style={[styles.corner, styles.topLeft]} />
          <View style={[styles.corner, styles.topRight]} />
          <View style={[styles.corner, styles.bottomLeft]} />
          <View style={[styles.corner, styles.bottomRight]} />
        </View>

        {/* Tooltips */}
        <View style={styles.tooltipContainer}>
          <View style={styles.tooltip}>
            <FontAwesome5 name="sun" size={16} color={COLORS.primary} style={styles.tooltipIcon} />
            <Text style={styles.tooltipText}>Ensure good lighting</Text>
          </View>
          <View style={styles.tooltip}>
            <FontAwesome5 name="crosshairs" size={16} color={COLORS.primary} style={styles.tooltipIcon} />
            <Text style={styles.tooltipText}>Focus on affected area</Text>
          </View>
        </View>

        {/* Uploading Overlay */}
        {isUploading && (
          <View style={styles.uploadingOverlay}>
            <ActivityIndicator size="large" color={COLORS.white} />
            <Text style={styles.uploadingText}>Analyzing leaf...</Text>
          </View>
        )}

        {/* Bottom Controls */}
        <View style={styles.controlsContainer}>
          <Text style={styles.captureHint}>CAPTURE LEAF IMAGE</Text>
          
          {/* Capture Button */}
          <TouchableOpacity
            style={styles.captureButtonWrapper}
            onPress={handleCapture}
            activeOpacity={0.8}
            disabled={isUploading}
          >
            <View style={styles.captureButtonOuter}>
              <View style={[styles.captureButtonInner, isUploading && { opacity: 0.5 }]} />
            </View>
          </TouchableOpacity>

          <Button 
            title={isUploading ? "Analyzing..." : "Upload Image"}
            variant="secondary" 
            icon="upload" 
            style={styles.uploadButton} 
            onPress={handleUpload}
            disabled={isUploading}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
  },
  permissionText: {
    ...TYPOGRAPHY.h3,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  cameraView: {
    flex: 1,
  },
  headerOverlay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingTop: 60, // approximate safe area
    paddingBottom: SPACING.md,
    backgroundColor: "rgba(242, 245, 233, 0.9)", // slightly transparent top bar
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  frameContainer: {
    position: "absolute",
    top: "30%",
    alignSelf: "center",
    width: 250,
    height: 250,
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: "rgba(255,255,255,0.7)",
  },
  topLeft: {
    top: 0,
    left: 0,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderTopLeftRadius: RADIUS.md,
  },
  topRight: {
    top: 0,
    right: 0,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderTopRightRadius: RADIUS.md,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderBottomLeftRadius: RADIUS.md,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderBottomRightRadius: RADIUS.md,
  },
  tooltipContainer: {
    position: "absolute",
    top: "15%",
    alignSelf: "center",
    alignItems: "center",
    gap: SPACING.sm, 
  },
  tooltip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: RADIUS.pill,
    minWidth: 200,
  },
  tooltipIcon: {
    marginRight: SPACING.sm,
  },
  tooltipText: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.textPrimary,
  },
  controlsContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: "center",
    paddingBottom: 40, // space for tab bar
    paddingHorizontal: SPACING.lg,
  },
  captureHint: {
    ...TYPOGRAPHY.small,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 1,
    marginBottom: SPACING.md,
  },
  captureButtonWrapper: {
    marginBottom: SPACING.xl,
  },
  captureButtonOuter: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 4,
    borderColor: "rgba(255, 255, 255, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  captureButtonInner: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.primary,
  },
  uploadButton: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 99,
  },
  uploadingText: {
    ...TYPOGRAPHY.bodySemibold,
    color: COLORS.white,
    marginTop: SPACING.md,
    letterSpacing: 0.5,
  },
});
