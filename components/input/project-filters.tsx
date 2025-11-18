// components/input/project-filters.tsx - FIXED
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { StyleSheet, Text, View } from 'react-native';

import Button from '@/components/button';
import { SelectInput } from '@/components/input/select';
import { useI18n } from '@/context/i18n';
import { useTheme } from '@/hooks/use-theme';
import { legacyProjectService } from '@/services/legacy-project';
import { LegacyProjectFilters } from '@/types/legacy-project';

type LegacyFilterFormData = {
  localite: string;
  statut: string;
  typologie: string;
};

interface LegacyProjectFiltersProps {
  onFiltersChange: (filters: LegacyProjectFilters) => void;
  isLoading?: boolean;
  initialFilters?: LegacyProjectFilters;
}

interface FilterOptions {
  localites: Array<{ label: string; value: string }>;
  statuts: Array<{ label: string; value: string }>;
  typologies: Array<{ label: string; value: string }>;
}

export const LegacyProjectFiltersComponent: React.FC<LegacyProjectFiltersProps> = ({
  onFiltersChange,
  isLoading = false,
  initialFilters = {},
}) => {
  const { colors, typography, spacing } = useTheme();
  const { t } = useI18n();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    localites: [],
    statuts: [],
    typologies: [],
  });
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);

  const { control, watch, reset } = useForm<LegacyFilterFormData>({
    defaultValues: {
      localite: initialFilters.localite || '',
      statut: initialFilters.statut || '',
      typologie: initialFilters.typologie || '',
    },
  });

  // Watch form values
  const watchedValues = watch();

  // Helper function - MOVED ABOVE WHERE IT'S USED
  const getFilterLabel = useCallback((key: keyof LegacyFilterFormData, value: string): string => {
    switch (key) {
      case 'localite':
        return formatLocationLabel(value);
      case 'statut':
        return value;
      case 'typologie':
        return value;
      default:
        return value;
    }
  }, []);

  const formatLocationLabel = useCallback((localite: string): string => {
    if (!localite) return t('common.unknown');
    return localite
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }, [t]);

  // Memoize the filter creation to prevent unnecessary re-renders
  const currentFilters = useMemo(() => {
    const filters: LegacyProjectFilters = {};
    
    if (watchedValues.localite && watchedValues.localite !== '') {
      filters.localite = watchedValues.localite;
    }
    if (watchedValues.statut && watchedValues.statut !== '') {
      filters.statut = watchedValues.statut;
    }
    if (watchedValues.typologie && watchedValues.typologie !== '') {
      filters.typologie = watchedValues.typologie;
    }

    return filters;
  }, [watchedValues.localite, watchedValues.statut, watchedValues.typologie]);

  // Memoize active filters to prevent unnecessary re-calculations
  const activeFilters = useMemo(() => {
    return Object.entries(watchedValues)
      .filter(([_, value]) => value && value !== '')
      .map(([key, value]) => ({
        key,
        label: getFilterLabel(key as keyof LegacyFilterFormData, value as string),
      }));
  }, [watchedValues, getFilterLabel]);

  // Use useCallback to prevent the function from changing on every render
  const handleFiltersChange = useCallback((filters: LegacyProjectFilters) => {
    onFiltersChange(filters);
  }, [onFiltersChange]);

  // Apply filters when they change, but only after options are loaded
  useEffect(() => {
    if (!isLoadingOptions) {
      // Add a small delay to prevent rapid consecutive calls
      const timeoutId = setTimeout(() => {
        handleFiltersChange(currentFilters);
      }, 100);

      return () => clearTimeout(timeoutId);
    }
  }, [currentFilters, isLoadingOptions, handleFiltersChange]);

  // Load filter options on component mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  const loadFilterOptions = async () => {
    try {
      setIsLoadingOptions(true);
      const options = await legacyProjectService.getFilterOptions();
      
      setFilterOptions({
        localites: [
          { label: t('legacyProjects.filters.allLocations'), value: '' },
          ...options.localites.map(localite => ({
            label: formatLocationLabel(localite),
            value: localite,
          })),
        ],
        statuts: [
          { label: t('legacyProjects.filters.allStatus'), value: '' },
          ...options.statuts.map(status => ({
            label: status,
            value: status,
          })),
        ],
        typologies: [
          { label: t('legacyProjects.filters.allTypes'), value: '' },
          ...options.typologies.map(type => ({
            label: type,
            value: type,
          })),
        ],
      });
    } catch (error) {
      console.error('Failed to load legacy filter options:', error);
      // Set fallback options
      setFilterOptions({
        localites: [{ label: t('legacyProjects.filters.allLocations'), value: '' }],
        statuts: [{ label: t('legacyProjects.filters.allStatus'), value: '' }],
        typologies: [{ label: t('legacyProjects.filters.allTypes'), value: '' }],
      });
    } finally {
      setIsLoadingOptions(false);
    }
  };

  const onClearFilters = useCallback(() => {
    reset({
      localite: '',
      statut: '',
      typologie: '',
    });
  }, [reset]);

  const hasActiveFilters = activeFilters.length > 0;

  const styles = StyleSheet.create({
    container: {
      backgroundColor: colors.card,
      borderRadius: 8,
      margin: spacing.md,
      padding: spacing.md,
      shadowColor: colors.dark,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    title: {
      fontSize: typography.body.fontSize,
      fontWeight: '600',
      color: colors.text,
      marginBottom: spacing.sm,
    },
    filtersRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.sm,
    },
    filterColumn: {
      flex: 1,
    },
    typologyRow: {
      flexDirection: 'row',
      gap: spacing.sm,
      alignItems: 'flex-end',
    },
    typologyColumn: {
      flex: 1,
    },
    activeFiltersContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginTop: spacing.sm,
    },
    activeFilterChip: {
      backgroundColor: colors.primary + '20',
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: colors.primary + '40',
    },
    activeFilterText: {
      fontSize: Number(typography.caption.fontSize) - 1,
      color: colors.primary,
      fontWeight: '600',
    },
    loadingText: {
      textAlign: 'center',
      color: colors.muted,
      fontSize: typography.caption.fontSize,
      fontStyle: 'italic',
      paddingVertical: spacing.sm,
    },

  });

  if (isLoadingOptions) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>{t('legacyProjects.filters.loadingFilters')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('legacyProjects.filters.title')}</Text>
      
      {/* Main Filters Row */}
      <View style={styles.filtersRow}>
        <View style={styles.filterColumn}>
          <SelectInput
            control={control}
            name="localite"
            placeholder={t('legacyProjects.filters.location')}
            options={filterOptions.localites}
          />
        </View>
        
        <View style={styles.filterColumn}>
          <SelectInput
            control={control}
            name="statut"
            placeholder={t('legacyProjects.filters.status')}
            options={filterOptions.statuts}
          />
        </View>
      </View>

      {/* Typology Row with Clear Button */}
      <View style={styles.typologyRow}>
        <View style={styles.typologyColumn}>
          <SelectInput
            control={control}
            name="typologie"
            placeholder={t('legacyProjects.filters.apartmentType')}
            options={filterOptions.typologies}
          />
        </View>
        
        {/* Clear Button - Only show when filters are active */}
        {hasActiveFilters && (
 
            <Button
              variant="secondary"
              soft={true}
              onPress={onClearFilters}
              disabled={isLoading}
              compact={true}
              icon={{
                family: "Feather",
                name: "x",
                size: 18,
              }}
              style={{height: 44, width: 44}}
            />

        )}
      </View>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <View style={styles.activeFiltersContainer}>
          {activeFilters.map(filter => (
            <View key={filter.key} style={styles.activeFilterChip}>
              <Text style={styles.activeFilterText}>
                {filter.label}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

export default LegacyProjectFiltersComponent;