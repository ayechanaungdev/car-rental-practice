// components/CarListingCard.tsx
import { Box } from '@/components/ui/box';
import { HStack } from '@/components/ui/hstack';
import { Image } from '@/components/ui/image';
import { Text } from '@/components/ui/text';
import { VStack } from '@/components/ui/vstack';
import { useRouter } from 'expo-router';
import { BookmarkIcon, CarIcon, StarIcon, UsersIcon } from 'lucide-react-native';
import { Pressable } from 'react-native';

export function CarListingCard({ car }: { car: any }) {
    const router = useRouter();

    // Pick first image or default fallback
    const primaryImage = car?.car_images?.find((img: any) => img.is_primary)?.image_url
        || car?.car_images?.[0]?.image_url
        || 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=200&auto=format&fit=crop';

    return (
        <Pressable
            onPress={() => router.push(`/(protected)/car/${car.id}`)}
            className="w-[48%] bg-white rounded-[18px] border border-outline-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] mb-3 relative p-2"
        >

            {/* Upper Picture Area with Floating Tags */}
            <Box className="relative w-full overflow-hidden bg-transparent pt-1 pb-2">

                <HStack className="absolute top-0 left-0 right-0 z-10 justify-between items-start">
                    <HStack className="bg-white rounded-full px-2 py-1 items-center shadow-sm opacity-95">
                        <StarIcon size={9} color="#16a8e3" fill="#16a8e3" strokeWidth={0} />
                        <Text className="text-[9px] font-extrabold ml-1 text-typography-900">4.9 <Text className="text-typography-400 font-medium">(48)</Text></Text>
                    </HStack>

                    <Box className="bg-white rounded-md p-[4px] shadow-sm border border-brand-50">
                        <BookmarkIcon size={13} color="#16a8e3" />
                    </Box>
                </HStack>

                <Image
                    source={{ uri: primaryImage }}
                    className="w-full h-16 object-contain mt-5 mb-1 bg-transparent"
                    alt="Car Snapshot"
                />
            </Box>

            {/* Main Details */}
            <VStack className="space-y-1 block mt-1 px-1">

                {/* Title vs Price Split */}
                <HStack className="justify-between items-start w-full">
                    <VStack className="flex-1 shrink-1 overflow-hidden pr-1">
                        <Text className="text-typography-900 text-[11px] font-extrabold truncate" numberOfLines={1}>{car?.brand || 'Brand'}</Text>
                        <Text className="text-[9px] text-typography-500 font-semibold mt-[2px]">{car?.model || 'Model'}</Text>
                    </VStack>
                    <VStack className="items-end shrink-0">
                        <Text className="text-typography-900 text-[11px] font-extrabold text-[#111]">{car?.price_per_day?.toLocaleString()}</Text>
                        <Text className="text-[7.5px] text-typography-500 font-bold mt-[2px]">MMK / Day</Text>
                    </VStack>
                </HStack>

                {/* Core Detail Specs icons */}
                <HStack className="space-x-3 items-center mt-2 mb-1">
                    <HStack className="items-center space-x-1">
                        <CarIcon size={10} color="#737373" strokeWidth={1.5} />
                        <Text className="text-[8.5px] text-typography-500 font-bold pt-[1px]">{car?.car_type || 'SUV'}</Text>
                    </HStack>
                    <HStack className="items-center space-x-1">
                        <UsersIcon size={10} color="#737373" strokeWidth={1.5} />
                        <Text className="text-[8.5px] text-typography-500 font-bold pt-[1px]">{car?.seats || 4} seats</Text>
                    </HStack>
                </HStack>

                {/* Separator / Footer Link */}
                <Box className="w-full h-[1px] bg-outline-100 my-[6px]" />

                <Box className="py-0.5">
                    <Text className="text-center text-[#16a8e3] text-[10px] font-extrabold w-full">View Details →</Text>
                </Box>

            </VStack>
        </Pressable>
    );
}
