import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import { useCallback, useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from "react-native";
import { WebView } from 'react-native-webview';
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
    const [routeInfo, setRouteInfo] = useState(null);
    const [transportType, setTransportType] = useState('CAR'); // CAR, TRANSIT, WALK
    const [carPriority, setCarPriority] = useState('RECOMMEND'); // RECOMMEND, TIME, DISTANCE

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

    // 직선 거리 계산 함수 (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
        const R = 6371; // 지구 반지름 (km)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c; // km 단위
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
                            <Text style={styles.locationText} numberOfLines={1} ellipsizeMode="tail">
                                {schedule.destinationLocation || '도착지 없음'}
                            </Text>
                            {schedule.destinationAddress && (
                                <Text style={styles.addressText} numberOfLines={1} ellipsizeMode="tail">
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

                {/* 지도 */}
                {(schedule.departureCoordinates || schedule.destinationCoordinates) && (
                    <>
                        {/* 이동 수단 선택 버튼 */}
                        {schedule.departureCoordinates && schedule.destinationCoordinates && (
                            <>
                                <View style={styles.transportButtons}>
                                    <TouchableOpacity
                                        style={[styles.transportButton, transportType === 'CAR' && styles.transportButtonActive]}
                                        onPress={() => setTransportType('CAR')}
                                    >
                                        <Ionicons
                                            name="car"
                                            size={20}
                                            color={transportType === 'CAR' ? '#FFFFFF' : '#666'}
                                        />
                                        <Text style={[styles.transportButtonText, transportType === 'CAR' && styles.transportButtonTextActive]}>
                                            차량
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.transportButton, transportType === 'TRANSIT' && styles.transportButtonActive]}
                                        onPress={() => setTransportType('TRANSIT')}
                                    >
                                        <Ionicons
                                            name="bus"
                                            size={20}
                                            color={transportType === 'TRANSIT' ? '#FFFFFF' : '#666'}
                                        />
                                        <Text style={[styles.transportButtonText, transportType === 'TRANSIT' && styles.transportButtonTextActive]}>
                                            대중교통
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.transportButton, transportType === 'WALK' && styles.transportButtonActive]}
                                        onPress={() => setTransportType('WALK')}
                                    >
                                        <Ionicons
                                            name="walk"
                                            size={20}
                                            color={transportType === 'WALK' ? '#FFFFFF' : '#666'}
                                        />
                                        <Text style={[styles.transportButtonText, transportType === 'WALK' && styles.transportButtonTextActive]}>
                                            도보
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* 차량 선택 시 세부 옵션 */}
                                {transportType === 'CAR' && (
                                    <View style={styles.carOptionsButtons}>
                                        <TouchableOpacity
                                            style={[styles.carOptionButton, carPriority === 'RECOMMEND' && styles.carOptionButtonActive]}
                                            onPress={() => setCarPriority('RECOMMEND')}
                                        >
                                            <Text style={[styles.carOptionText, carPriority === 'RECOMMEND' && styles.carOptionTextActive]}>
                                                추천
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.carOptionButton, carPriority === 'TIME' && styles.carOptionButtonActive]}
                                            onPress={() => setCarPriority('TIME')}
                                        >
                                            <Text style={[styles.carOptionText, carPriority === 'TIME' && styles.carOptionTextActive]}>
                                                빠른길
                                            </Text>
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={[styles.carOptionButton, carPriority === 'DISTANCE' && styles.carOptionButtonActive]}
                                            onPress={() => setCarPriority('DISTANCE')}
                                        >
                                            <Text style={[styles.carOptionText, carPriority === 'DISTANCE' && styles.carOptionTextActive]}>
                                                최단거리
                                            </Text>
                                        </TouchableOpacity>
                                    </View>
                                )}
                            </>
                        )}

                        {/* 경로 정보 */}
                        {routeInfo && (
                            <View style={styles.routeInfoContainer}>
                                <View style={styles.routeInfoItem}>
                                    <Ionicons name="navigate-outline" size={18} color="#00A8FF" />
                                    <Text style={styles.routeInfoText}>{routeInfo.distance}</Text>
                                </View>
                                <View style={styles.routeInfoDivider} />
                                <View style={styles.routeInfoItem}>
                                    <Ionicons name="time-outline" size={18} color="#00A8FF" />
                                    <Text style={styles.routeInfoText}>{routeInfo.duration}</Text>
                                </View>
                                {routeInfo.fare && (
                                    <>
                                        <View style={styles.routeInfoDivider} />
                                        <View style={styles.routeInfoItem}>
                                            <Ionicons name="card-outline" size={18} color="#00A8FF" />
                                            <Text style={styles.routeInfoText}>{routeInfo.fare}</Text>
                                        </View>
                                    </>
                                )}
                            </View>
                        )}

                        <View style={styles.mapContainer}>
                        <WebView
                            key={`${transportType}-${carPriority}`}
                            style={styles.map}
                            originWhitelist={['*']}
                            onError={(syntheticEvent) => {
                                const { nativeEvent } = syntheticEvent;
                                console.warn('WebView error: ', nativeEvent);
                            }}
                            onMessage={(event) => {
                                const message = event.nativeEvent.data;
                                console.log('WebView message: ', message);

                                // 경로 정보 파싱
                                if (message.startsWith('Route info:')) {
                                    const parts = message.replace('Route info: ', '').split(', ');
                                    const distance = parts[0];
                                    const duration = parts[1];
                                    const fare = parts[2];

                                    setRouteInfo({
                                        distance,
                                        duration,
                                        fare: fare !== 'undefined' ? fare : null
                                    });
                                }
                            }}
                            javaScriptEnabled={true}
                            domStorageEnabled={true}
                            source={{
                                html: `
                                    <!DOCTYPE html>
                                    <html>
                                    <head>
                                        <meta charset="utf-8">
                                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                                        <script type="text/javascript" src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${API_CONFIG.KAKAO_JS_KEY || process.env.EXPO_PUBLIC_KAKAO_JS_KEY}"></script>
                                        <style>
                                            body, html { margin: 0; padding: 0; width: 100%; height: 100%; }
                                            #map { width: 100%; height: 100%; }
                                        </style>
                                    </head>
                                    <body>
                                        <div id="map"></div>
                                        <script>
                                            try {
                                                console.log('Starting map initialization...');
                                                window.ReactNativeWebView && window.ReactNativeWebView.postMessage('Map script started');

                                            var mapContainer = document.getElementById('map');
                                            var departureCoords = ${schedule.departureCoordinates ? `{x: ${schedule.departureCoordinates.x}, y: ${schedule.departureCoordinates.y}}` : 'null'};
                                            var destinationCoords = ${schedule.destinationCoordinates ? `{x: ${schedule.destinationCoordinates.x}, y: ${schedule.destinationCoordinates.y}}` : 'null'};

                                            var centerCoords = departureCoords || destinationCoords;

                                            var mapOption = {
                                                center: new kakao.maps.LatLng(centerCoords.y, centerCoords.x),
                                                level: 5
                                            };

                                            var map = new kakao.maps.Map(mapContainer, mapOption);

                                            // 출발지 마커
                                            if (departureCoords) {
                                                var departureMarker = new kakao.maps.Marker({
                                                    position: new kakao.maps.LatLng(departureCoords.y, departureCoords.x),
                                                    map: map
                                                });

                                                var departureInfowindow = new kakao.maps.InfoWindow({
                                                    content: '<div style="padding:5px;font-size:12px;">${schedule.departureLocation || '출발지'}</div>'
                                                });

                                                kakao.maps.event.addListener(departureMarker, 'click', function() {
                                                    departureInfowindow.open(map, departureMarker);
                                                });
                                            }

                                            // 도착지 마커
                                            if (destinationCoords) {
                                                var destinationMarker = new kakao.maps.Marker({
                                                    position: new kakao.maps.LatLng(destinationCoords.y, destinationCoords.x),
                                                    map: map
                                                });

                                                var destinationInfowindow = new kakao.maps.InfoWindow({
                                                    content: '<div style="padding:5px;font-size:12px;">${schedule.destinationLocation || '도착지'}</div>'
                                                });

                                                kakao.maps.event.addListener(destinationMarker, 'click', function() {
                                                    destinationInfowindow.open(map, destinationMarker);
                                                });
                                            }

                                            // 경로선 - 카카오 Mobility API 사용
                                            if (departureCoords && destinationCoords) {
                                                var kakaoRestApiKey = '${API_CONFIG.KAKAO_REST_API_KEY}';
                                                var transportType = '${transportType}';
                                                var carPriority = '${carPriority}';
                                                var apiUrl = '';

                                                // 이동 수단에 따라 다른 API 사용
                                                if (transportType === 'CAR') {
                                                    // 자동차 경로
                                                    apiUrl = 'https://apis-navi.kakaomobility.com/v1/directions?' +
                                                        'origin=' + departureCoords.x + ',' + departureCoords.y +
                                                        '&destination=' + destinationCoords.x + ',' + destinationCoords.y +
                                                        '&priority=' + carPriority;
                                                } else if (transportType === 'WALK' || transportType === 'TRANSIT') {
                                                    // 직선으로 표시
                                                    var linePath = [
                                                        new kakao.maps.LatLng(departureCoords.y, departureCoords.x),
                                                        new kakao.maps.LatLng(destinationCoords.y, destinationCoords.x)
                                                    ];

                                                    var strokeColor = transportType === 'WALK' ? '#FF9800' : '#4CAF50';
                                                    var strokeStyle = transportType === 'WALK' ? 'dot' : 'dash';

                                                    var polyline = new kakao.maps.Polyline({
                                                        path: linePath,
                                                        strokeWeight: 5,
                                                        strokeColor: strokeColor,
                                                        strokeOpacity: 0.8,
                                                        strokeStyle: strokeStyle
                                                    });

                                                    polyline.setMap(map);

                                                    var bounds = new kakao.maps.LatLngBounds();
                                                    bounds.extend(new kakao.maps.LatLng(departureCoords.y, departureCoords.x));
                                                    bounds.extend(new kakao.maps.LatLng(destinationCoords.y, destinationCoords.x));
                                                    map.setBounds(bounds);

                                                    // Haversine 공식으로 직선 거리 계산
                                                    function calculateDistance(lat1, lon1, lat2, lon2) {
                                                        var R = 6371; // 지구 반지름 (km)
                                                        var dLat = (lat2 - lat1) * Math.PI / 180;
                                                        var dLon = (lon2 - lon1) * Math.PI / 180;
                                                        var a =
                                                            Math.sin(dLat/2) * Math.sin(dLat/2) +
                                                            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                                                            Math.sin(dLon/2) * Math.sin(dLon/2);
                                                        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                                                        return R * c;
                                                    }

                                                    var distanceKm = calculateDistance(
                                                        departureCoords.y, departureCoords.x,
                                                        destinationCoords.y, destinationCoords.x
                                                    );

                                                    var distance = distanceKm.toFixed(1) + 'km';
                                                    var duration;

                                                    if (transportType === 'WALK') {
                                                        // 도보: 평균 4km/h
                                                        var walkTimeMinutes = Math.round((distanceKm / 4) * 60);
                                                        duration = walkTimeMinutes + '분';
                                                    } else {
                                                        // 대중교통: 평균 30km/h (대략적)
                                                        var transitTimeMinutes = Math.round((distanceKm / 30) * 60);
                                                        duration = transitTimeMinutes + '분';
                                                    }

                                                    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
                                                        'Route info: ' + distance + ', ' + duration
                                                    );

                                                    apiUrl = null; // API 호출 건너뛰기
                                                }

                                                if (apiUrl) {

                                                fetch(apiUrl, {
                                                    method: 'GET',
                                                    headers: {
                                                        'Authorization': 'KakaoAK ' + kakaoRestApiKey
                                                    }
                                                })
                                                .then(response => {
                                                    window.ReactNativeWebView && window.ReactNativeWebView.postMessage('API Response Status: ' + response.status);
                                                    return response.json();
                                                })
                                                .then(data => {
                                                    window.ReactNativeWebView && window.ReactNativeWebView.postMessage('API Response: ' + JSON.stringify(data));
                                                    if (data.routes && data.routes.length > 0) {
                                                        var route = data.routes[0];
                                                        var linePath = [];

                                                        // 경로의 모든 구간을 순회하며 좌표 추출
                                                        route.sections.forEach(section => {
                                                            section.roads.forEach(road => {
                                                                road.vertexes.forEach((vertex, index) => {
                                                                    if (index % 2 === 0) {
                                                                        var x = road.vertexes[index];
                                                                        var y = road.vertexes[index + 1];
                                                                        linePath.push(new kakao.maps.LatLng(y, x));
                                                                    }
                                                                });
                                                            });
                                                        });

                                                        // 실제 도로 경로 표시 - 이동 수단별 색상
                                                        var strokeColor = transportType === 'CAR' ? '#00A8FF' :
                                                                         transportType === 'WALK' ? '#FF9800' : '#4CAF50';
                                                        var strokeStyle = transportType === 'WALK' ? 'dot' : 'solid';

                                                        var polyline = new kakao.maps.Polyline({
                                                            path: linePath,
                                                            strokeWeight: 5,
                                                            strokeColor: strokeColor,
                                                            strokeOpacity: 0.8,
                                                            strokeStyle: strokeStyle
                                                        });

                                                        polyline.setMap(map);

                                                        // 두 지점이 모두 보이도록 지도 범위 조정
                                                        var bounds = new kakao.maps.LatLngBounds();
                                                        linePath.forEach(point => bounds.extend(point));
                                                        map.setBounds(bounds);

                                                        // 거리와 시간 정보 표시
                                                        var distance = (route.summary.distance / 1000).toFixed(1) + 'km';
                                                        var duration = Math.round(route.summary.duration / 60) + '분';
                                                        var fare = route.summary.fare && route.summary.fare.taxi ?
                                                            route.summary.fare.taxi.toLocaleString() + '원' : null;

                                                        window.ReactNativeWebView && window.ReactNativeWebView.postMessage(
                                                            'Route info: ' + distance + ', ' + duration + (fare ? ', ' + fare : '')
                                                        );
                                                    } else {
                                                        throw new Error('경로를 찾을 수 없습니다.');
                                                    }
                                                })
                                                .catch(error => {
                                                    console.error('Route error:', error);
                                                    // API 실패시 직선으로 표시
                                                    var linePath = [
                                                        new kakao.maps.LatLng(departureCoords.y, departureCoords.x),
                                                        new kakao.maps.LatLng(destinationCoords.y, destinationCoords.x)
                                                    ];

                                                    var polyline = new kakao.maps.Polyline({
                                                        path: linePath,
                                                        strokeWeight: 3,
                                                        strokeColor: '#00A8FF',
                                                        strokeOpacity: 0.7,
                                                        strokeStyle: 'solid'
                                                    });

                                                    polyline.setMap(map);

                                                    var bounds = new kakao.maps.LatLngBounds();
                                                    bounds.extend(new kakao.maps.LatLng(departureCoords.y, departureCoords.x));
                                                    bounds.extend(new kakao.maps.LatLng(destinationCoords.y, destinationCoords.x));
                                                    map.setBounds(bounds);

                                                    window.ReactNativeWebView && window.ReactNativeWebView.postMessage('Using straight line: ' + error.message);
                                                });
                                                }
                                            }

                                            window.ReactNativeWebView && window.ReactNativeWebView.postMessage('Map initialized successfully');
                                            } catch (error) {
                                                console.error('Map error:', error);
                                                window.ReactNativeWebView && window.ReactNativeWebView.postMessage('Map error: ' + error.message);
                                            }
                                        </script>
                                    </body>
                                    </html>
                                `
                            }}
                            scrollEnabled={false}
                            bounces={false}
                        />
                    </View>
                    </>
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
    transportButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 392,
        marginBottom: 12,
    },
    transportButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginHorizontal: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    transportButtonActive: {
        backgroundColor: '#00A8FF',
    },
    transportButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#666',
        marginLeft: 6,
    },
    transportButtonTextActive: {
        color: '#FFFFFF',
    },
    carOptionsButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: 392,
        marginBottom: 12,
    },
    carOptionButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    carOptionButtonActive: {
        backgroundColor: '#E3F2FD',
    },
    carOptionText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#999',
    },
    carOptionTextActive: {
        color: '#00A8FF',
    },
    routeInfoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: 392,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingVertical: 12,
        paddingHorizontal: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    routeInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
    },
    routeInfoText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#333',
        marginLeft: 6,
    },
    routeInfoDivider: {
        width: 1,
        height: 18,
        backgroundColor: '#E0E0E0',
        marginHorizontal: 8,
    },
    mapContainer: {
        width: 392,
        height: 300,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    map: {
        width: '100%',
        height: '100%',
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
