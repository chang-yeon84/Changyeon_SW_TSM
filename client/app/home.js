import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator, ScrollView } from 'react-native';
import Btm_nav_bar from '../components/btn_btm_nav_bar';
import Plancard_Home from "../components/plancard_home";
import { useNavigation } from '../contexts/navigationContext';
import { useAuth } from '../contexts/authContext';
import { API_ENDPOINTS } from '../config/api';
import API_CONFIG from '../config/api';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

const home = () => {
    const router = useRouter();
    const { setActiveTab } = useNavigation();
    const { user } = useAuth();
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [weather, setWeather] = useState(null);
    const [location, setLocation] = useState(null);

    console.log('[home] 렌더링 시 user 상태:', user);

    // 옷차림 추천
    const getClothingRecommendation = (temp, icon) => {
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
            '01d': { name: 'sunny', color: '#FFD700' },          // 맑음 (낮)
            '01n': { name: 'moon', color: '#F0E68C' },           // 맑음 (밤)
            '02d': { name: 'partly-sunny', color: '#FFA500' },   // 구름 조금 (낮)
            '02n': { name: 'cloudy-night', color: '#D3D3D3' },   // 구름 조금 (밤)
            '03d': { name: 'cloud', color: '#E0E0E0' },          // 구름
            '03n': { name: 'cloud', color: '#C0C0C0' },          // 구름
            '04d': { name: 'cloudy', color: '#B0B0B0' },         // 구름 많음
            '04n': { name: 'cloudy', color: '#A0A0A0' },         // 구름 많음
            '09d': { name: 'rainy', color: '#87CEEB' },          // 소나기
            '09n': { name: 'rainy', color: '#6495ED' },          // 소나기
            '10d': { name: 'rainy', color: '#4682B4' },          // 비
            '10n': { name: 'rainy', color: '#4169E1' },          // 비
            '11d': { name: 'thunderstorm', color: '#FFD700' },   // 천둥번개
            '11n': { name: 'thunderstorm', color: '#FFA500' },   // 천둥번개
            '13d': { name: 'snow', color: '#FFFFFF' },           // 눈
            '13n': { name: 'snow', color: '#F0F8FF' },           // 눈
            '50d': { name: 'cloud', color: '#D3D3D3' },          // 안개
            '50n': { name: 'cloud', color: '#C0C0C0' },          // 안개
        };
        return iconMap[iconCode] || { name: 'cloud', color: '#FFFFFF' };
    };

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

    // 현재 위치 및 날씨 가져오기 애뮬레이터에서 위치 설정 따로 해야됨 안하고 안된다고 하면 대가리
    const fetchWeather = async () => {
        try {
            // 위치 권한 요청
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('위치 권한이 거부되었습니다.');
                return;
            }

            // 현재 위치 가져오기
            let currentLocation = await Location.getLastKnownPositionAsync({});

            if (!currentLocation) {
                console.log('마지막 위치 없음, 현재 위치 가져오는 중...');
                currentLocation = await Location.getCurrentPositionAsync({
                    accuracy: Location.Accuracy.Lowest,
                });
            }

            setLocation(currentLocation);

            const { latitude, longitude } = currentLocation.coords;
            console.log('위치 정보:', latitude, longitude);

            // OpenWeatherMap API 호출
            const response = await fetch(
                `${API_ENDPOINTS.WEATHER}?lat=${latitude}&lon=${longitude}&appid=${API_CONFIG.OPENWEATHER_API_KEY}&units=metric&lang=kr`
            );

            const data = await response.json();

            if (response.ok) {
                const weatherData = {
                    temp: Math.round(data.main.temp),
                    description: data.weather[0].description,
                    city: data.name,
                    icon: data.weather[0].icon,
                    clouds: data.clouds.all, // 구름양 (%)
                    humidity: data.main.humidity, // 습도
                };
                console.log('날씨 데이터:', weatherData);
                console.log('아이콘 URL:', `https://openweathermap.org/img/wn/${weatherData.icon}@4x.png`);
                setWeather(weatherData);
            } else {
                console.error('날씨 API 오류:', data);
            }
        } catch (error) {
            console.error('날씨 불러오기 에러:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            setActiveTab('home');
            console.log('[home] useFocusEffect - user 상태:', user);
            if (user?.userId) {
                fetchTodaySchedules();
            }
            fetchWeather();
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
                        <Image
                            source={require('../assets/icons/index_icon.png')}
                            style={styles.homeIcon}
                            resizeMode="contain"
                        />
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

            {/* 날씨 정보 */}
            {weather && (
                <View style={styles.weatherBox}>
                    <View style={styles.weatherContent}>
                        <Ionicons
                            name={getWeatherIcon(weather.icon).name}
                            size={70}
                            color={getWeatherIcon(weather.icon).color}
                        />
                        <View style={styles.weatherTextContainer}>
                            <Text style={styles.weatherTemp}>{weather.temp}°</Text>
                            <Text style={styles.weatherDescription}>{weather.description}</Text>
                            <Text style={styles.weatherCity}>{weather.city}</Text>
                        </View>
                        <View style={styles.weatherInfoRight}>
                            <View style={styles.infoBox}>
                                <Ionicons name="cloud-outline" size={18} color="#FFFFFF" />
                                <Text style={styles.infoText}>구름 {weather.clouds}%</Text>
                            </View>
                            <View style={styles.infoBox}>
                                <Ionicons name="shirt-outline" size={18} color="#FFFFFF" />
                                <Text style={styles.infoText}>{getClothingRecommendation(weather.temp, weather.icon)}</Text>
                            </View>
                        </View>
                    </View>
                </View>
            )}

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
    homeIcon: {
        position: 'absolute',
        top: -10,
        right: 15,
        width: '35%',
        height: '35%',
    },
    weatherBox: {
        width: 392,
        height: 120,
        backgroundColor: '#5bb5edff',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginTop: 10,
        marginBottom: 10,
        padding: 20,
        justifyContent: 'center',
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
        marginTop: -5,
    },
    weatherCity: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.8,
        marginTop: 2,
    },
    weatherInfoRight: {
        position: 'absolute',
        right: 15,
        bottom: 10,
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

export default home;