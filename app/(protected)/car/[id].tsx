import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { MapPin, MessageCircle } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';

interface CarDetail {
  id: string;
  brand: string;
  model: string;
  price_per_day: number;
  location: string;
  description: string | null;
  seats: number | null;
  car_type: string | null;
  status: string;
  owner_id: string;
  // Joined data:
  profiles: { id: string; full_name: string; avatar_url: string | null };
  car_images: { id: string; image_url: string; is_primary: boolean }[];
}

export default function CarDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchCarDetail();
  }, [id]);

  const fetchCarDetail = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('cars')
      .select(`
        *,
        profiles:owner_id ( id, full_name, avatar_url ),
        car_images ( id, image_url, is_primary )
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Failed to fetch car:', error.message);
      Alert.alert('Error', 'Could not load car details.');
    } else {
      setCar(data);
      // Set header title dynamically
      navigation.setOptions({ title: `${data.brand} ${data.model}` });
    }
    setLoading(false);
  };

  // 💬 Navigate to chat with owner (wired up in Plan 05)
  const handleContactOwner = () => {
    if (!car) return;
    if (car.owner_id === user?.id) {
      Alert.alert('Info', 'This is your own car listing.');
      return;
    }
    // TODO: Plan 05 will create this route
    router.push(`/(protected)/chat/${car.owner_id}`);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16a8e3" />
      </View>
    );
  }

  if (!car) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <Text className="text-gray-400">Car not found</Text>
      </View>
    );
  }

  // Sort images: primary first
  const sortedImages = [...(car.car_images || [])].sort(
    (a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)
  );

  return (
    <View className="flex-1 bg-white">
      <ScrollView>
        {/* Car Image */}
        {sortedImages.length > 0 ? (
          <Image
            source={{ uri: sortedImages[0].image_url }}
            className="w-full h-56"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-56 bg-gray-200 justify-center items-center">
            <Text className="text-gray-400">No Image</Text>
          </View>
        )}

        <View className="p-4">
          {/* Title & Price */}
          <Text className="text-2xl font-bold text-gray-900">
            {car.brand} {car.model}
          </Text>
          <Text className="text-xl font-semibold text-blue-500 mt-1">
            {car.price_per_day.toLocaleString()} MMK / day
          </Text>

          {/* Location */}
          <View className="flex-row items-center mt-3">
            <MapPin size={16} color="#6b7280" />
            <Text className="text-gray-500 ml-1">{car.location}</Text>
          </View>

          {/* Quick Info */}
          {(car.seats || car.car_type) && (
            <View className="flex-row mt-3 gap-3">
              {car.seats && (
                <View className="bg-gray-100 px-3 py-1.5 rounded-full">
                  <Text className="text-gray-600 text-sm">{car.seats} seats</Text>
                </View>
              )}
              {car.car_type && (
                <View className="bg-gray-100 px-3 py-1.5 rounded-full">
                  <Text className="text-gray-600 text-sm">{car.car_type}</Text>
                </View>
              )}
            </View>
          )}

          {/* Description */}
          {car.description && (
            <View className="mt-4">
              <Text className="text-base font-semibold text-gray-800 mb-1">Description</Text>
              <Text className="text-gray-600 leading-5">{car.description}</Text>
            </View>
          )}

          {/* Owner Info */}
          <View className="flex-row items-center mt-5 p-3 bg-gray-50 rounded-xl">
            <Image
              source={{ uri: car.profiles.avatar_url || 'https://via.placeholder.com/40' }}
              className="w-10 h-10 rounded-full bg-gray-200"
            />
            <View className="ml-3 flex-1">
              <Text className="text-sm text-gray-400">Listed by</Text>
              <Text className="text-base font-semibold text-gray-900">
                {car.profiles.full_name}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Bottom Bar: Chat Circle */}
      <View className="flex-row items-center justify-between px-4 py-3 border-t border-gray-100 bg-white">
        <View>
          <Text className="text-xl font-bold text-gray-900">
            {car.price_per_day.toLocaleString()} MMK
          </Text>
          <Text className="text-xs text-gray-400">per day</Text>
        </View>
        <Pressable
          onPress={handleContactOwner}
          className="w-12 h-12 rounded-full bg-blue-500 justify-center items-center shadow-md"
        >
          <MessageCircle size={22} color="white" />
        </Pressable>
      </View>
    </View>
  );
}
