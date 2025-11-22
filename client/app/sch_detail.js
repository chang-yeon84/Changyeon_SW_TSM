import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native";
import Btm_nav_bar from '../components/btn_btm_nav_bar';
import { useNavigation } from '../contexts/navigationContext';
import { useAuth } from '../contexts/authContext';
import { API_ENDPOINTS } from '../config/api';
import API_CONFIG from '../config/api';

const sch_Detail = () => {
    const { setActiveTab } = useNavigation();
    const { user } = useAuth();
    const router = useRouter();
    const params = useLocalSearchParams();
    const scheduleId = params.id;

    const [schedule, setSchedule] = useState(null);
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        setActiveTab();
        fetchScheduleDetail();
    }, [scheduleId]);

    // 옷차림 추천
    const getClothingRecommendation = (temp) => {
        if (temp >= 28) return '민소매, 반팔';
        if (temp >= 23) return '반팔, 얇은 셔츠';
        if (temp >= 20) return '얇은 가디건, 긴팔';
        if (temp >= 17) return '얇은 니트, 맨투맨';
        if (temp >= 12) return '자켓, 가디건';
        if (temp >= 9) return '트렌치코트, 야상';
        if (temp >= 5) return '코트, 가죽자켓';
        return '패딩, 두꺼운 코트';
    };

    // 날씨 아이콘 매핑
    const getWeatherIcon = (iconCode) => {
        const iconMap = {
            '01d': { name: 'sunny', color: '#FFD700' },
            '01n': { name: 'moon', color: '#F0E68C' },
            '02d': { name: 'partly-sunny', color: '#FFA500' },
            '02n': { name: 'cloudy-night', color: '#D3D3D3' },
            '03d': { name: 'cloud', color: '#E0E0E0' },
            '03n': { name: 'cloud', color: '#C0C0C0' },
            '04d': { name: 'cloudy', color: '#B0B0B0' },
            '04n': { name: 'cloudy', color: '#A0A0A0' },
            '09d': { name: 'rainy', color: '#87CEEB' },
            '09n': { name: 'rainy', color: '#6495ED' },
            '10d': { name: 'rainy', color: '#4682B4' },
            '10n': { name: 'rainy', color: '#4169E1' },
            '11d': { name: 'thunderstorm', color: '#FFD700' },
            '11n': { name: 'thunderstorm', color: '#FFA500' },
            '13d': { name: 'snow', color: '#FFFFFF' },
            '13n': { name: 'snow', color: '#F0F8FF' },
            '50d': { name: 'cloud', color: '#D3D3D3' },
            '50n': { name: 'cloud', color: '#C0C0C0' },
        };
        return iconMap[iconCode] || { name: 'cloud', color: '#FFFFFF' };
    };

    // 일정 상세 정보 불러오기
    const fetchScheduleDetail = async () => {
        try {
            setLoading(true);

            if (!scheduleId) {
                Alert.alert('오류', '일정 ID가 없습니다.');
                router.back();
                return;
            }

            const response = await fetch(`${API_ENDPOINTS.SCHEDULES}/${scheduleId}`);
            const result = await response.json();

            if (result.success) {
                setSchedule(result.data);
                fetchWeatherForSchedule(result.data);
            } else {
                Alert.alert('오류', result.message || '일정을 불러올 수 없습니다.');
                router.back();
            }
        } catch (error) {
            console.error('일정 불러오기 에러:', error);
            Alert.alert('오류', '일정을 불러오는 중 오류가 발생했습니다.');
            router.back();
        } finally {
            setLoading(false);
        }
    };

    // 출발지 좌표로 날씨 가져오기
    const fetchWeatherForSchedule = async (scheduleData) => {
        try {
            // 출발지 좌표 우선, 없으면 도착지 좌표 사용
            const coordinates = scheduleData.departureCoordinates || scheduleData.destinationCoordinates;

            if (!coordinates || !coordinates.x || !coordinates.y) {
                console.log('좌표 정보가 없습니다.');
                return;
            }

            // 카카오맵 좌표는 x(경도), y(위도) 형식
            const lat = coordinates.y;
            const lon = coordinates.x;

            // 날씨 API 호출
            const weatherResponse = await fetch(
                `${API_ENDPOINTS.WEATHER}?lat=${lat}&lon=${lon}&appid=${API_CONFIG.OPENWEATHER_API_KEY}&units=metric&lang=kr`
            );

            const weatherData = await weatherResponse.json();

            if (weatherResponse.ok) {
                const formattedWeather = {
                    temp: Math.round(weatherData.main.temp),
                    description: weatherData.weather[0].description,
                    city: weatherData.name,
                    icon: weatherData.weather[0].icon,
                    clouds: weatherData.clouds.all,
                    humidity: weatherData.main.humidity,
                };
                setWeather(formattedWeather);
            } else {
                console.error('날씨 API 오류:', weatherData);
            }
        } catch (error) {
            console.error('날씨 불러오기 에러:', error);
        }
    };

    // 일정 삭제 핸들러
    const handleDelete = () => {
        Alert.alert(
            '일정 삭제',
            '정말로 이 일정을 삭제하시겠습니까?',
            [
                {
                    text: '취소',
                    style: 'cancel',
                },
                {
                    text: '삭제',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await fetch(`${API_ENDPOINTS.SCHEDULES}/${scheduleId}`, {
                                method: 'DELETE',
                            });

                            const result = await response.json();

                            if (result.success) {
                                Alert.alert('성공', '일정이 삭제되었습니다.', [
                                    {
                                        text: '확인',
                                        onPress: () => router.push('/sch_list'),
                                    },
                                ]);
                            } else {
                                Alert.alert('오류', result.message || '일정 삭제에 실패했습니다.');
                            }
                        } catch (error) {
                            console.error('일정 삭제 에러:', error);
                            Alert.alert('오류', '일정 삭제 중 오류가 발생했습니다.');
                        }
                    },
                },
            ]
        );
    };

    // 일정 수정 페이지로 이동
    const handleEdit = () => {
        router.push({ pathname: '/sch_add', params: { id: scheduleId } });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#00A8FF" />
                    <Text style={styles.loadingText}>일정 불러오는 중...</Text>
                </View>
                <Btm_nav_bar />
            </View>
        );
    }

    if (!schedule) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <Text style={styles.errorText}>일정을 찾을 수 없습니다.</Text>
                <Btm_nav_bar />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* 제목 및 버튼 */}
                <View style={styles.topWhiteBox}>
                    <Text style={styles.title}>{schedule.title}</Text>
                    <View style={styles.buttonRow}>
                        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
                            <Text style={styles.editButtonText}>수정</Text>
                            <Ionicons name="create-outline" size={23} color="#000000ff" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                            <Text style={styles.deleteButtonText}>삭제</Text>
                            <Ionicons name="trash" size={23} color="#000000ff" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* 시간 */}
                <View style={styles.timeWhiteBox}>
                    <View style={styles.timeRow}>
                        <Ionicons name="time-outline" size={24} color="#000000ff" />
                        <Text style={styles.timeText}>{schedule.startTime} ~ {schedule.endTime}</Text>
                    </View>
                </View>

                {/* 출발지/도착지 */}
                <View style={styles.locationWhiteBox}>
                    {/* 출발지 */}
                    <View style={styles.locationRowDeparture}>
                        <View style={styles.iconContainerDeparture}>
                            <Ionicons name="location-sharp" size={24} color="#00A8FF" />
                        </View>
                        <View style={styles.locationTextContainer}>
                            <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                                {schedule.departureLocation || '출발지 없음'}
                            </Text>
                            {schedule.departureAddress && (
                                <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">
                                    {schedule.departureAddress}
                                </Text>
                            )}
                        </View>
                    </View>

                    <View style={styles.dotLine}>
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                        <View style={styles.dot} />
                    </View>

                    {/* 도착지 */}
                    <View style={styles.locationRowDestination}>
                        <View style={styles.iconContainerDestination}>
                            <Ionicons name="location-sharp" size={24} color="#FF4757" />
                        </View>
                        <View style={styles.locationTextContainerNoBorder}>
                            <Text style={styles.locationText}>
                                {schedule.destinationLocation || '도착지 없음'}
                            </Text>
                            {schedule.destinationAddress && (
                                <Text style={styles.addressText} numberOfLines={2}>
                                    {schedule.destinationAddress}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* 메모 */}
                {schedule.memo && schedule.memo.trim() !== '' && (
                    <View style={styles.memoWhiteBox}>
                        <View style={styles.memorow}>
                            <Ionicons name="document-text-outline" size={24} />
                        </View>
                        <View style={styles.memoDivider} />
                        <Text style={styles.memoText}>{schedule.memo}</Text>
                    </View>
                )}

                {/* 날씨 정보 */}
                {weather && (
                    <View style={styles.weatherBox}>
                        <View style={styles.weatherHeader}>
                            <Ionicons name="time-outline" size={18} color="#FFFFFF" style={styles.weatherTimeIcon} />
                            <Text style={styles.weatherHeaderText}>
                                <Text style={styles.weatherTimeText}>
                                    {schedule.startTime}
                                </Text>
                                {'  '}
                                <Text style={styles.weatherLocationText}>
                                    {schedule.departureLocation || schedule.destinationLocation}
                                </Text>
                                의 날씨
                            </Text>
                        </View>
                        <View style={styles.weatherContent}>
                            <Ionicons
                                name={getWeatherIcon(weather.icon).name}
                                size={70}
                                color={getWeatherIcon(weather.icon).color}
                            />
                            <View style={styles.weatherTextContainer}>
                                <Text style={styles.weatherTemp}>{weather.temp}°</Text>
                                <Text style={styles.weatherDescription}>{weather.description}</Text>
                            </View>
                            <View style={styles.weatherInfoRight}>
                                <View style={styles.infoBox}>
                                    <Ionicons name="cloud-outline" size={18} color="#FFFFFF" />
                                    <Text style={styles.infoText}>구름 {weather.clouds}%</Text>
                                </View>
                                <View style={styles.infoBox}>
                                    <Ionicons name="shirt-outline" size={18} color="#FFFFFF" />
                                    <Text style={styles.infoText}>{getClothingRecommendation(weather.temp)}</Text>
                                </View>
                            </View>
                        </View>
                    </View>
                )}
            </ScrollView>

            <Btm_nav_bar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    scrollView: {
        flex: 1,
        width: '100%',
    },
    scrollContent: {
        alignItems: 'center',
        gap: 10,
        paddingBottom: 120,
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
    errorText: {
        fontSize: 18,
        color: '#666',
        marginTop: 100,
    },
    topWhiteBox: {
        width: 392,
        height: 120,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginTop: 50,
        paddingHorizontal: 20,
        paddingVertical: 16,
        justifyContent: 'space-between',
    },
    title: {
        fontSize: 35,
        fontWeight: 'bold',
        color: '#000',

    },
    buttonRow: {
        flexDirection: 'row',
        alignSelf: 'flex-end',
    },
    editButton: {

        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: 'row',
        gap: 5,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000ff',

    },
    deleteButton: {

        paddingHorizontal: 13,
        paddingVertical: 8,
        borderRadius: 8,
        flexDirection: 'row',
        gap: 5,
    },
    deleteButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000000ff',
    },
    timeWhiteBox: {
        width: 392,
        height: 70,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    timeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    timeText: {
        fontSize: 20,
        fontWeight: '600',
        color: '#000',
    },
    locationWhiteBox: {
        width: 392,
        height: 150,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        paddingVertical: 5,
    },
    locationRowDeparture: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginLeft: 15,
        marginRight: 15,
    },
    locationRowDestination: {
        position: 'absolute',
        top: 75,
        left: 0,
        right: 0,
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginLeft: 15,
        marginRight: 15,
    },
    iconContainer: {
        width: 24,
        height: 24,
        marginTop: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainerDeparture: {
        width: 24,
        height: 24,
        marginTop: 23,
        justifyContent: 'center',
        alignItems: 'center',
    },
    iconContainerDestination: {
        width: 24,
        height: 24,
        marginTop: 30,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationTextContainer: {
        flex: 1,
        marginLeft: 15,
        paddingBottom: 15,
        borderBottomWidth: 2,
        borderBottomColor: '#E5E5E5',
        marginTop: 20,
    },
    locationTextContainerNoBorder: {
        flex: 1,
        marginLeft: 15,
        paddingBottom: 5,
        marginTop: 20,
    },
    locationText: {
        fontSize: 20,
        color: '#000',
        fontWeight: '500',
    },
    addressText: {
        fontSize: 13,
        color: '#666',
        marginTop: 1,
    },
    dotLine: {
        position: 'absolute',
        flexDirection: 'column',
        left: 25,
        top: 70,
    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#C7C7C7',
        marginVertical: 2,
    },
    memoWhiteBox: {
        width: 392,
        minHeight: 120,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        padding: 20,
    },
    memorow: {
        flexDirection: 'row',
        gap: 3,
        marginBottom: 5,

    },
    memoDivider: {
        width: '100%',
        height: 1,
        backgroundColor: '#E5E5E5',
        marginBottom: 15,
    },
    memoText: {
        fontSize: 16,
        color: '#000',
        lineHeight: 24,
    },
    weatherBox: {
        width: 392,
        backgroundColor: '#5bb5edff',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        padding: 20,
        paddingTop: 15,
    },
    weatherHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
    },
    weatherTimeIcon: {
        marginRight: 6,
    },
    weatherHeaderText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    weatherTimeText: {
        fontSize: 18,
        fontWeight: '600',
    },
    weatherLocationText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    weatherContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    weatherTextContainer: {
        flex: 1,
    },
    weatherTemp: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    weatherDescription: {
        fontSize: 16,
        color: '#FFFFFF',
        marginTop: 5,
    },
    weatherInfoRight: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        gap: 6,
        alignItems: 'flex-end',
    },
    infoBox: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    infoText: {
        fontSize: 13,
        color: '#FFFFFF',
        fontWeight: '500',
    },
});

export default sch_Detail;
