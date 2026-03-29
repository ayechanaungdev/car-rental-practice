// app/(protected)/(home)/search.tsx
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView } from 'react-native';

import { Badge, BadgeText } from '@/components/ui/badge';
import { Box } from '@/components/ui/box';
import { Button, ButtonText } from '@/components/ui/button';
import { FormControl, FormControlLabel, FormControlLabelText } from '@/components/ui/form-control';
import { Heading } from '@/components/ui/heading';
import { HStack } from '@/components/ui/hstack';
import { Input, InputField, InputSlot } from '@/components/ui/input';
import { Pressable } from '@/components/ui/pressable';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { supabase } from '@/lib/supabase';
import { Stack, useRouter } from 'expo-router';

import { ArrowUpDownIcon, ChevronDownIcon, ChevronLeftIcon, ChevronUpIcon, LayoutGridIcon, MapPinIcon } from 'lucide-react-native';

import { CarListingCard } from '@/components/CarListingCard'; // From Section 2.2 below!

export default function SearchScreen() {
  const router = useRouter();
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    const { data } = await supabase
      .from('cars')
      .select(`
        *,
        car_images ( image_url, is_primary )
      `)
      .eq('status', 'Available');

    if (data) setCars(data);
    setLoading(false);
  };

  return (
    <VStack className="flex-1 bg-white pt-10">

      <Stack.Screen options={{ headerShown: false }} />

      {/* 1. App Header */}
      <HStack className="items-center px-4 mb-2 justify-between">
        <Pressable onPress={() => router.back()} className="border border-outline-200 rounded-full p-1.5 opacity-80">
          <ChevronLeftIcon color="#16a8e3" size={20} />
        </Pressable>
        <Heading className="text-[#16a8e3] text-[18px] font-bold text-center flex-1 pr-6">Explore Cars</Heading>
      </HStack>

      {/* 2. Filter Box */}
      <Box className="bg-[#eef8fb] mx-4 rounded-3xl p-5 space-y-6 mb-3">

        {/* Location Dropdown */}
        <FormControl className="mb-3">
          <FormControlLabel className="mb-1"><FormControlLabelText className="text-xs font-bold text-typography-700">Car Location</FormControlLabelText></FormControlLabel>
          <Input className="bg-white rounded-xl h-11 border-outline-100 flex-row items-center px-3">
            <InputSlot><MapPinIcon color="#16a8e3" size={18} /></InputSlot>
            <InputField placeholder="Select Location" className="text-xs font-semibold px-2 flex-1" />
            <InputSlot><ChevronDownIcon color="#16a8e3" size={20} /></InputSlot>
          </Input>
        </FormControl>

        {/* Date Row */}
        <HStack className="space-x-3 mt-2 mb-2">
          <FormControl className="flex-1">
            <FormControlLabel className="mb-1"><FormControlLabelText className="text-xs font-bold text-typography-700">Pick-up Date</FormControlLabelText></FormControlLabel>
            <Input className="bg-white rounded-xl h-11 border-outline-100"><InputField placeholder="yyyy/mm/dd" className="text-xs font-semibold px-3 text-center" /></Input>
          </FormControl>
          <FormControl className="flex-1">
            <FormControlLabel className="mb-1"><FormControlLabelText className="text-xs font-bold text-typography-700">Return Date</FormControlLabelText></FormControlLabel>
            <Input className="bg-white rounded-xl h-11 border-outline-100"><InputField placeholder="yyyy/mm/dd" className="text-xs font-semibold px-3 text-center" /></Input>
          </FormControl>
        </HStack>

        {/* Price Slider Mock */}
        <VStack className="space-y-5 mt-2 mb-2">
          <HStack className="justify-between items-center">
            <Text className="text-xs font-bold text-typography-800">Price per Day (MMK)</Text>
            <Text className="text-xs font-extrabold text-[#16a8e3]">100,000 - 500,000</Text>
          </HStack>
          <Box className="w-[98%] self-center h-[5px] bg-[#bbedf9] rounded-full relative my-1">
            <Box className="absolute left-[15%] w-[65%] h-full bg-[#16a8e3] rounded-full" />
            <Box className="absolute left-[15%] -top-[6px] w-[17px] h-[17px] rounded-full bg-[#16a8e3] border-[3.5px] border-white shadow-sm" />
            <Box className="absolute left-[80%] -top-[6px] w-[17px] h-[17px] rounded-full bg-[#16a8e3] border-[3.5px] border-white shadow-sm" />
          </Box>
        </VStack>

        {/* Buttons */}
        <HStack className="space-x-4 mt-4">
          <Button variant="outline" className="flex-1 rounded-xl border-[#16a8e3] h-11 bg-white">
            <ButtonText className="text-[#16a8e3] font-bold">Reset</ButtonText>
          </Button>
          <Button className="flex-1 rounded-xl bg-[#16a8e3] h-11 border-none shadow-none">
            <ButtonText className="text-white font-bold">Search</ButtonText>
          </Button>
        </HStack>
      </Box>

      {/* 3. Scrolling Categories */}
      <Box className="h-10 mb-2">
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <HStack className="space-x-2 items-center">
            <Badge className="bg-[#16a8e3] rounded-full px-5 py-1.5 border-none h-8"><BadgeText className="text-white font-bold text-xs">All Cars</BadgeText></Badge>
            <Badge className="bg-white border border-outline-200 rounded-full px-5 py-1.5 h-8"><BadgeText className="text-typography-500 font-bold text-xs">SUV</BadgeText></Badge>
            <Badge className="bg-white border border-outline-200 rounded-full px-5 py-1.5 h-8"><BadgeText className="text-typography-500 font-bold text-xs">Seden</BadgeText></Badge>
            <Badge className="bg-white border border-outline-200 rounded-full px-5 py-1.5 h-8"><BadgeText className="text-typography-500 font-bold text-xs">Van</BadgeText></Badge>
            <Badge className="bg-white border border-outline-200 rounded-full px-5 py-1.5 h-8"><BadgeText className="text-typography-500 font-bold text-xs">Wagon</BadgeText></Badge>
          </HStack>
        </ScrollView>
      </Box>

      {/* 4. Sub-header */}
      <HStack className="justify-between items-center px-5 mb-2">
        <Text className="font-bold text-typography-900 text-[13px]"><Text className="text-[#16a8e3] font-extrabold">{cars.length}</Text> Cars Available</Text>
        <HStack className="items-center space-x-1">
          <LayoutGridIcon size={14} color="#8cd2ec" />
          <Text className="text-typography-500 text-xs font-semibold px-1">Sort</Text>
          <ArrowUpDownIcon size={12} color="#16a8e3" />
        </HStack>
      </HStack>

      {/* 5. Grid of Cars Container relative to handle floating UP button */}
      <Box className="flex-1 px-4 relative">
        <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
          {loading ? (
            <ActivityIndicator className="mt-8" color="#16a8e3" />
          ) : (
            <HStack className="flex-wrap justify-between pb-8 pt-1">
              {cars.map((car) => (
                <CarListingCard key={car.id} car={car} />
              ))}
            </HStack>
          )}
        </ScrollView>
        {/* Floating UP scroll simulation */}
        <Pressable className="absolute bottom-6 right-2 w-12 h-12 rounded-full bg-[#16a8e3] items-center justify-center opacity-95 shadow-[0_4px_8px_rgba(22,168,227,0.4)]">
          <ChevronUpIcon color="white" size={24} strokeWidth={2.5} />
        </Pressable>
      </Box>

    </VStack>
  );
}
