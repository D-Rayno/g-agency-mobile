// components/card/legacy-project.tsx - WITH TRANSLATIONS
import { Feather, MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useI18n } from "@/context/i18n";
import { useTheme } from "@/hooks/use-theme";
import {
  formatLegacyLocation,
  getImageUri,
  getLegacyProgressColor,
  getLegacyStatusColor,
} from "@/services/legacy-project";
import { LegacyProject } from "@/types/legacy-project";

interface LegacyProjectCardProps {
  project: LegacyProject;
  onPress: (project: LegacyProject) => void;
}

const LegacyProjectCard: React.FC<LegacyProjectCardProps> = ({
  project,
  onPress,
}) => {
  const { colors, typography, spacing, radius } = useTheme();
  const { t } = useI18n();

  const statusColor = getLegacyStatusColor(project.statut);
  const progressColor = getLegacyProgressColor(project.etat_avance);

  const styles = StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: radius.lg,
      shadowColor: colors.dark,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
      overflow: "hidden",
    },
    imageContainer: {
      width: "100%",
      height: 200,
      position: "relative",
      backgroundColor: colors.background,
    },
    image: {
      width: "100%",
      height: "100%",
      resizeMode: "cover",
    },
    imagePlaceholder: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.background,
    },
    overlay: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: "linear-gradient(transparent, rgba(0,0,0,0.7))",
      padding: spacing.md,
    },
    overlayTitle: {
      fontSize: typography.subheading.fontSize,
      fontWeight: typography.subheading.fontWeight,
      color: colors.light,
      marginBottom: spacing.xs / 2,
    },
    overlayLocation: {
      fontSize: typography.body.fontSize,
      color: colors.light + "CC",
      flexDirection: "row",
      alignItems: "center",
    },
    badges: {
      position: "absolute",
      top: spacing.sm,
      left: spacing.sm,
      right: spacing.sm,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    statusBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: radius.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs / 2,
      maxWidth: "60%",
    },
    statusText: {
      fontSize: typography.caption.fontSize,
      fontWeight: "600",
      color: colors.light,
      flexShrink: 1,
    },
    progressBadge: {
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs / 2,
      borderRadius: radius.sm,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs / 2,
    },

    content: {
      padding: spacing.md,
    },
    title: {
      fontSize: typography.subheading.fontSize,
      fontWeight: typography.subheading.fontWeight,
      color: colors.text,
      marginBottom: spacing.xs,
      lineHeight: 22,
    },
    description: {
      fontSize: typography.body.fontSize,
      color: colors.muted,
      lineHeight: 20,
      marginBottom: spacing.sm,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: spacing.sm,
    },
    infoItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs / 2,
      flex: 1,
    },
    infoText: {
      fontSize: typography.caption.fontSize,
      color: colors.muted,
      flexShrink: 1,
    },
    apartmentTypes: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: spacing.xs / 2,
      marginVertical: spacing.xs,
    },
    apartmentChip: {
      backgroundColor: colors.primary + "15",
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      borderRadius: radius.sm,
      borderWidth: 1,
      borderColor: colors.primary + "30",
    },
    apartmentText: {
      fontSize: Number(typography.caption.fontSize) - 1,
      color: colors.primary,
      fontWeight: "600",
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    progressContainer: {
      flex: 1,
      marginRight: spacing.md,
    },
    progressLabel: {
      fontSize: typography.caption.fontSize,
      color: colors.muted,
      marginBottom: spacing.xs / 2,
    },
    progressBar: {
      height: 4,
      backgroundColor: colors.border,
      borderRadius: 2,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      borderRadius: 2,
    },
    progressText: {
      fontSize: typography.caption.fontSize,
      fontWeight: "600",
      marginTop: spacing.xs / 2,
      color: colors.light,
    },
    viewButton: {
      backgroundColor: colors.primary + "15",
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: radius.md,
      flexDirection: "row",
      alignItems: "center",
      gap: spacing.xs / 2,
      marginStart: "auto"
    },
    viewButtonText: {
      fontSize: typography.body.fontSize,
      color: colors.primary,
      fontWeight: "600",
    },
  });

  const handlePress = () => {
    onPress(project);
  };

  const truncateText = (text: string, maxLength: number): string => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength) + "...";
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      {/* Hero Image */}
      <View style={styles.imageContainer}>
        {project.photo ? (
          <Image
            source={{ uri: getImageUri(project.photo) }}
            style={styles.image}
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <MaterialIcons name="apartment" size={40} color={colors.muted} />
          </View>
        )}

        {/* Status and Progress Badges */}
        <View style={styles.badges}>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <MaterialIcons name="info" size={12} color={colors.light} />
            <Text style={styles.statusText} numberOfLines={1}>
              {project.statut}
            </Text>
          </View>

          {project.etat_avance > 0 && (
            <View style={styles.progressBadge}>
              <MaterialIcons
                name="trending-up"
                size={12}
                color={progressColor}
              />
              <Text style={styles.progressText}>{project.etat_avance}%</Text>
            </View>
          )}
        </View>

        {/* Title Overlay */}
        <View style={styles.overlay}>
          <Text style={styles.overlayTitle} numberOfLines={2}>
            {project.nom_projet}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: spacing.xs / 2,
            }}
          >
            <Feather name="map-pin" size={14} color={colors.light + "CC"} />
            <Text style={styles.overlayLocation} numberOfLines={1}>
              {formatLegacyLocation(project.localite)}
            </Text>
          </View>
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Description */}
        {project.description && (
          <Text style={styles.description} numberOfLines={2}>
            {truncateText(project.description, 100)}
          </Text>
        )}

        {/* Info Row */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialIcons name="apartment" size={16} color={colors.muted} />
            <Text style={styles.infoText}>
              {project.blocs
                ? t('legacyProjects.card.blocksCount', { 
                    count: project.blocs, 
                    block: project.blocs > 1 ? t('legacyProjects.card.blocks') : t('legacyProjects.card.block')
                  })
                : t('common.notAvailable')
              }
            </Text>
          </View>

          <View style={styles.infoItem}>
            <Feather name="home" size={16} color={colors.muted} />
            <Text style={styles.infoText}>
              {t('legacyProjects.card.apartmentTypes', { count: project.appartements_list?.length || 0 })}
            </Text>
          </View>
        </View>

        {/* Address */}
        <View style={styles.infoItem}>
          <MaterialIcons name="location-on" size={16} color={colors.muted} />
          <Text style={styles.infoText} numberOfLines={1}>
            {project.adresse}
          </Text>
        </View>

        {/* Apartment Types */}
        {project.appartements_list && project.appartements_list.length > 0 && (
          <View style={styles.apartmentTypes}>
            {project.appartements_list.slice(0, 4).map((type, index) => (
              <View key={index} style={styles.apartmentChip}>
                <Text style={styles.apartmentText}>{type}</Text>
              </View>
            ))}
            {project.appartements_list.length > 4 && (
              <View style={styles.apartmentChip}>
                <Text style={styles.apartmentText}>
                  +{project.appartements_list.length - 4}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          {/* Progress */}
          {project.etat_avance > 0 && (
            <View style={styles.progressContainer}>
              <Text style={styles.progressLabel}>{t('legacyProjects.card.progress')}</Text>
              <View style={styles.progressBar}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      width: `${project.etat_avance}%`,
                      backgroundColor: progressColor,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: progressColor }]}>
                {project.etat_avance}%
              </Text>
            </View>
          )}

          {/* View Button */}
          <TouchableOpacity style={styles.viewButton} onPress={handlePress}>
            <Text style={styles.viewButtonText}>{t('legacyProjects.card.view')}</Text>
            <Feather name="arrow-right" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default LegacyProjectCard