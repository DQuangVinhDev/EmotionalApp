import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useAuthStore } from '../../store/useAuthStore';
import client from '../../api/client';
import * as SecureStore from 'expo-secure-store';

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const setUser = useAuthStore((state) => state.setUser);

    const handleLogin = async () => {
        try {
            const response = await client.post('/auth/login', { email, password });
            const { accessToken, refreshToken, user } = response.data;
            await SecureStore.setItemAsync('accessToken', accessToken);
            await SecureStore.setItemAsync('refreshToken', refreshToken);
            setUser(user);
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Đã có lỗi xảy ra');
        }
    };

    return (
        <View className="flex-1 justify-center p-6 bg-white">
            <Text className="text-3xl font-bold text-center mb-8 text-rose-500">Couple App</Text>
            <TextInput
                placeholder="Email"
                className="border border-gray-300 p-4 rounded-xl mb-4"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
            />
            <TextInput
                placeholder="Mật khẩu"
                className="border border-gray-300 p-4 rounded-xl mb-6"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />
            <TouchableOpacity
                className="bg-rose-500 p-4 rounded-xl items-center mb-4"
                onPress={handleLogin}
            >
                <Text className="text-white font-bold text-lg">Đăng nhập</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text className="text-center text-gray-500">Chưa có tài khoản? Đăng ký ngay</Text>
            </TouchableOpacity>
        </View>
    );
}
