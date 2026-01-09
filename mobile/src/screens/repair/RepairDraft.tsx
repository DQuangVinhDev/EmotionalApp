import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import client from '../../api/client';

const Feelings = ['Buồn', 'Tổn thương', 'Lo lắng', 'Tức giận', 'Cô đơn', 'Mệt mỏi'];
const Needs = ['Thấu hiểu', 'Được tôn trọng', 'Sự hỗ trợ', 'Sự kết nối', 'Không gian riêng'];

export default function RepairDraft({ navigation }: any) {
    const [step, setStep] = useState(1);
    const [stress, setStress] = useState(3);
    const [observation, setObservation] = useState('');
    const [feeling, setFeeling] = useState('');
    const [need, setNeed] = useState('');
    const [request, setRequest] = useState('');

    const generateMessage = () => {
        return `Khi [${observation}], mình cảm thấy [${feeling}]. Mình cần [${need}]. Bạn có thể [${request}] không?`;
    };

    const handleNext = () => {
        if (step === 1 && stress >= 4) {
            Alert.alert('Bình tĩnh', 'Mức độ căng thẳng cao. Gợi ý bạn nên dành 20 phút nghỉ ngơi trước khi tiếp tục.');
        }
        setStep(step + 1);
    };

    const handleSubmit = async () => {
        try {
            await client.post('/repairs', {
                stressLevel: stress,
                observation,
                feeling,
                need,
                request,
                generatedMessage: generateMessage(),
                visibility: 'SHARED_NOW'
            });
            Alert.alert('Thành công', 'Lời nhắn đã được gửi tới đối tác');
            navigation.goBack();
        } catch (error) {
            Alert.alert('Lỗi', 'Không thể gửi yêu cầu');
        }
    };

    return (
        <ScrollView className="flex-1 bg-white p-6">
            {step === 1 && (
                <View>
                    <Text className="text-xl font-bold mb-4">Bạn đang cảm thấy thế nào?</Text>
                    <Text className="text-gray-500 mb-6">Đo mức độ căng thẳng của bạn (1-5)</Text>
                    <View className="flex-row justify-between mb-8">
                        {[1, 2, 3, 4, 5].map(i => (
                            <TouchableOpacity
                                key={i} onPress={() => setStress(i)}
                                className={`w-12 h-12 rounded-full items-center justify-center ${stress === i ? 'bg-indigo-500' : 'bg-gray-100'}`}
                            >
                                <Text className={stress === i ? 'text-white' : 'text-gray-600'}>{i}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity className="bg-indigo-500 p-4 rounded-xl items-center" onPress={handleNext}>
                        <Text className="text-white font-bold">Tiếp theo</Text>
                    </TouchableOpacity>
                </View>
            )}

            {step === 2 && (
                <View>
                    <Text className="text-xl font-bold mb-2">Quan sát</Text>
                    <Text className="text-gray-500 mb-4">Điều gì vừa xảy ra? (FACTS only)</Text>
                    <TextInput
                        placeholder="Ví dụ: Khi thấy bạn chưa rửa bát..."
                        multiline
                        className="bg-gray-50 p-4 rounded-xl mb-6 h-24"
                        value={observation}
                        onChangeText={setObservation}
                    />

                    <Text className="text-xl font-bold mb-2">Cảm xúc</Text>
                    <View className="flex-row flex-wrap mb-4">
                        {Feelings.map(f => (
                            <TouchableOpacity
                                key={f} onPress={() => setFeeling(f)}
                                className={`px-4 py-2 rounded-full mr-2 mb-2 ${feeling === f ? 'bg-indigo-500' : 'bg-gray-100'}`}
                            >
                                <Text className={feeling === f ? 'text-white' : 'text-gray-600'}>{f}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <TouchableOpacity className="bg-indigo-500 p-4 rounded-xl items-center" onPress={handleNext}>
                        <Text className="text-white font-bold">Tiếp theo</Text>
                    </TouchableOpacity>
                </View>
            )}

            {step === 3 && (
                <View>
                    <Text className="text-xl font-bold mb-2">Nhu cầu</Text>
                    <View className="flex-row flex-wrap mb-6">
                        {Needs.map(n => (
                            <TouchableOpacity
                                key={n} onPress={() => setNeed(n)}
                                className={`px-4 py-2 rounded-full mr-2 mb-2 ${need === n ? 'bg-indigo-500' : 'bg-gray-100'}`}
                            >
                                <Text className={need === n ? 'text-white' : 'text-gray-600'}>{n}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text className="text-xl font-bold mb-2">Lời đề nghị cụ thể</Text>
                    <TextInput
                        placeholder="Bạn có thể giúp mình... không?"
                        multiline
                        className="bg-gray-50 p-4 rounded-xl mb-6 h-24"
                        value={request}
                        onChangeText={setRequest}
                    />

                    <View className="bg-gray-100 p-6 rounded-3xl mb-8">
                        <Text className="text-gray-400 text-xs mb-2">Lời nhắn sẽ gửi đi:</Text>
                        <Text className="text-gray-800 italic">{generateMessage()}</Text>
                    </View>

                    <TouchableOpacity className="bg-indigo-500 p-4 rounded-xl items-center" onPress={handleSubmit}>
                        <Text className="text-white font-bold">Gửi lời nhắn</Text>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );
}
