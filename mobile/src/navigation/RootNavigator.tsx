import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from '../store/useAuthStore';
import { Home, MessageSquare, Heart, Settings as SettingsIcon } from 'lucide-react-native';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import PairScreen from '../screens/auth/PairScreen';

// Main Screens
import HomeScreen from '../screens/home/HomeScreen';
import FeedScreen from '../screens/feed/FeedScreen';
import RitualScreen from '../screens/ritual/RitualScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

// Flow Screens
import CheckInForm from '../screens/checkin/CheckInForm';
import KudosCreate from '../screens/kudos/KudosCreate';
import RepairDraft from '../screens/repair/RepairDraft';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
    return (
        <Tab.Navigator screenOptions={{ tabBarActiveTintColor: '#FF6B6B' }}>
            <Tab.Screen
                name="Trang chủ"
                component={HomeScreen}
                options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }}
            />
            <Tab.Screen
                name="Bảng tin"
                component={FeedScreen}
                options={{ tabBarIcon: ({ color }) => <MessageSquare color={color} size={24} /> }}
            />
            <Tab.Screen
                name="Nghi thức"
                component={RitualScreen}
                options={{ tabBarIcon: ({ color }) => <Heart color={color} size={24} /> }}
            />
            <Tab.Screen
                name="Cài đặt"
                component={SettingsScreen}
                options={{ tabBarIcon: ({ color }) => <SettingsIcon color={color} size={24} /> }}
            />
        </Tab.Navigator>
    );
}

export default function RootNavigator() {
    const { isAuthenticated, user } = useAuthStore();

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!isAuthenticated ? (
                    <>
                        <Stack.Screen name="Login" component={LoginScreen} />
                        <Stack.Screen name="Register" component={RegisterScreen} />
                    </>
                ) : !user?.coupleId ? (
                    <Stack.Screen name="Pair" component={PairScreen} />
                ) : (
                    <>
                        <Stack.Screen name="Main" component={TabNavigator} />
                        <Stack.Screen name="CheckInForm" component={CheckInForm} options={{ headerShown: true, title: 'Check-in hôm nay' }} />
                        <Stack.Screen name="KudosCreate" component={KudosCreate} options={{ headerShown: true, title: 'Gửi Kudos' }} />
                        <Stack.Screen name="RepairDraft" component={RepairDraft} options={{ headerShown: true, title: 'Giải quyết mâu thuẫn' }} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
