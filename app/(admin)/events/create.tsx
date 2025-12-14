// app/(admin)/events/create.tsx
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { BodyText, Caption, Heading2, Heading3 } from '@/components/ui/Typography';
import { useTheme } from '@/hooks/use-theme';
import { adminApi } from '@/services/api/admin-api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Switch,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PROVINCES = [
  'Alger', 'Oran', 'Constantine', 'Annaba', 'Blida', 'Batna',
  'Djelfa', 'Sétif', 'Sidi Bel Abbès', 'Biskra', 'Tébessa', 'El Oued'
];

const CATEGORIES = ['sport', 'culture', 'game', 'workshop'];
const EVENT_TYPES = ['standard', 'game'];
const GAME_TYPES = ['indoor', 'outdoor', 'board', 'video', 'sports'];
const DIFFICULTIES = ['easy', 'medium', 'hard', 'extreme'];
const INTENSITIES = ['low', 'medium', 'high'];

export default function CreateEventScreen() {
  const { colors, spacing } = useTheme();
  const [loading, setLoading] = useState(false);
  
  // Basic Information
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('sport');
  const [province, setProvince] = useState('Alger');
  const [commune, setCommune] = useState('');
  const [location, setLocation] = useState('');
  
  // Dates
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Capacity & Pricing
  const [capacity, setCapacity] = useState('50');
  const [basePrice, setBasePrice] = useState('0');
  const [youthPrice, setYouthPrice] = useState('');
  const [seniorPrice, setSeniorPrice] = useState('');
  const [minAge, setMinAge] = useState('18');
  const [maxAge, setMaxAge] = useState('');
  
  // Options
  const [isPublic, setIsPublic] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  
  // Event Type
  const [eventType, setEventType] = useState<string>('standard');
  const [gameType, setGameType] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [physicalIntensity, setPhysicalIntensity] = useState('');
  
  // Tags
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert('Error', 'Event name is required');
      return;
    }
    if (!startDate || !endDate) {
      Alert.alert('Error', 'Start and end dates are required');
      return;
    }

    setLoading(true);

    try {
      const eventData: any = {
        name: name.trim(),
        description: description.trim(),
        category,
        province,
        commune: commune.trim(),
        location: location.trim(),
        startDate,
        endDate,
        capacity: parseInt(capacity),
        basePrice: parseFloat(basePrice),
        youthPrice: youthPrice ? parseFloat(youthPrice) : null,
        seniorPrice: seniorPrice ? parseFloat(seniorPrice) : null,
        minAge: parseInt(minAge),
        maxAge: maxAge ? parseInt(maxAge) : null,
        isPublic,
        isFeatured,
        requiresApproval,
        tags,
        status: 'draft',
      };

      // Add game-specific fields if event type is game
      if (eventType === 'game') {
        eventData.eventType = 'game';
        eventData.gameType = gameType || null;
        eventData.difficulty = difficulty || null;
        eventData.durationMinutes = durationMinutes ? parseInt(durationMinutes) : null;
        eventData.physicalIntensity = physicalIntensity || null;
      }

      const response = await adminApi.createEvent(eventData);

      if (response.success) {
        Alert.alert('Success', 'Event created successfully!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: 12,
        backgroundColor: colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: colors.border
      }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: spacing.sm }}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Heading2>Create Event</Heading2>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md }}>
        {/* Basic Information */}
        <Card className="mb-4 p-4">
          <Heading3 className="mb-4">Basic Information</Heading3>
          
          <Caption color="gray" className="mb-2">Event Name *</Caption>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.surface,
              marginBottom: spacing.md
            }}
            value={name}
            onChangeText={setName}
            placeholder="Enter event name"
            placeholderTextColor={colors.muted}
          />

          <Caption color="gray" className="mb-2">Description</Caption>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.surface,
              marginBottom: spacing.md,
              minHeight: 100,
              textAlignVertical: 'top'
            }}
            value={description}
            onChangeText={setDescription}
            placeholder="Enter event description"
            placeholderTextColor={colors.muted}
            multiline
          />

          <Caption color="gray" className="mb-2">Category *</Caption>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: spacing.md }}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                onPress={() => setCategory(cat)}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 20,
                  backgroundColor: category === cat ? colors.primary : colors.border,
                  marginRight: 8,
                  marginBottom: 8
                }}
              >
                <Caption style={{ color: category === cat ? '#fff' : colors.text, fontWeight: '600' }}>
                  {cat.toUpperCase()}
                </Caption>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Location */}
        <Card className="mb-4 p-4">
          <Heading3 className="mb-4">Location</Heading3>

          <Caption color="gray" className="mb-2">Province *</Caption>
          <View style={{
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            marginBottom: spacing.md,
            backgroundColor: colors.surface
          }}>
            {PROVINCES.map((prov) => (
              <TouchableOpacity
                key={prov}
                onPress={() => setProvince(prov)}
                style={{
                  padding: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <BodyText>{prov}</BodyText>
                {province === prov && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          <Caption color="gray" className="mb-2">Commune *</Caption>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.surface,
              marginBottom: spacing.md
            }}
            value={commune}
            onChangeText={setCommune}
            placeholder="Enter commune"
            placeholderTextColor={colors.muted}
          />

          <Caption color="gray" className="mb-2">Location Address *</Caption>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.surface
            }}
            value={location}
            onChangeText={setLocation}
            placeholder="Enter exact location"
            placeholderTextColor={colors.muted}
          />
        </Card>

        {/* Dates & Capacity */}
        <Card className="mb-4 p-4">
          <Heading3 className="mb-4">Dates & Capacity</Heading3>

          <Caption color="gray" className="mb-2">Start Date *</Caption>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.surface,
              marginBottom: spacing.md
            }}
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD HH:MM:SS"
            placeholderTextColor={colors.muted}
          />

          <Caption color="gray" className="mb-2">End Date *</Caption>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.surface,
              marginBottom: spacing.md
            }}
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD HH:MM:SS"
            placeholderTextColor={colors.muted}
          />

          <Caption color="gray" className="mb-2">Capacity *</Caption>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.surface
            }}
            value={capacity}
            onChangeText={setCapacity}
            placeholder="Maximum participants"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
          />
        </Card>

        {/* Pricing */}
        <Card className="mb-4 p-4">
          <Heading3 className="mb-4">Pricing</Heading3>

          <Caption color="gray" className="mb-2">Base Price (DA) *</Caption>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              padding: 12,
              fontSize: 16,
              color: colors.text,
              backgroundColor: colors.surface,
              marginBottom: spacing.md
            }}
            value={basePrice}
            onChangeText={setBasePrice}
            placeholder="0"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
          />

          <View style={{ flexDirection: 'row', marginBottom: spacing.md }}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Caption color="gray" className="mb-2">Youth Price (&lt;26)</Caption>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.surface
                }}
                value={youthPrice}
                onChangeText={setYouthPrice}
                placeholder="Optional"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Caption color="gray" className="mb-2">Senior Price (≥60)</Caption>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.surface
                }}
                value={seniorPrice}
                onChangeText={setSeniorPrice}
                placeholder="Optional"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, marginRight: spacing.sm }}>
              <Caption color="gray" className="mb-2">Min Age *</Caption>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.surface
                }}
                value={minAge}
                onChangeText={setMinAge}
                placeholder="18"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />
            </View>

            <View style={{ flex: 1 }}>
              <Caption color="gray" className="mb-2">Max Age</Caption>
              <TextInput
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  borderRadius: 8,
                  padding: 12,
                  fontSize: 16,
                  color: colors.text,
                  backgroundColor: colors.surface
                }}
                value={maxAge}
                onChangeText={setMaxAge}
                placeholder="Optional"
                placeholderTextColor={colors.muted}
                keyboardType="numeric"
              />
            </View>
          </View>
        </Card>

        {/* Options */}
        <Card className="mb-4 p-4">
          <Heading3 className="mb-4">Options</Heading3>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <BodyText>Public Event</BodyText>
            <Switch value={isPublic} onValueChange={setIsPublic} trackColor={{ true: colors.primary }} />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md }}>
            <BodyText>Featured Event</BodyText>
            <Switch value={isFeatured} onValueChange={setIsFeatured} trackColor={{ true: colors.primary }} />
          </View>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <BodyText>Requires Approval</BodyText>
            <Switch value={requiresApproval} onValueChange={setRequiresApproval} trackColor={{ true: colors.primary }} />
          </View>
        </Card>

        {/* Tags */}
        <Card className="mb-4 p-4">
          <Heading3 className="mb-4">Tags</Heading3>

          <View style={{ flexDirection: 'row', marginBottom: spacing.sm }}>
            <TextInput
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                padding: 12,
                fontSize: 16,
                color: colors.text,
                backgroundColor: colors.surface,
                marginRight: spacing.sm
              }}
              value={tagInput}
              onChangeText={setTagInput}
              placeholder="Add tag"
              placeholderTextColor={colors.muted}
            />
            <Button onPress={handleAddTag}>Add</Button>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {tags.map((tag) => (
              <Badge key={tag} variant="secondary" size="sm" style={{ marginRight: 8, marginBottom: 8 }}>
                {tag}
                <TouchableOpacity onPress={() => handleRemoveTag(tag)} style={{ marginLeft: 4 }}>
                  <Ionicons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </Badge>
            ))}
          </View>
        </Card>

        {/* Submit Button */}
        <Button
          onPress={handleSubmit}
          disabled={loading}
          style={{ marginBottom: spacing.lg }}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Ionicons name="checkmark" size={20} color="#fff" style={{ marginRight: 8 }} />
              Create Event
            </>
          )}
        </Button>
      </ScrollView>
    </SafeAreaView>
  );
}
