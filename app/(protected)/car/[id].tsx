import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView } from 'react-native';

import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';

import { BookmarkIcon, CarIcon, ChevronLeftIcon, MapPinIcon, MessageCircleIcon, SnowflakeIcon, StarIcon, UsersIcon } from 'lucide-react-native';

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
    }
    setLoading(false);
  };

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
      <Box className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#16a8e3" />
      </Box>
    );
  }

  if (!car) {
    return (
      <Box className="flex-1 justify-center items-center bg-white">
        <Text className="text-typography-400">Car not found</Text>
      </Box>
    );
  }

  // Sort images: primary first
  const sortedImages = [...(car.car_images || [])].sort(
    (a, b) => (b.is_primary ? 1 : 0) - (a.is_primary ? 1 : 0)
  );

  const heroImage = sortedImages[0]?.image_url || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=600';

  return (
    <Box className="flex-1 bg-[#f0f4f8] relative">

      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>

        {/* 1. Hero Image with Floating Buttons */}
        <Box className="relative w-full h-72">
          <Image
            source={{ uri: heroImage }}
            className="w-full h-full"
            alt="Car Hero"
            resizeMode="cover"
          />

          {/* Floating Back & Bookmark */}
          <HStack className="absolute top-12 w-full justify-between px-4 z-10">
            <Pressable
              onPress={() => router.back()}
              className="w-10 h-10 rounded-full bg-[#16a8e3] items-center justify-center shadow-lg"
            >
              <ChevronLeftIcon size={22} color="white" />
            </Pressable>
            <Pressable className="w-10 h-10 rounded-full bg-[#f5a623] items-center justify-center shadow-lg">
              <BookmarkIcon size={18} color="white" />
            </Pressable>
          </HStack>
        </Box>

        {/* 2. Pulled-Up Details Card */}
        <VStack className="bg-white rounded-t-[28px] -mt-6 px-5 pt-6 pb-4 space-y-5">

          {/* Title & Price Row */}
          <HStack className="justify-between items-start">
            <VStack className="flex-1 pr-2">
              <Heading className="text-typography-900 text-[20px] font-bold">{car.brand} {car.model}</Heading>
              <HStack className="items-center mt-1">
                <MapPinIcon size={13} color="#16a8e3" />
                <Text className="text-[12px] text-typography-500 font-semibold ml-1">{car.location}</Text>
              </HStack>
            </VStack>
            <VStack className="items-end">
              <Text className="text-[#16a8e3] text-[20px] font-extrabold">{car.price_per_day?.toLocaleString()}</Text>
              <Text className="text-[10px] text-typography-500 font-bold">MMK / DAY</Text>
            </VStack>
          </HStack>

          {/* Rating */}
          <HStack className="items-center space-x-1 mb-2">
            <StarIcon size={12} color="#f5a623" fill="#f5a623" strokeWidth={0} />
            <StarIcon size={12} color="#f5a623" fill="#f5a623" strokeWidth={0} />
            <StarIcon size={12} color="#f5a623" fill="#f5a623" strokeWidth={0} />
            <StarIcon size={12} color="#f5a623" fill="#f5a623" strokeWidth={0} />
            <StarIcon size={12} color="#ddd" fill="#ddd" strokeWidth={0} />
            <Text className="text-[12px] font-bold text-typography-800 ml-1">4.5</Text>
            <Text className="text-[11px] text-typography-400 font-medium">(124 Reviews)</Text>
          </HStack>

          {/* 3-Column Spec Icons */}
          <HStack className="justify-between mt-2">
            <VStack className="items-center bg-[#eef8fb] rounded-2xl px-5 py-3 flex-1 mr-2">
              <UsersIcon size={22} color="#16a8e3" />
              <Text className="text-[9px] text-typography-400 font-bold mt-1 uppercase">Capacity</Text>
              <Text className="text-[12px] text-typography-800 font-bold">{car.seats || 5} Seats</Text>
            </VStack>
            <VStack className="items-center bg-[#eef8fb] rounded-2xl px-5 py-3 flex-1 mx-1">
              <CarIcon size={22} color="#16a8e3" />
              <Text className="text-[9px] text-typography-400 font-bold mt-1 uppercase">Type</Text>
              <Text className="text-[12px] text-typography-800 font-bold">{car.car_type || 'Sedan'}</Text>
            </VStack>
            <VStack className="items-center bg-[#eef8fb] rounded-2xl px-5 py-3 flex-1 ml-2">
              <SnowflakeIcon size={22} color="#16a8e3" />
              <Text className="text-[9px] text-typography-400 font-bold mt-1 uppercase">Air Cond.</Text>
              <Text className="text-[12px] text-typography-800 font-bold">A/C</Text>
            </VStack>
          </HStack>

          {/* Description */}
          {car.description && (
            <VStack className="mt-2">
              <Heading className="text-typography-900 text-[15px] font-bold mb-1">Description</Heading>
              <Text className="text-[13px] text-typography-500 leading-5">{car.description}</Text>
            </VStack>
          )}

          {/* Reserve Dates */}
          <VStack className="space-y-3 mt-2">
            <HStack className="justify-between items-center">
              <Heading className="text-typography-900 text-[15px] font-bold">Reserve Dates</Heading>
              <HStack className="space-x-2">
                <Pressable className="w-7 h-7 rounded-full border border-outline-200 items-center justify-center">
                  <Text className="text-typography-400 text-xs">{'<'}</Text>
                </Pressable>
                <Pressable className="w-7 h-7 rounded-full border border-outline-200 items-center justify-center">
                  <Text className="text-typography-400 text-xs">{'>'}</Text>
                </Pressable>
              </HStack>
            </HStack>
            <Box className="w-full h-64 border border-outline-200 rounded-2xl items-center justify-center bg-background-50">
              <Text className="text-typography-400 font-bold">Calendar Component Here</Text>
            </Box>
            <HStack className="items-center space-x-2 mt-1">
              <Box className="w-4 h-4 rounded bg-outline-100 border border-outline-200" />
              <Text className="text-[11px] text-typography-400 font-medium italic">UNAVAILABLE</Text>
            </HStack>
          </VStack>

          {/* Owner Info */}
          <HStack className="items-center mt-3 p-3 bg-background-50 rounded-xl border border-outline-100">
            <Image
              source={{ uri: car.profiles?.avatar_url || 'https://via.placeholder.com/40' }}
              className="w-10 h-10 rounded-full bg-background-200"
              alt="Owner"
            />
            <VStack className="ml-3 flex-1">
              <Text className="text-[11px] text-typography-400">Listed by</Text>
              <Text className="text-[14px] font-bold text-typography-900">{car.profiles?.full_name}</Text>
            </VStack>
          </HStack>

          {/* Bottom spacer for sticky footer */}
          <Box className="h-24" />

        </VStack>
      </ScrollView>

      {/* 3. Sticky Footer: Book Now + Chat FAB */}
      <HStack className="absolute bottom-0 w-full px-5 pt-3 pb-8 bg-white/95 border-t border-outline-100 items-center space-x-3 gap-3">
        <Button className="flex-1 rounded-2xl bg-[#16a8e3] h-14 shadow-md border-none">
          <ButtonText className="font-bold text-[16px]">Book Now</ButtonText>
        </Button>
        <Pressable
          onPress={handleContactOwner}
          className="w-14 h-14 rounded-2xl bg-[#16a8e3] items-center justify-center shadow-md"
        >
          <MessageCircleIcon size={24} color="white" />
        </Pressable>
      </HStack>

    </Box>
  );
}
