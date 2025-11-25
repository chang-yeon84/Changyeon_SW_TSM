import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import Btm_nav_bar from '../components/btn_btm_nav_bar';
import { useNavigation } from '../contexts/navigationContext';
import { useAuth } from '../contexts/authContext';
import { API_ENDPOINTS } from '../config/api';

const profile = () => {
    const { setActiveTab } = useNavigation();
    const { user, logout } = useAuth();
    const router = useRouter();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            setActiveTab('profile');
            fetchUserProfile();
        }, [])
    );

    const fetchUserProfile = async () => {
        try {
            setLoading(true);

            if (!user.userId) {
                Alert.alert('오류', '로그인 정보가 없습니다.');
                return;
            }

            const response = await fetch(`${API_ENDPOINTS.USER}/${user.userId}`);
            const result = await response.json();

            if (result.success) {
                setProfileData(result.data);
            } else {
                Alert.alert('오류', result.message || '사용자 정보를 불러올 수 없습니다.');
            }
        } catch (error) {
            console.error('사용자 정보 불러오기 에러:', error);
            Alert.alert('오류', '사용자 정보를 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        Alert.alert(
            '로그아웃',
            '정말 로그아웃 하시겠습니까?',
            [
                {
                    text: '취소',
                    style: 'cancel',
                },
                {
                    text: '로그아웃',
                    style: 'destructive',
                    onPress: () => {
                        logout();
                        router.replace('/');
                    },
                },
            ]
        );
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00A8FF" />
                    <Text style={styles.loadingText}>프로필 불러오는 중...</Text>
                </View>
                <Btm_nav_bar />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.content}>
                {/* 프로필 이미지 */}
                <View style={styles.profileImageContainer}>
                    {profileData?.profileImage ? (
                        <Image
                            source={{ uri: profileData.profileImage }}
                            style={styles.profileImage}
                        />
                    ) : (
                        <View style={styles.defaultProfileIcon}>
                            <Ionicons name="person-circle-outline" size={120} color="#CCCCCC" />
                        </View>
                    )}
                </View>

                {/* 이름 */}
                <Text style={styles.userName}>{profileData?.name || user.userName}</Text>

                {/* 로그아웃 버튼 */}
                <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                    <Text style={styles.logoutButtonText}>로그아웃</Text>
                </TouchableOpacity>

                {/* 이메일 정보 */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Ionicons name="mail" size={20} color="#000000" />
                        <Text style={styles.infoText}>{profileData?.email || '이메일 없음'}</Text>
                    </View>
                    <View style={styles.divider} />
                </View>

                {/* 계정 생성일 */}
                <View style={styles.infoContainer}>
                    <View style={styles.infoRow}>
                        <Ionicons name="time-outline" size={20} color="#000000" />
                        <Text style={styles.infoText}>
                            계정 생성일 : {profileData?.createdAt ? formatDate(profileData.createdAt) : '정보 없음'}
                        </Text>
                    </View>
                    <View style={styles.divider} />
                </View>
            </View>

            <Btm_nav_bar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingTop: 80,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
    },
    profileImageContainer: {
        width: 120,
        height: 120,
        borderRadius: 60,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
    },
    defaultProfileIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 20,
    },
    logoutButton: {
        backgroundColor: '#00A8FF',
        paddingHorizontal: 40,
        paddingVertical: 12,
        borderRadius: 25,
        marginBottom: 40,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoContainer: {
        width: 380,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 15,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    infoText: {
        fontSize: 16,
        color: '#000',
    },
    divider: {
        height: 1,
        backgroundColor: '#E5E5E5',
        marginTop: 15,
    },
});

export default profile;
