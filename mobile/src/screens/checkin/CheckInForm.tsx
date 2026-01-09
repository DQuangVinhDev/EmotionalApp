import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import client from '../../api/client';
import { DateTime } from 'luxon';

const MoodScale = ({ value, onChange }: any) => (
    <View className="flex-row justify-between mb-4">
        {[1, 2, 3, 4, 5].map((i) => (
            <TouchableOpacity
                key={i}
                onPress={() => onChange(i)}
                className={`w-12 h-12 rounded-full items-center justify-center border ${value === i ? 'bg-rose-500 border-rose-500' : 'bg-white border-gray-200'}`}
            >
                <Text className={`text-xl ${value === i ? 'text-white' : 'text-gray-400'}`}>{['😢', '😕', '😐', '🙂', '😊'][i - 1]}</Text>
            </TouchableOpacity>
        ))}
    </View>
);

const Needs = ['LISTEN', 'HUG', 'SPACE', 'HELP', 'PLAY', 'CLARITY'];
const NeedLabels: any = {
    LISTEN: 'Lắng nghe',
    HUG: 'Ôm ấp',
    SPACE: 'Khoảng lặng',
    HELP: 'Giúp đỡ',
    PLAY: 'Vui vẻ',
    CLARITY: 'Làm rõ'
};

export default function CheckInForm({ navigation }: any) {
    const [mood, setMood] = useState(3);
    const [energy, setEnergy] = useState(3);
    const [stress, setStress] = useState(3);
    const [need, setNeed] = useState('LISTEN');
    const [gratitude, setGratitude] = useState('');
    const [visibility, setVisibility] = useState('PRIVATE');

    const handleSubmit = async () => {
        try {
            const dateKey = DateTime.now().toFormat('yyyy-MM-dd');
            await client.post('/checkins', {
                dateKey,
                mood,
                energy,
                stress,
                need,
                gratitudeText: gratitude,
                visibility
            });
            Alert.alert('Thành công', 'Đã lưu check-in hôm nay!');
            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Lỗi', 'Không thể lưu check-in');
        }
    };

    return (
        <ScrollView className="flex-1 bg-white p-6">
            <Text className="text-lg font-bold mb-2">Tâm trạng hôm nay</Text>
            <MoodScale value={mood} onChange={setMood} />

            <Text className="text-lg font-bold mb-2">Năng lượng (1-5)</Text>
            <View className="flex-row justify-between mb-6">
                {[1, 2, 3, 4, 5].map(i => (
                    <TouchableOpacity
                        key={i} onPress={() => setEnergy(i)}
                        className={`w-10 h-10 rounded-lg items-center justify-center ${energy === i ? 'bg-orange-400' : 'bg-gray-100'}`}
                    >
                        <Text className={energy === i ? 'text-white' : 'text-gray-600'}>{i}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text className="text-lg font-bold mb-2">Căng thẳng (1-5)</Text>
            <View className="flex-row justify-between mb-6">
                {[1, 2, 3, 4, 5].map(i => (
                    <TouchableOpacity
                        key={i} onPress={() => setStress(i)}
                        className={`w-10 h-10 rounded-lg items-center justify-center ${stress === i ? 'bg-red-400' : 'bg-gray-100'}`}
                    >
                        <Text className={stress === i ? 'text-white' : 'text-gray-600'}>{i}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text className="text-lg font-bold mb-2">Điều mình cần ngay lúc này</Text>
            <View className="flex-row flex-wrap mb-6">
                {Needs.map(n => (
                    <TouchableOpacity
                        key={n} onPress={() => setNeed(n)}
                        className={`px-4 py-2 rounded-full mr-2 mb-2 ${need === n ? 'bg-rose-500' : 'bg-gray-100'}`}
                    >
                        <Text className={need === n ? 'text-white' : 'text-gray-600'}>{NeedLabels[n]}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Text className="text-lg font-bold mb-2">Điều mình biết ơn</Text>
            <TextInput
                placeholder="Hôm nay mình biết ơn vì..."
                multiline
                className="bg-gray-50 p-4 rounded-xl mb-6 h-24"
                value={gratitude}
                onChangeText={setGratitude}
            />

            <Text className="text-lg font-bold mb-2">Chế độ chia sẻ</Text>
            <View className="flex-row mb-8">
                {['PRIVATE', 'SHARED_NOW'].map(v => (
                    <TouchableOpacity
                        key={v} onPress={() => setVisibility(v)}
                        className={`flex-1 p-4 rounded-xl mr-2 items-center border ${visibility === v ? 'bg-gray-800 border-gray-800' : 'bg-white border-gray-200'}`}
                    >
                        <Text className={visibility === v ? 'text-white' : 'text-gray-600'}>{v === 'PRIVATE' ? 'Giữ riêng' : 'Chia sẻ ngay'}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <TouchableOpacity className="bg-rose-500 p-5 rounded-2xl items-center mb-12" onPress={handleSubmit}>
                <Text className="text-white font-bold text-lg">Hoàn tất</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}
