import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import client from '../../api/client';
import { useAuthStore } from '../../store/useAuthStore';

export default function PairScreen() {
    const [code, setCode] = useState('');
    const [pairCode, setPairCode] = useState('');
    const { user, setUser } = useAuthStore();

    const handleCreate = async () => {
        try {
            const response = await client.post('/couple/create');
            setPairCode(response.data.pairCode);
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Đã có lỗi xảy ra');
        }
    };

    const handleJoin = async () => {
        try {
            const response = await client.post('/couple/join', { pairCode: code });
            Alert.alert('Thành công', 'Đã kết nối với đối tác!');
            // Update user state to include coupleId
            if (user) {
                setUser({ ...user, coupleId: response.data.coupleId });
            }
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Đã có lỗi xảy ra');
        }
    };

    return (
        <View className="flex-1 justify-center p-6 bg-white">
            <Text className="text-2xl font-bold text-center mb-4">Kết nối với đối tác</Text>

            {!pairCode ? (
                <View className="mb-8 p-6 bg-rose-50 rounded-2xl border border-rose-100">
                    <Text className="text-gray-600 mb-4 text-center">Bạn là người đầu tiên tham gia? Tạo mã để mời đối tác:</Text>
                    <TouchableOpacity
                        className="bg-rose-500 p-4 rounded-xl items-center"
                        onPress={handleCreate}
                    >
                        <Text className="text-white font-bold">Tạo Couple Code</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <View className="mb-8 p-6 bg-rose-100 rounded-2xl border border-rose-200">
                    <Text className="text-gray-600 mb-2 text-center">Mã của bạn là:</Text>
                    <Text className="text-4xl font-black text-rose-600 text-center tracking-widest">{pairCode}</Text>
                    <Text className="text-gray-500 mt-4 text-sm text-center">Gửi mã này cho đối tác của bạn</Text>
                </View>
            )}

            <View className="h-[1px] bg-gray-200 mb-8" />

            <View className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
                <Text className="text-gray-600 mb-4 text-center">Hoặc nhập mã từ đối tác:</Text>
                <TextInput
                    placeholder="Nhập 6 ký tự"
                    className="border border-blue-200 bg-white p-4 rounded-xl mb-4 text-center font-bold tracking-widest"
                    value={code}
                    onChangeText={(v) => setCode(v.toUpperCase())}
                    maxLength={6}
                />
                <TouchableOpacity
                    className="bg-blue-500 p-4 rounded-xl items-center"
                    onPress={handleJoin}
                >
                    <Text className="text-white font-bold">Kết nối</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}
