import { supabase } from '@/lib/supabase';
import { useRouter } from 'expo-router';
import { Search } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';

// Shape of car data we'll fetch
interface CarListItem {
  id: string;
  brand: string;
  model: string;
  price_per_day: number;
  location: string;
  status: string;
  car_images: { image_url: string }[];  // joined from car_images table
}

export default function SearchScreen() {
  const router = useRouter();
  const [cars, setCars] = useState<CarListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Fetch cars on mount
  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    setLoading(true);

    // Query: Get available cars with their primary image
    const { data, error } = await supabase
      .from('cars')
      .select(`
        id,
        brand,
        model,
        price_per_day,
        location,
        status,
        car_images ( image_url )
      `)
      .eq('status', 'Available')
      .eq('car_images.is_primary', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch cars:', error.message);
    } else {
      setCars(data || []);
    }
    setLoading(false);
  };

  // 2. Filter by search query (client-side)
  const filteredCars = cars.filter(car => {
    const query = searchQuery.toLowerCase();
    return (
      car.brand.toLowerCase().includes(query) ||
      car.model.toLowerCase().includes(query) ||
      car.location.toLowerCase().includes(query)
    );
  });

  // 3. Render each car card
  const renderCarCard = ({ item }: { item: CarListItem }) => {
    const imageUrl = item.car_images?.[0]?.image_url;

    return (
      <Pressable
        className="bg-gray-100 rounded-xl mb-3 mx-4 overflow-hidden shadow-md border border-gray-400"
        onPress={() => router.push(`/(protected)/car/${item.id}`)}
      >
        {/* Car Image */}
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            className="w-full h-40"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-gray-200 justify-center items-center">
            <Text className="text-gray-400">No Image</Text>
          </View>
        )}

        {/* Car Info */}
        <View className="p-3">
          <Text className="text-lg font-bold text-gray-900">
            {item.brand} {item.model}
          </Text>
          <Text className="text-sm text-gray-500 mt-1">
            📍 {item.location}
          </Text>
          <Text className="text-base font-semibold text-blue-500 mt-2">
            {item.price_per_day.toLocaleString()} MMK / day
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <View className="flex-1 bg-gray-50">
      {/* Search Bar */}
      <View className="flex-row items-center bg-white mx-4 mt-3 mb-2 px-3 py-2 rounded-full border border-gray-400">
        <Search size={18} color="#9ca3af" />
        <TextInput
          className="flex-1 ml-2 text-base"
          placeholder="Search by brand, model, or location..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Car List */}
      {loading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator size="large" color="#16a8e3" />
        </View>
      ) : (
        <FlatList
          data={filteredCars}
          keyExtractor={(item) => item.id}
          renderItem={renderCarCard}
          contentContainerStyle={{ paddingVertical: 8 }}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center mt-20">
              <Text className="text-gray-400 text-base">No cars found</Text>
            </View>
          }
        />
      )}
    </View>
  );
}
