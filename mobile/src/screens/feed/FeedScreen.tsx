import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import client from '../../api/client';
import { Heart, Star, ShieldAlert, MessageCircle } from 'lucide-react-native';

const FeedItem = ({ item }: any) => {
    const renderIcon = () => {
        switch (item.itemType) {
            case 'CHECKIN': return <MessageCircle color="#10b981" size={20} />;
            case 'KUDOS': return <Star color="#f59e0b" size={20} />;
            case 'REPAIR': return <ShieldAlert color="#6366f1" size={20} />;
            case 'PROMPT_ANSWER': return <Heart color="#f43f5e" size={20} />;
            default: return null;
        }
    };

    const getTime = (date: string) => {
        return new Date(date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <View className="bg-white p-6 mb-4 mx-4 rounded-3xl shadow-sm border border-gray-100">
            <View className="flex-row items-center mb-3">
                <View className="mr-3">{renderIcon()}</View>
                <Text className="font-bold text-gray-800 flex-1">{item.userId?.name || item.fromUserId?.name || 'Đối tác'}</Text>
                <Text className="text-gray-400 text-xs">{getTime(item.sharedAt)}</Text>
            </View>

            {item.itemType === 'CHECKIN' && (
                <View>
                    <Text className="text-gray-600">Hôm nay mình thấy: {['😢', '😕', '😐', '🙂', '😊'][item.mood - 1]}</Text>
                    <Text className="text-gray-600 italic mt-2">"{item.gratitudeText}"</Text>
                </View>
            )}

            {item.itemType === 'KUDOS' && (
                <Text className="text-rose-600 font-medium">Cảm ơn vì: {item.text}</Text>
            )}

            {item.itemType === 'PROMPT_ANSWER' && (
                <View>
                    <Text className="text-gray-400 text-xs mb-1">{item.promptId?.text}</Text>
                    <Text className="text-gray-800 font-medium">{item.answerText}</Text>
                </View>
            )}

            {item.itemType === 'REPAIR' && (
                <View className="bg-indigo-50 p-4 rounded-2xl">
                    <Text className="text-indigo-800 italic">"{item.generatedMessage}"</Text>
                </View>
            )}
        </View>
    );
};

export default function FeedScreen() {
    const [feed, setFeed] = useState([]);
    const [refreshing, setRefreshing] = useState(false);

    const fetchFeed = async () => {
        try {
            const response = await client.get('/feed');
            setFeed(response.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchFeed();
        setRefreshing(false);
    };

    return (
        <View className="flex-1 bg-gray-50 pt-4">
            <FlatList
                data={feed}
                renderItem={({ item }) => <FeedItem item={item} />}
                keyExtractor={(item: any) => item._id}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                ListEmptyComponent={<Text className="text-center mt-10 text-gray-400">Chưa có hoạt động nào được chia sẻ</Text>}
            />
        </View>
    );
}
