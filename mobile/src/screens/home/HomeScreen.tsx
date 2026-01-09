import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { CheckCircle, Heart, Star, ShieldAlert, Calendar } from 'lucide-react-native';

const FeatureCard = ({ title, icon: Icon, color, onPress }: any) => (
    <TouchableOpacity
        className="bg-white p-6 rounded-3xl mb-4 shadow-sm border border-gray-100 flex-row items-center"
        onPress={onPress}
    >
        <View className={`p-4 rounded-2xl mr-4 ${color}`}>
            <Icon color="white" size={24} />
        </View>
        <View className="flex-1">
            <Text className="text-lg font-bold text-gray-800">{title}</Text>
            <Text className="text-gray-500 text-sm">Chưa hoàn thành</Text>
        </View>
    </TouchableOpacity>
);

export default function HomeScreen({ navigation }: any) {
    return (
        <ScrollView className="flex-1 bg-gray-50 p-6">
            <Text className="text-2xl font-bold text-gray-800 mb-6">Chào bạn! 👋</Text>

            <FeatureCard
                title="Check-in hôm nay"
                icon={CheckCircle}
                color="bg-emerald-500"
                onPress={() => navigation.navigate('CheckInForm')}
            />
            <FeatureCard
                title="Gửi Kudos"
                icon={Star}
                color="bg-amber-400"
                onPress={() => navigation.navigate('KudosCreate')}
            />
            <FeatureCard
                title="Love Map Question"
                icon={Heart}
                color="bg-rose-500"
                onPress={() => { }}
            />
            <FeatureCard
                title="Giải quyết mâu thuẫn"
                icon={ShieldAlert}
                color="bg-indigo-500"
                onPress={() => navigation.navigate('RepairDraft')}
            />
            <FeatureCard
                title="Nghi thức cuối tuần"
                icon={Calendar}
                color="bg-violet-500"
                onPress={() => { }}
            />
        </ScrollView>
    );
}
