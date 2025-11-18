import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, ScrollView } from 'react-native';
import Btm_nav_bar from '../components/btn_btm_nav_bar';
import BtnSch_List from '../components/btnsch_list';
import Plancard_Home from "../components/plancard_home";
import { useNavigation } from '../contexts/navigationContext';
import { useAuth } from '../contexts/authContext';
import { API_ENDPOINTS } from '../config/api';
import { Ionicons } from '@expo/vector-icons';

const home = () => {
    const router = useRouter();
    const { setActiveTab } = useNavigation();
    const { user } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);

    console.log('[home] 렌더링 시 user 상태:', user);

    // 오늘 날짜의 일정 불러오기
    const fetchTodaySchedules = async () => {
        try {
            setLoading(true);
            const userId = user?.userId;

            if (!userId) {
                console.log('사용자 ID가 없습니다.');
                setLoading(false);
                return;
            }

            const today = new Date();
            const dateString = today.toISOString().split('T')[0];

            const response = await fetch(
                `${API_ENDPOINTS.SCHEDULES}/date/${dateString}?userId=${userId}`
            );

            const result = await response.json();

            if (result.success) {
                setSchedules(result.data);
            } else {
                console.error('일정 조회 실패:', result.message);
                setSchedules([]);
            }
        } catch (error) {
            console.error('일정 불러오기 에러:', error);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setActiveTab('home');
            console.log('[home] useFocusEffect - user 상태:', user);
            if (user?.userId) {
                fetchTodaySchedules();
            }
        }, [user])
    );
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.whiteBox}>
                <Text style={styles.header}>오늘의 일정</Text>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#00A8FF" />
                        <Text style={styles.loadingText}>일정 불러오는 중...</Text>
                    </View>
                ) : (
                    <>
                        <Text style={styles.subHeader}>
                            <Text style={styles.planCount}>{schedules.length}</Text> 개의 일정이 있습니다.
                        </Text>

                        <View style={styles.buttonContainer}>
                            <BtnSch_List
                                onPress={() => router.push('sch_list')}
                            />
                        </View>

                        <ScrollView
                            style={styles.scrollContainer}
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            {schedules.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="calendar-outline" size={60} color="#C7C7C7" />
                                    <Text style={styles.emptyText}>오늘은 일정이 없습니다</Text>
                                </View>
                            ) : (
                                <View style={styles.allPlanSections}>
                                    {schedules.map((schedule, index) => (
                                        <TouchableOpacity
                                            key={schedule._id}
                                            onPress={() => router.push({ pathname: "/sch_detail", params: { id: schedule._id } })}
                                            activeOpacity={1}
                                        >
                                            <View style={styles.planSection}>
                                                <Plancard_Home
                                                    time={schedule.startTime}
                                                    title={schedule.title}
                                                    location={schedule.destinationLocation || schedule.departureLocation || '위치 없음'}
                                                />
                                            </View>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}
                        </ScrollView>
                    </>
                )}
            </View>
            <Btm_nav_bar />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    whiteBox: {
        width: 392,
        height: 470,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginTop: 50,
    },
    header: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#000',
        justifyContent: 'flex-start',
        marginLeft: 20,
        marginTop: 20,
    },
    subHeader: {
        fontSize: 18,
        color: '#030303ff',
        marginTop: 4,
        marginLeft: 20,
    },
    planCount: {
        fontWeight: 'bold',
        color: '#000',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    loadingText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
    },
    scrollContainer: {
        flex: 1,
        marginTop: 20,
    },
    scrollContent: {
        flexGrow: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 15,
        flex: 1,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    },
    allPlanSections: {
        alignItems: 'center',
        gap: 10,
    },
    planSection: {
        marginBottom: 0,
    },
    buttonContainer: {
        position: 'absolute',
        top: 30,
        right: 30,
    },
});

export default home;