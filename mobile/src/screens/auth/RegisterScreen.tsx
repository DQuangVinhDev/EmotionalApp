import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import client from '../../api/client';

export default function RegisterScreen({ navigation }: any) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');

    const handleRegister = async () => {
        try {
            await client.post('/auth/register', { email, password, name });
            Alert.alert('Thành công', 'Vui lòng đăng nhập', [
                { text: 'OK', onPress: () => navigation.navigate('Login') }
            ]);
        } catch (error: any) {
            Alert.alert('Lỗi', error.response?.data?.message || 'Đã có lỗi xảy ra');
        }
    };

    return (
        <View className="flex-1 justify-center p-6 bg-white">
            <Text className="text-3xl font-bold text-center mb-8 text-rose-500">Đăng ký</Text>
            <TextInput
                placeholder="Tên của bạn"
                className="border border-gray-300 p-4 rounded-xl mb-4"
                value={name}
                onChangeText={setName}
            />
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
                onPress={handleRegister}
            >
                <Text className="text-white font-bold text-lg">Đăng ký</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text className="text-center text-gray-500">Đã có tài khoản? Đăng nhập</Text>
            </TouchableOpacity>
        </View>
    );
}
