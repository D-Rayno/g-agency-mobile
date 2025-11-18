// components/modal/legacy-project-detail.tsx - WITH CAROUSEL
import { Feather, MaterialIcons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { SafeAreaView } from "react-native-safe-area-context";

import Button from "@/components/button";
import { useI18n } from "@/context/i18n";
import { useTheme } from "@/hooks/use-theme";
import {
  formatLegacyLocation,
  getImageUri,
  getLegacyProgressColor,
  getLegacyStatusColor,
  legacyProjectService,
} from "@/services/legacy-project";
import { LegacyProject, LegacyProjectDetail } from "@/types/legacy-project";
import { Animated } from "react-native";

interface LegacyProjectDetailModalProps {
  visible: boolean;
  project: LegacyProject | null;
  onClose: () => void;
}

const { width, height } = Dimensions.get("window");
const CAROUSEL_HEIGHT = 300;

export const LegacyProjectDetailModal: React.FC<
  LegacyProjectDetailModalProps
> = ({ visible, project, onClose }) => {
  const { colors, typography, spacing, radius } = useTheme();
  const { t } = useI18n();
  const [projectDetail, setProjectDetail] =
    useState<LegacyProjectDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Animated values for pagination dots
  const dotAnimations = React.useRef<Animated.Value[]>([]).current;

  const styles = StyleSheet.create({
    modalContainer: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: spacing.lg,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      shadowColor: colors.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    headerTitle: {
      fontSize: typography.subheading.fontSize,
      fontWeight: typography.subheading.fontWeight,
      color: colors.text,
      flex: 1,
      marginLeft: spacing.md,
    },
    scrollContent: {
      flex: 1,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    loadingText: {
      marginTop: spacing.md,
      fontSize: typography.body.fontSize,
      color: colors.muted,
    },
    errorContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: spacing.xl,
    },
    errorText: {
      fontSize: typography.body.fontSize,
      color: colors.danger,
      textAlign: "center",
      marginBottom: spacing.lg,
    },
    carouselContainer: {
      height: CAROUSEL_HEIGHT,
      backgroundColor: colors.card,
    },
    carouselItem: {
      width: width,
      height: CAROUSEL_HEIGHT,
      position: "relative",
    },
    carouselImage: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    carouselPlaceholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    imageOverlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      padding: spacing.lg,
    },
    overlayTitle: {
      fontSize: typography.heading.fontSize,
      fontWeight: typography.heading.fontWeight,
      color: colors.light,
      marginBottom: spacing.xs,
    },
    overlayLocation: {
      fontSize: typography.body.fontSize,
      color: colors.light + "CC",
    },
    badges: {
      position: "absolute",
      top: spacing.md,
      left: spacing.md,
      right: spacing.md,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      zIndex: 10,
    },
    badgesLeft: {
      flexDirection: "column",
      gap: spacing.xs,
      maxWidth: "60%",
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs / 2,
    },
    statusText: {
      fontSize: typography.caption.fontSize,
      fontWeight: "600",
      color: colors.light,
    },
    progressBadge: {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs / 2,
      alignSelf: "flex-start"
    },
    progressText: {
      fontSize: typography.caption.fontSize,
      fontWeight: "600",
      color: colors.light,
    },
    paginationContainer: {
      position: "absolute",
      bottom: spacing.md,
      alignSelf: "center",
      flexDirection: "row",
      gap: spacing.xs,
      zIndex: 5,
    },
    paginationDot: {
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.light + "50",
    },
    imageCounter: {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      borderRadius: radius.sm,
    },
    imageCounterText: {
      fontSize: typography.caption.fontSize,
      fontWeight: "600",
      color: colors.light,
    },
    content: {
      padding: spacing.lg,
      gap: spacing.lg,
    },
    section: {
      gap: spacing.md,
    },
    sectionTitle: {
      fontSize: typography.subheading.fontSize,
      fontWeight: typography.subheading.fontWeight,
      color: colors.text,
    },
    description: {
      fontSize: typography.body.fontSize,
      color: colors.text,
      lineHeight: 24,
    },
    infoGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.md,
    },
    infoCard: {
      flex: 1,
      minWidth: (width - spacing.lg * 3) / 2,
      backgroundColor: colors.card,
      padding: spacing.md,
      borderRadius: radius.md,
      alignItems: "center",
      borderWidth: 1,
      borderColor: colors.border,
    },
    infoIcon: {
      marginBottom: spacing.sm,
    },
    infoValue: {
      fontSize: typography.subheading.fontSize,
      fontWeight: typography.subheading.fontWeight,
      color: colors.text,
      marginBottom: spacing.xs / 2,
      textAlign: "center",
    },
    infoLabel: {
      fontSize: typography.caption.fontSize,
      color: colors.muted,
    },
    apartmentSection: {
      gap: spacing.md,
    },
    apartmentGrid: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.sm,
    },
    apartmentChip: {
      backgroundColor: colors.primary + "20",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.primary + "30",
      minWidth: 80,
      alignItems: "center",
    },
    apartmentText: {
      fontSize: typography.body.fontSize,
      color: colors.primary,
      fontWeight: "600",
    },
    appartementsList: {
      gap: spacing.md,
    },
    appartementCard: {
      backgroundColor: colors.card,
      padding: spacing.md,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    appartementHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.sm,
    },
    appartementTitle: {
      fontSize: typography.body.fontSize,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
    },
    appartementBadge: {
      backgroundColor: colors.success + "20",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.success + "30",
    },
    appartementBadgeText: {
      fontSize: typography.caption.fontSize,
      color: colors.success,
      fontWeight: "600",
    },
    appartementSurface: {
      fontSize: typography.caption.fontSize,
      color: colors.muted,
      marginBottom: spacing.sm,
    },
    appartementCarousel: {
      height: 150,
      borderRadius: radius.md,
      overflow: "hidden",
    },
    appartementPhoto: {
      width: "100%",
      height: "100%",
      borderRadius: radius.md,
    },
    appartementPhotoPlaceholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
  });

  useEffect(() => {
    if (visible && project && project.slug) {
      loadProjectDetail();
    }
  }, [visible, project]);

  // Initialize dot animations when images change
  useEffect(() => {
    const images = getMainCarouselImages();
    if (images.length > 0 && dotAnimations.length !== images.length) {
      dotAnimations.length = 0;
      for (let i = 0; i < images.length; i++) {
        dotAnimations.push(new Animated.Value(i === 0 ? 1 : 0));
      }
    }
  }, [projectDetail]);

  // Animate dots when current index changes
  useEffect(() => {
    if (dotAnimations.length > 0) {
      dotAnimations.forEach((anim, index) => {
        Animated.timing(anim, {
          toValue: index === currentImageIndex ? 1 : 0,
          duration: 300,
          useNativeDriver: false,
        }).start();
      });
    }
  }, [currentImageIndex, dotAnimations]);

  const loadProjectDetail = async () => {
    if (!project || !project.slug) return;

    try {
      setIsLoading(true);
      setError(null);

      const detail = await legacyProjectService.fetchProjectDetail(
        project.slug
      );
      setProjectDetail(detail as any);
      setCurrentImageIndex(0);
    } catch (error: any) {
      console.error("Failed to load legacy project detail:", error);
      setError(error.message || t("legacyProjects.modal.failedToLoadDetails"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setProjectDetail(null);
    setError(null);
    setCurrentImageIndex(0);
    onClose();
  };

  // Collect all images for the main carousel
  const getMainCarouselImages = () => {
    if (!projectDetail) return [];

    const images = [];

    // Add main project photo first
    if (projectDetail.photo) {
      images.push({
        id: "main",
        url: projectDetail.photo,
        type: "main",
      });
    }

    // Add project photos
    if (projectDetail.photos && projectDetail.photos.length > 0) {
      projectDetail.photos.forEach((photo) => {
        images.push({
          id: photo.id.toString(),
          url: photo.url,
          type: "project",
        });
      });
    }

    // Add apartment photos
    if (projectDetail.appartements && projectDetail.appartements.length > 0) {
      projectDetail.appartements.forEach((apt) => {
        if (apt.photos && apt.photos.length > 0) {
          apt.photos.forEach((photo) => {
            images.push({
              id: `apt-${apt.id}-${photo.id}`,
              url: photo.url,
              type: "apartment",
              apartmentName: apt.nom_appartement,
            });
          });
        }
      });
    }

    return images;
  };

  const renderMainCarousel = () => {
    const images = getMainCarouselImages();

    if (images.length === 0) {
      return (
        <View style={styles.carouselContainer}>
          <View style={styles.carouselPlaceholder}>
            <MaterialIcons name="apartment" size={60} color={colors.muted} />
            <Text style={{ color: colors.muted, marginTop: spacing.sm }}>
              {t("legacyProjects.modal.noImagesAvailable")}
            </Text>
          </View>
        </View>
      );
    }

    const statusColor = getLegacyStatusColor(projectDetail!.statut);
    const progressColor = getLegacyProgressColor(projectDetail!.etat_avance);

    return (
      <View style={styles.carouselContainer}>
        <Carousel
          width={width}
          height={CAROUSEL_HEIGHT}
          data={images}
          onSnapToItem={(index) => setCurrentImageIndex(index)}
          renderItem={({ item }) => (
            <View style={styles.carouselItem}>
              <Image
                source={{ uri: getImageUri(item.url) }}
                style={styles.carouselImage}
              />
            </View>
          )}
          loop={images.length > 1}
          autoPlay={false}
          scrollAnimationDuration={300}
        />

        {/* Status and Progress Badges */}
        <View style={styles.badges}>
          <View style={styles.badgesLeft}>
            <View
              style={[styles.statusBadge, { backgroundColor: statusColor }]}
            >
              <MaterialIcons name="info" size={14} color={colors.light} />
              <Text style={styles.statusText}>{projectDetail!.statut}</Text>
            </View>

            {projectDetail!.etat_avance > 0 && (
              <View style={styles.progressBadge}>
                <MaterialIcons
                  name="trending-up"
                  size={14}
                  color={progressColor}
                />
                <Text style={styles.progressText}>
                  {projectDetail!.etat_avance}%
                </Text>
              </View>
            )}
          </View>

          {/* Image Counter */}
          {images.length > 1 && (
            <View style={styles.imageCounter}>
              <Text style={styles.imageCounterText}>
                {currentImageIndex + 1} / {images.length}
              </Text>
            </View>
          )}
        </View>

        {/* Animated Pagination Dots */}
        {images.length > 1 && images.length <= 10 && (
          <View style={styles.paginationContainer}>
            {images.map((_, index) => {
              const width =
                dotAnimations[index]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [8, 24],
                }) || 8;

              const opacity =
                dotAnimations[index]?.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }) || 0.5;

              return (
                <Animated.View
                  key={index}
                  style={[
                    styles.paginationDot,
                    {
                      width,
                      opacity,
                      backgroundColor: colors.light,
                    },
                  ]}
                />
              );
            })}
          </View>
        )}

        {/* Title Overlay */}
        <View style={styles.imageOverlay}>
          <Text style={styles.overlayTitle}>{projectDetail!.nom_projet}</Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xs,
            }}
          >
            <Feather name="map-pin" size={16} color={colors.light + "CC"} />
            <Text style={styles.overlayLocation}>
              {formatLegacyLocation(projectDetail!.localite)} -{" "}
              {projectDetail!.adresse}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderAppartementCarousel = (photos: any[]) => {
    if (!photos || photos.length === 0) return null;

    return (
      <View style={styles.appartementCarousel}>
        <Carousel
          width={width - spacing.lg * 4}
          height={150}
          data={photos}
          renderItem={({ item }) => (
            <Image
              source={{ uri: getImageUri(item.url) }}
              style={styles.appartementPhoto}
            />
          )}
          loop={photos.length > 1}
          autoPlay={false}
          scrollAnimationDuration={300}
        />
      </View>
    );
  };

  const renderAppartements = () => {
    if (
      !projectDetail?.appartements ||
      projectDetail.appartements.length === 0
    ) {
      return null;
    }

    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {t("legacyProjects.modal.availableApartments")}
        </Text>
        <View style={styles.appartementsList}>
          {projectDetail.appartements.map((appartement) => (
            <View key={appartement.id} style={styles.appartementCard}>
              <View style={styles.appartementHeader}>
                <Text style={styles.appartementTitle}>
                  {appartement.nom_appartement ||
                    t("legacyProjects.modal.apartment")}
                </Text>
                {appartement.is_temoin && (
                  <View style={styles.appartementBadge}>
                    <Text style={styles.appartementBadgeText}>
                      {t("legacyProjects.modal.showUnit")}
                    </Text>
                  </View>
                )}
              </View>

              {appartement.surface && (
                <Text style={styles.appartementSurface}>
                  {t("legacyProjects.modal.surface")}:{" "}
                  {String(appartement.surface)}
                </Text>
              )}

              {appartement.photos &&
                appartement.photos.length > 0 &&
                renderAppartementCarousel(appartement.photos)}
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>
            {t("legacyProjects.modal.loadingDetails")}
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button
            title={t("common.retry")}
            onPress={loadProjectDetail}
            variant="primary"
            icon={{ family: "Feather", name: "refresh-cw", size: 16 }}
          />
        </View>
      );
    }

    if (!projectDetail) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>
            {t("legacyProjects.modal.noDetailsAvailable")}
          </Text>
        </View>
      );
    }

    const progressColor = getLegacyProgressColor(projectDetail.etat_avance);

    return (
      <ScrollView
        style={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Main Image Carousel */}
        {renderMainCarousel()}

        {/* Content */}
        <View style={styles.content}>
          {/* Description Section */}
          {(projectDetail.description || projectDetail.description2) && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t("legacyProjects.modal.aboutProject")}
              </Text>
              {projectDetail.description && (
                <Text style={styles.description}>
                  {projectDetail.description}
                </Text>
              )}
              {projectDetail.description2 && (
                <Text style={styles.description}>
                  {projectDetail.description2}
                </Text>
              )}
            </View>
          )}

          {/* Project Info Grid */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {t("legacyProjects.modal.projectInfo")}
            </Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoCard}>
                <MaterialIcons
                  name="apartment"
                  size={24}
                  color={colors.primary}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoValue}>
                  {projectDetail.blocs || t("common.notAvailable")}
                </Text>
                <Text style={styles.infoLabel}>
                  {t("legacyProjects.modal.blocks", {
                    count: projectDetail.blocs || 0,
                  })}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <Feather
                  name="home"
                  size={24}
                  color={colors.primary}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoValue}>
                  {projectDetail.appartements?.length || 0}
                </Text>
                <Text style={styles.infoLabel}>
                  {t("legacyProjects.modal.apartments")}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <MaterialIcons
                  name="location-on"
                  size={24}
                  color={colors.primary}
                  style={styles.infoIcon}
                />
                <Text style={styles.infoValue}>
                  {formatLegacyLocation(projectDetail.localite)}
                </Text>
                <Text style={styles.infoLabel}>
                  {t("legacyProjects.modal.location")}
                </Text>
              </View>

              <View style={styles.infoCard}>
                <MaterialIcons
                  name="trending-up"
                  size={24}
                  color={progressColor}
                  style={styles.infoIcon}
                />
                <Text style={[styles.infoValue, { color: progressColor }]}>
                  {projectDetail.etat_avance}%
                </Text>
                <Text style={styles.infoLabel}>
                  {t("legacyProjects.modal.progress")}
                </Text>
              </View>
            </View>
          </View>

          {/* Available Apartment Types */}
          {projectDetail.appartements_list &&
            projectDetail.appartements_list.length > 0 && (
              <View style={styles.apartmentSection}>
                <Text style={styles.sectionTitle}>
                  {t("legacyProjects.modal.availableApartmentTypes")}
                </Text>
                <View style={styles.apartmentGrid}>
                  {projectDetail.appartements_list.map((type, index) => (
                    <View key={index} style={styles.apartmentChip}>
                      <Text style={styles.apartmentText}>{type}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

          {/* Apartments Details with Individual Carousels */}
          {renderAppartements()}

          {/* Characteristics */}
          {projectDetail.caracteristiques &&
            projectDetail.caracteristiques.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>
                  {t("legacyProjects.modal.projectFeatures")}
                </Text>
                <View style={styles.apartmentGrid}>
                  {projectDetail.caracteristiques.map((caracteristique) => (
                    <View key={caracteristique.id} style={styles.apartmentChip}>
                      <Text style={styles.apartmentText}>
                        {caracteristique.nom_caracteristique}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
        </View>
      </ScrollView>
    );
  };

  if (!project) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="formSheet"
    >
      <SafeAreaView style={styles.modalContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleClose}>
            <Feather name="x" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {t("legacyProjects.modal.projectDetails")}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Content */}
        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
};

export default LegacyProjectDetailModal;
