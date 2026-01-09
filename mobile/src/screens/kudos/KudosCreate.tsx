import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import client from '../../api/client';

export default function KudosCreate({ navigation }: any) {
    const [text, setText] = useState('');

    const handleSubmit = async () => {
        try {
            await client.post('/kudos', {
                text,
                visibility: 'SHARED_NOW'
            });
            Alert.alert('Thành công', 'Đã lưu vào Jar of Wins của hai bạn!');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể gửi Kudos');
        }
    };

    return (
        <View className="flex-1 bg-white p-6">
            <Text className="text-2xl font-bold mb-2 text-rose-500">Gửi lời cảm ơn 💖</Text>
            <Text className="text-gray-500 mb-8">Kudos giúp nuôi dưỡng mối quan hệ mỗi ngày.</Text>

            <TextInput
                placeholder="Hôm nay bạn muốn cảm ơn đối tác về điều gì?"
                multiline
                className="bg-gray-50 p-6 rounded-3xl h-40 text-lg border border-gray-100"
                value={text}
                onChangeText={setText}
            />

            <TouchableOpacity
                className="bg-rose-500 p-5 rounded-2xl items-center mt-8"
                onPress={handleSubmit}
            >
                <Text className="text-white font-bold text-lg">Gửi Kudos</Text>
            </TouchableOpacity>
        </View>
    );
}
