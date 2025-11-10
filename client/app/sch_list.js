import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import Btm_nav_bar from '../components/btn_btm_nav_bar';
import Btnsch_add from '../components/btnsch_add';
import Btnsch_list_date from '../components/btnsch_list_date';
import Plancard_List from '../components/plancard_list';
import { useNavigation } from '../contexts/navigationContext';
import { useAuth } from '../contexts/authContext';

const sch_List = () => {
    const router = useRouter();
    const { setActiveTab } = useNavigation();
    const { user } = useAuth();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(false);

    console.log('[sch_list] 렌더링 시 user 상태:', user);

    useFocusEffect(
        useCallback(() => {
            setActiveTab('sch_list');
            console.log('[sch_list] useFocusEffect - Current user:', user);
            fetchSchedules();
        }, [currentDate, user.userId])
    );

    // 일정 불러오기
    const fetchSchedules = async () => {
        try {
            setLoading(true);

            // Context에서 userId 가져오기
            const userId = user.userId;
            console.log('fetchSchedules - userId:', userId);

            if (!userId) {
                console.log('로그인 필요 - user 객체:', user);
                return;
            }

            // 날짜를 YYYY-MM-DD 형식으로 변환
            const dateString = currentDate.toISOString().split('T')[0];

            const response = await fetch(
                `http://192.168.0.4:5000/api/schedules/date/${dateString}?userId=${userId}`
            );

            const result = await response.json();

            if (result.success) {
                setSchedules(result.data);
            } else {
                console.error('일정 불러오기 실패:', result.message);
                setSchedules([]);
            }
        } catch (error) {
            console.error('일정 불러오기 에러:', error);
            setSchedules([]);
        } finally {
            setLoading(false);
        }
    };

    const handlePrevDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() - 1);
        setCurrentDate(newDate);
    };

    const handleNextDay = () => {
        const newDate = new Date(currentDate);
        newDate.setDate(newDate.getDate() + 1);
        setCurrentDate(newDate);
    };

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        return `${year}년 ${month}월 ${day}일`;
    };

    // 교통수단 아이콘 가져오기
    const getTransportIcon = (type) => {
        switch (type) {
            case 'walk':
                return <Ionicons name="walk" size={16} color="#000" />;
            case 'car':
                return <Ionicons name="car" size={16} color="#000" />;
            case 'bus':
                return <Ionicons name="bus" size={16} color="#000" />;
            case 'subway':
                return <Ionicons name="subway" size={16} color="#000" />;
            case 'bicycle':
                return <Ionicons name="bicycle" size={16} color="#000" />;
            default:
                return <Ionicons name="ellipsis-horizontal" size={16} color="#000" />;
        }
    };
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.topWhiteBox}>
                <Btnsch_list_date direction="left" onPress={handlePrevDay} />
                <Text style={styles.dateText}>
                    {formatDate(currentDate)}
                </Text>
                <Btnsch_list_date direction="right" onPress={handleNextDay} />
            </View>
            <View style={styles.underWhiteBox}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#00A8FF" />
                        <Text style={styles.loadingText}>일정 불러오는 중...</Text>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        <View style={styles.allPlanSections}>
                            {schedules.length > 0 ? (
                                schedules.map((schedule) => (
                                    <TouchableOpacity
                                        key={schedule._id}
                                        onPress={() => router.push({ pathname: "/sch_detail", params: { id: schedule._id } })}
                                        activeOpacity={1}
                                    >
                                        <Plancard_List
                                            time={`${schedule.startTime} ~ ${schedule.endTime}`}
                                            title={schedule.title}
                                            location={schedule.destinationLocation || '-'}
                                            weather={schedule.weather || '정보 없음'}
                                            departureLocation={schedule.departureLocation || '-'}
                                            transport={getTransportIcon(schedule.transportType)}
                                            journeyTime={schedule.journeyTime || '-'}
                                        />
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <View style={styles.emptyContainer}>
                                    <Ionicons name="calendar-outline" size={60} color="#C7C7C7" />
                                    <Text style={styles.emptyText}>등록된 일정이 없습니다</Text>
                                </View>
                            )}

                            <TouchableOpacity
                                onPress={() => router.push({ pathname: "/sch_add" })}
                                activeOpacity={1}
                            >
                                <Btnsch_add />
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
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
        gap: 10
    },
    topWhiteBox: {
        width: 392,
        height: 80,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginTop: 50,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
    },
    dateText: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    scrollContent: {
        paddingBottom: 110,
    },
    underWhiteBox: {
        width: 392,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        flex: 1

    },
    allPlanSections: {
        alignItems: 'center',
        marginTop: 15,
        gap: 13,
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
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
        gap: 15,
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
        fontWeight: '500',
    }
});
export default sch_List