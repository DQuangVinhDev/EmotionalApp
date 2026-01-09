import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import { LogOut, User, Bell, Shield } from 'lucide-react-native';

const SettingItem = ({ icon: Icon, title, color, onPress }: any) => (
    <TouchableOpacity
        className="flex-row items-center p-4 border-b border-gray-100"
        onPress={onPress}
    >
        <View className={`p-2 rounded-lg mr-4 ${color}`}>
            <Icon color="white" size={20} />
        </View>
        <Text className="flex-1 text-gray-700 font-medium">{title}</Text>
    </TouchableOpacity>
);

export default function SettingsScreen() {
    const { user, logout } = useAuthStore();

    return (
        <View className="flex-1 bg-white">
            <View className="p-8 items-center border-b border-gray-50">
                <View className="w-20 h-20 bg-rose-100 rounded-full items-center justify-center mb-4">
                    <Text className="text-3xl">💑</Text>
                </View>
                <Text className="text-xl font-bold text-gray-800">{user?.name}</Text>
                <Text className="text-gray-400">{user?.email}</Text>
            </View>

            <View className="p-4">
                <SettingItem icon={User} title="Hồ sơ cá nhân" color="bg-blue-400" />
                <SettingItem icon={Bell} title="Thông báo nhắc nhở" color="bg-emerald-400" />
                <SettingItem icon={Shield} title="Quyền riêng tư" color="bg-amber-400" />

                <TouchableOpacity
                    className="flex-row items-center p-4 mt-8"
                    onPress={logout}
                >
                    <View className="p-2 rounded-lg mr-4 bg-red-50">
                        <LogOut color="#ef4444" size={20} />
                    </View>
                    <Text className="text-red-500 font-bold">Đăng xuất</Text>
                </TouchableOpacity>
            </View>

            <View className="mt-auto p-8 items-center">
                <Text className="text-gray-300 text-xs">Couple App v1.0.0 (MVP)</Text>
            </View>
        </View>
    );
}
