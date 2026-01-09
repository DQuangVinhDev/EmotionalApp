import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { Plus, List } from 'lucide-react-native';

export default function RitualScreen() {
    const [activeTab, setActiveTab] = useState('WEEKLY');

    return (
        <View className="flex-1 bg-gray-50">
            <View className="flex-row p-4">
                <TouchableOpacity
                    onPress={() => setActiveTab('WEEKLY')}
                    className={`flex-1 p-3 rounded-xl items-center ${activeTab === 'WEEKLY' ? 'bg-rose-500' : 'bg-white'}`}
                >
                    <Text className={`font-bold ${activeTab === 'WEEKLY' ? 'text-white' : 'text-gray-500'}`}>Nghi thức tuần</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => setActiveTab('BACKLOG')}
                    className={`flex-1 p-3 rounded-xl items-center ml-2 ${activeTab === 'BACKLOG' ? 'bg-rose-500' : 'bg-white'}`}
                >
                    <Text className={`font-bold ${activeTab === 'BACKLOG' ? 'text-white' : 'text-gray-500'}`}>Danh sách chờ</Text>
                </TouchableOpacity>
            </View>

            <ScrollView className="flex-1 p-4">
                {activeTab === 'WEEKLY' ? (
                    <View>
                        <View className="bg-white p-6 rounded-3xl mb-4 border border-rose-100 shadow-sm">
                            <Text className="text-xl font-bold text-gray-800 mb-4">State of Us 🧘‍♀️</Text>
                            <Text className="text-gray-500 mb-6 font-medium">Buổi trò chuyện 15-30 phút hàng tuần để hai bạn kết nối sâu hơn.</Text>

                            <Text className="text-gray-700 font-bold mb-2">1. Điều gì làm bạn vui tuần này?</Text>
                            <TextInput placeholder="Viết câu trả lời..." className="bg-gray-50 p-4 rounded-xl mb-4" />

                            <Text className="text-gray-700 font-bold mb-2">2. Một điều bạn trân trọng ở đối tác?</Text>
                            <TextInput placeholder="Viết câu trả lời..." className="bg-gray-50 p-4 rounded-xl mb-4" />

                            <TouchableOpacity className="bg-rose-500 p-4 rounded-2xl items-center mt-4">
                                <Text className="text-white font-bold">Lưu câu trả lời</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <View>
                        <View className="bg-white p-6 rounded-3xl mb-4 shadow-sm">
                            <View className="flex-row justify-between items-center mb-6">
                                <Text className="text-xl font-bold text-gray-800">Backlog</Text>
                                <TouchableOpacity className="bg-rose-500 p-2 rounded-full">
                                    <Plus color="white" size={20} />
                                </TouchableOpacity>
                            </View>

                            <View className="bg-gray-50 p-4 rounded-2xl mb-3 flex-row items-center">
                                <View className="w-2 h-2 bg-rose-500 rounded-full mr-3" />
                                <Text className="flex-1 text-gray-700">Bàn về chuyến đi Tết</Text>
                            </View>
                            <View className="bg-gray-50 p-4 rounded-2xl mb-3 flex-row items-center">
                                <View className="w-2 h-2 bg-rose-500 rounded-full mr-3" />
                                <Text className="flex-1 text-gray-700">Phân chia lại việc nhà</Text>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>
        </View>
    );
}
