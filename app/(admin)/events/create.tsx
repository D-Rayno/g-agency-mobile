// app/(admin)/events/create.tsx
/**
 * Premium Event Creation Form
 * Refactored with NativeWind, SelectInput, and complete wilaya list
 */

import { DateInput } from '@/components/form/DateInput';
import { SelectInput } from '@/components/form/SelectInput';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Typography } from '@/components/ui/Typography';
import { WILAYA_OPTIONS } from '@/constants/wilayas';
import { adminApi } from '@/services/api/admin-api';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Switch,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORY_OPTIONS = [
  { label: 'Sport', value: 'sport' },
  { label: 'Culture', value: 'culture' },
  { label: 'Game', value: 'game' },
  { label: 'Workshop', value: 'workshop' },
  { label: 'Conference', value: 'conference' },
  { label: 'Music', value: 'music' },
  { label: 'Art', value: 'art' },
  { label: 'Technology', value: 'technology' },
];

const EVENT_TYPE_OPTIONS = [
  { label: 'Standard Event', value: 'standard' },
  { label: 'Game Event', value: 'game' },
];

const GAME_TYPE_OPTIONS = [
  { label: 'Indoor Game', value: 'indoor' },
  { label: 'Outdoor Game', value: 'outdoor' },
  { label: 'Board Game', value: 'board' },
  { label: 'Video Game', value: 'video' },
  { label: 'Sports Game', value: 'sports' },
  { label: 'Squid Game', value: 'squid-game' },
  { label: 'Werewolf', value: 'werewolf' },
  { label: 'Escape Room', value: 'escape-room' },
];

const DIFFICULTY_OPTIONS = [
  { label: 'Easy', value: 'easy' },
  { label: 'Medium', value: 'medium' },
  { label: 'Hard', value: 'hard' },
  { label: 'Extreme', value: 'extreme' },
];

const INTENSITY_OPTIONS = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
];

interface FormData {
  name: string;
  description: string;
  category: string;
  province: string;
  commune: string;
  location: string;
  startDate: string;
  endDate: string;
  capacity: string;
  basePrice: string;
  youthPrice: string;
  seniorPrice: string;
  minAge: string;
  maxAge: string;
  eventType: string;
  gameType: string;
  difficulty: string;
  physicalIntensity: string;
  durationMinutes: string;
}

export default function CreateEventScreen() {
  const { control, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      name: '',
      description: '',
      category: 'sport',
      province: '16',
      commune: '',
      location: '',
      startDate: '',
      endDate: '',
      capacity: '50',
      basePrice: '0',
      youthPrice: '',
      seniorPrice: '',
      minAge: '18',
      maxAge: '',
      eventType: 'standard',
      gameType: '',
      difficulty: '',
      physicalIntensity: '',
      durationMinutes: '',
    },
  });

  const [loading, setLoading] = useState(false);
  const [isPublic, setIsPublic] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [requiresApproval, setRequiresApproval] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  const eventType = watch('eventType');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const onSubmit = async (data: FormData) => {
    // Validation
    if (!data.name.trim()) {
      Alert.alert('Error', 'Event name is required');
      return;
    }
    if (!data.startDate || !data.endDate) {
      Alert.alert('Error', 'Start and end dates are required');
      return;
    }

    setLoading(true);

    try {
      const eventData: any = {
        name: data.name.trim(),
        description: data.description.trim(),
        category: data.category,
        province: data.province,
        commune: data.commune.trim(),
        location: data.location.trim(),
        startDate: data.startDate,
        endDate: data.endDate,
        capacity: parseInt(data.capacity) || 50,
        basePrice: parseFloat(data.basePrice) || 0,
        youthPrice: data.youthPrice ? parseFloat(data.youthPrice) : null,
        seniorPrice: data.seniorPrice ? parseFloat(data.seniorPrice) : null,
        minAge: parseInt(data.minAge) || 18,
        maxAge: data.maxAge ? parseInt(data.maxAge) : null,
        isPublic,
        isFeatured,
        requiresApproval,
        tags,
        status: 'draft',
      };

      // Add game-specific fields if event type is game
      if (data.eventType === 'game') {
        eventData.eventType = 'game';
        eventData.gameType = data.gameType || null;
        eventData.difficulty = data.difficulty || null;
        eventData.durationMinutes = data.durationMinutes ? parseInt(data.durationMinutes) : null;
        eventData.physicalIntensity = data.physicalIntensity || null;
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
    <SafeAreaView className="flex-1 bg-gray-50">
      {/* Header */}
      <View className="bg-white px-4 py-3 flex-row items-center border-b border-gray-200">
        <TouchableOpacity 
          onPress={() => router.back()} 
          className="w-10 h-10 justify-center items-center mr-2"
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Typography variant="h5" weight="bold">Create Event</Typography>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView 
          className="flex-1" 
          contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Basic Information */}
          <Card className="mb-4 p-4">
            <Typography variant="h6" weight="bold" className="mb-4">
              <Ionicons name="information-circle" size={18} color="#4F46E5" /> Basic Information
            </Typography>
            
            <View className="mb-4">
              <Input
                label="Event Name"
                placeholder="Enter event name"
                value={watch('name')}
                onChangeText={(text) => setValue('name', text)}
                isRequired
                leftIcon={<Ionicons name="calendar" size={18} color="#6b7280" />}
              />
            </View>

            <View className="mb-4">
              <Text className="text-sm font-semibold text-gray-700 mb-2">Description</Text>
              <TextInput
                className="border-2 border-gray-200 rounded-xl p-3 bg-white text-base text-gray-900 min-h-[100px]"
                value={watch('description')}
                onChangeText={(text) => setValue('description', text)}
                placeholder="Enter event description"
                placeholderTextColor="#9ca3af"
                multiline
                textAlignVertical="top"
              />
            </View>

            <View className="mb-2">
              <SelectInput
                control={control}
                name="category"
                label="Category"
                placeholder="Select category"
                options={CATEGORY_OPTIONS}
                required
              />
            </View>
          </Card>

          {/* Location */}
          <Card className="mb-4 p-4">
            <Typography variant="h6" weight="bold" className="mb-4">
              <Ionicons name="location" size={18} color="#4F46E5" /> Location
            </Typography>

            <View className="mb-4">
              <SelectInput
                control={control}
                name="province"
                label="Province (Wilaya)"
                placeholder="Select province"
                options={WILAYA_OPTIONS}
                required
                maxDropdownHeight={300}
              />
            </View>

            <View className="mb-4">
              <Input
                label="Commune"
                placeholder="Enter commune"
                value={watch('commune')}
                onChangeText={(text) => setValue('commune', text)}
                isRequired
              />
            </View>

            <View>
              <Input
                label="Location Address"
                placeholder="Enter exact location"
                value={watch('location')}
                onChangeText={(text) => setValue('location', text)}
                isRequired
                leftIcon={<Ionicons name="pin" size={18} color="#6b7280" />}
              />
            </View>
          </Card>

          {/* Dates & Capacity */}
          <Card className="mb-4 p-4">
            <Typography variant="h6" weight="bold" className="mb-4">
              <Ionicons name="time" size={18} color="#4F46E5" /> Dates & Capacity
            </Typography>

            <View className="mb-4">
              <DateInput
                control={control}
                name="startDate"
                label="Start Date (DD/MM/YYYY)"
                required
                validationType="required"
              />
            </View>

            <View className="mb-4">
              <DateInput
                control={control}
                name="endDate"
                label="End Date (DD/MM/YYYY)"
                required
                validationType="required"
              />
            </View>

            <View>
              <Input
                label="Capacity"
                placeholder="Maximum participants"
                value={watch('capacity')}
                onChangeText={(text) => setValue('capacity', text)}
                keyboardType="numeric"
                isRequired
                leftIcon={<Ionicons name="people" size={18} color="#6b7280" />}
              />
            </View>
          </Card>

          {/* Pricing */}
          <Card className="mb-4 p-4">
            <Typography variant="h6" weight="bold" className="mb-4">
              <Ionicons name="cash" size={18} color="#4F46E5" /> Pricing
            </Typography>

            <View className="mb-4">
              <Input
                label="Base Price (DZD)"
                placeholder="0"
                value={watch('basePrice')}
                onChangeText={(text) => setValue('basePrice', text)}
                keyboardType="numeric"
                isRequired
              />
            </View>

            <View className="flex-row mb-4 gap-3">
              <View className="flex-1">
                <Input
                  label="Youth Price (<26)"
                  placeholder="Optional"
                  value={watch('youthPrice')}
                  onChangeText={(text) => setValue('youthPrice', text)}
                  keyboardType="numeric"
                  size="sm"
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Senior Price (≥60)"
                  placeholder="Optional"
                  value={watch('seniorPrice')}
                  onChangeText={(text) => setValue('seniorPrice', text)}
                  keyboardType="numeric"
                  size="sm"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Input
                  label="Min Age"
                  placeholder="18"
                  value={watch('minAge')}
                  onChangeText={(text) => setValue('minAge', text)}
                  keyboardType="numeric"
                  isRequired
                  size="sm"
                />
              </View>
              <View className="flex-1">
                <Input
                  label="Max Age"
                  placeholder="Optional"
                  value={watch('maxAge')}
                  onChangeText={(text) => setValue('maxAge', text)}
                  keyboardType="numeric"
                  size="sm"
                />
              </View>
            </View>
          </Card>

          {/* Event Type */}
          <Card className="mb-4 p-4">
            <Typography variant="h6" weight="bold" className="mb-4">
              <Ionicons name="game-controller" size={18} color="#4F46E5" /> Event Type
            </Typography>

            <View className="mb-4">
              <SelectInput
                control={control}
                name="eventType"
                label="Event Type"
                placeholder="Select type"
                options={EVENT_TYPE_OPTIONS}
              />
            </View>

            {eventType === 'game' && (
              <>
                <View className="mb-4">
                  <SelectInput
                    control={control}
                    name="gameType"
                    label="Game Type"
                    placeholder="Select game type"
                    options={GAME_TYPE_OPTIONS}
                  />
                </View>

                <View className="mb-4">
                  <SelectInput
                    control={control}
                    name="difficulty"
                    label="Difficulty Level"
                    placeholder="Select difficulty"
                    options={DIFFICULTY_OPTIONS}
                  />
                </View>

                <View className="mb-4">
                  <SelectInput
                    control={control}
                    name="physicalIntensity"
                    label="Physical Intensity"
                    placeholder="Select intensity"
                    options={INTENSITY_OPTIONS}
                  />
                </View>

                <View>
                  <Input
                    label="Duration (minutes)"
                    placeholder="e.g., 120"
                    value={watch('durationMinutes')}
                    onChangeText={(text) => setValue('durationMinutes', text)}
                    keyboardType="numeric"
                  />
                </View>
              </>
            )}
          </Card>

          {/* Options */}
          <Card className="mb-4 p-4">
            <Typography variant="h6" weight="bold" className="mb-4">
              <Ionicons name="settings" size={18} color="#4F46E5" /> Options
            </Typography>

            <View className="flex-row justify-between items-center mb-4 py-2">
              <View className="flex-row items-center">
                <Ionicons name="globe-outline" size={20} color="#6b7280" />
                <Text className="text-base text-gray-900 font-medium ml-3">Public Event</Text>
              </View>
              <Switch 
                value={isPublic} 
                onValueChange={setIsPublic} 
                trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
                thumbColor={isPublic ? '#4F46E5' : '#9ca3af'}
              />
            </View>

            <View className="flex-row justify-between items-center mb-4 py-2">
              <View className="flex-row items-center">
                <Ionicons name="star-outline" size={20} color="#6b7280" />
                <Text className="text-base text-gray-900 font-medium ml-3">Featured Event</Text>
              </View>
              <Switch 
                value={isFeatured} 
                onValueChange={setIsFeatured}
                trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
                thumbColor={isFeatured ? '#4F46E5' : '#9ca3af'}
              />
            </View>

            <View className="flex-row justify-between items-center py-2">
              <View className="flex-row items-center">
                <Ionicons name="checkmark-circle-outline" size={20} color="#6b7280" />
                <Text className="text-base text-gray-900 font-medium ml-3">Requires Approval</Text>
              </View>
              <Switch 
                value={requiresApproval} 
                onValueChange={setRequiresApproval}
                trackColor={{ false: '#d1d5db', true: '#a5b4fc' }}
                thumbColor={requiresApproval ? '#4F46E5' : '#9ca3af'}
              />
            </View>
          </Card>

          {/* Tags */}
          <Card className="mb-4 p-4">
            <Typography variant="h6" weight="bold" className="mb-4">
              <Ionicons name="pricetag" size={18} color="#4F46E5" /> Tags
            </Typography>

            <View className="flex-row mb-3 gap-2">
              <TextInput
                className="flex-1 border-2 border-gray-200 rounded-xl px-3 py-2.5 bg-white text-base text-gray-900"
                value={tagInput}
                onChangeText={setTagInput}
                placeholder="Add tag"
                placeholderTextColor="#9ca3af"
                onSubmitEditing={handleAddTag}
              />
              <TouchableOpacity 
                onPress={handleAddTag}
                className="bg-primary-600 px-4 rounded-xl justify-center"
                activeOpacity={0.8}
              >
                <Text className="text-white font-bold">Add</Text>
              </TouchableOpacity>
            </View>

            <View className="flex-row flex-wrap gap-2">
              {tags.map((tag) => (
                <View 
                  key={tag} 
                  className="bg-primary-100 px-3 py-1.5 rounded-full flex-row items-center border border-primary-200"
                >
                  <Text className="text-primary-700 font-medium text-sm">{tag}</Text>
                  <TouchableOpacity onPress={() => handleRemoveTag(tag)} className="ml-2">
                    <Ionicons name="close-circle" size={16} color="#6366f1" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </Card>

          {/* Submit Button */}
          <Button
            onPress={handleSubmit(onSubmit)}
            isDisabled={loading}
            fullWidth
            size="lg"
            gradient
            leftIcon={!loading && <Ionicons name="checkmark-circle" size={22} color="white" />}
          >
            {loading ? (
              <View className="flex-row items-center">
                <ActivityIndicator color="#fff" size="small" />
                <Text className="text-white font-bold ml-2">Creating...</Text>
              </View>
            ) : (
              'Create Event'
            )}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
