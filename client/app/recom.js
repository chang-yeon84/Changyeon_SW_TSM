import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, Linking } from 'react-native';
import { API_ENDPOINTS } from '../config/api';
import Btm_nav_bar from '../components/btn_btm_nav_bar';

const Recommend = () => {
    const [location, setLocation] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('restaurant');
    const [restaurants, setRestaurants] = useState([]);
    const [cafes, setCafes] = useState([]);
    const [attractions, setAttractions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [schedules, setSchedules] = useState([]);
    const [selectedSchedule, setSelectedSchedule] = useState(null);
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [displayCount, setDisplayCount] = useState({ restaurant: 3, cafe: 3, attraction: 3 });
    const [schedulesLoaded, setSchedulesLoaded] = useState(false);

    // 일정 목록 가져오기
    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            console.log('일정 조회 시작:', API_ENDPOINTS.SCHEDULES);
            const response = await fetch(API_ENDPOINTS.SCHEDULES);
            console.log('응답 상태:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const text = await response.text();
            console.log('응답 텍스트:', text.substring(0, 200));

            const data = JSON.parse(text);

            if (data.success && data.schedules.length > 0) {
                // 현재 날짜/시간 기준으로 가장 가까운 미래 일정 찾기
                const now = new Date();
                const upcomingSchedules = data.schedules
                    .filter(schedule => {
                        const scheduleDate = new Date(schedule.date);
                        const [startHour, startMinute] = schedule.startTime.split(':');
                        scheduleDate.setHours(parseInt(startHour), parseInt(startMinute));
                        return scheduleDate >= now && schedule.destinationCoordinates;
                    })
                    .sort((a, b) => {
                        const dateA = new Date(a.date);
                        const dateB = new Date(b.date);
                        return dateA - dateB;
                    });

                setSchedules(upcomingSchedules);

                // 가장 가까운 일정 선택
                if (upcomingSchedules.length > 0) {
                    const nearest = upcomingSchedules[0];
                    setSelectedSchedule(nearest);
                    setLocation({
                        latitude: nearest.destinationCoordinates.y,
                        longitude: nearest.destinationCoordinates.x,
                        name: nearest.destinationLocation
                    });
                }
            }

            setSchedulesLoaded(true);
        } catch (error) {
            console.error('일정 조회 에러:', error);
            setSchedulesLoaded(true);
        }
    };

    // 일정 선택 시
    const handleScheduleSelect = (schedule) => {
        setSelectedSchedule(schedule);
        setLocation({
            latitude: schedule.destinationCoordinates.y,
            longitude: schedule.destinationCoordinates.x,
            name: schedule.destinationLocation
        });
        setShowScheduleModal(false);
    };

    // 위치 정보가 있으면 추천 장소 가져오기
    useEffect(() => {
        console.log('location 변경됨:', location);
        if (location) {
            console.log('fetchRecommendations 호출 시작');
            fetchRecommendations();
        }
    }, [location]);

    // 추천 장소 가져오기
    const fetchRecommendations = async () => {
        if (!location) return;

        setLoading(true);
        try {
            console.log('추천 장소 요청 시작:', location);

            // 식당, 카페, 명소 동시에 조회 - 처음에는 3개씩만
            const [restaurantRes, cafeRes, attractionRes] = await Promise.all([
                fetch(`${API_ENDPOINTS.RECOMMENDATIONS_NEARBY}?latitude=${location.latitude}&longitude=${location.longitude}&category=restaurant&size=3`),
                fetch(`${API_ENDPOINTS.RECOMMENDATIONS_NEARBY}?latitude=${location.latitude}&longitude=${location.longitude}&category=cafe&size=3`),
                fetch(`${API_ENDPOINTS.RECOMMENDATIONS_NEARBY}?latitude=${location.latitude}&longitude=${location.longitude}&category=attraction&size=3`)
            ]);

            console.log('응답 상태:', {
                restaurant: restaurantRes.status,
                cafe: cafeRes.status,
                attraction: attractionRes.status
            });

            const restaurantData = await restaurantRes.json();
            const cafeData = await cafeRes.json();
            const attractionData = await attractionRes.json();

            console.log('응답 데이터:', {
                restaurant: restaurantData,
                cafe: cafeData,
                attraction: attractionData
            });

            if (restaurantData.success) setRestaurants(restaurantData.data);
            if (cafeData.success) setCafes(cafeData.data);
            if (attractionData.success) setAttractions(attractionData.data);

            // displayCount 초기화
            setDisplayCount({ restaurant: 3, cafe: 3, attraction: 3 });

        } catch (error) {
            console.error('추천 장소 조회 에러:', error);
        } finally {
            setLoading(false);
        }
    };

    // 더 보기 기능 - 3개씩 추가 로드
    const loadMore = async () => {
        if (!location) return;

        const currentCount = displayCount[selectedCategory];
        const newCount = currentCount + 3;

        try {
            const response = await fetch(
                `${API_ENDPOINTS.RECOMMENDATIONS_NEARBY}?latitude=${location.latitude}&longitude=${location.longitude}&category=${selectedCategory}&size=${newCount}`
            );
            const data = await response.json();

            if (data.success) {
                // 선택된 카테고리에 따라 상태 업데이트
                switch (selectedCategory) {
                    case 'restaurant':
                        setRestaurants(data.data);
                        break;
                    case 'cafe':
                        setCafes(data.data);
                        break;
                    case 'attraction':
                        setAttractions(data.data);
                        break;
                }

                // displayCount 업데이트
                setDisplayCount(prev => ({
                    ...prev,
                    [selectedCategory]: newCount
                }));
            }
        } catch (error) {
            console.error('더 보기 에러:', error);
        }
    };

    // 카테고리별 데이터 가져오기
    const getCategoryData = () => {
        switch (selectedCategory) {
            case 'restaurant':
                return restaurants;
            case 'cafe':
                return cafes;
            case 'attraction':
                return attractions;
            default:
                return [];
        }
    };

    // 거리 표시 포맷팅
    const formatDistance = (distance) => {
        if (distance < 1000) {
            return `${distance}m`;
        }
        return `${(distance / 1000).toFixed(1)}km`;
    };

    // 일정 로딩 중
    if (!schedulesLoaded) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#7fe0faff" />
                <Text style={styles.loadingText}>일정을 불러오는 중...</Text>
            </View>
        );
    }

    // 일정이 없을 때
    if (!location && schedulesLoaded) {
        return (
            <View style={styles.container}>
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>추천</Text>
                </View>
                <View style={styles.emptyScheduleContainer}>
                    <Ionicons name="calendar-outline" size={64} color="#ccc" />
                    <Text style={styles.emptyScheduleTitle}>저장된 일정이 없습니다</Text>
                    <Text style={styles.emptyScheduleDescription}>
                        일정을 추가하면 해당 위치 주변의{'\n'}맛집, 카페, 명소를 추천해드립니다.
                    </Text>
                </View>
                <Btm_nav_bar />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
                {/* 페이지 제목 */}
                <View style={styles.titleContainer}>
                    <Text style={styles.title}>추천</Text>
                </View>

                {/* 일정 선택 */}
                <View style={styles.scheduleSelectContainer}>
                    <TouchableOpacity
                        style={styles.scheduleSelector}
                        onPress={() => setShowScheduleModal(true)}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="location-outline" size={20} color="#666" />
                        <Text style={styles.scheduleSelectorText} numberOfLines={1}>
                            {selectedSchedule ? selectedSchedule.title : location?.name || '위치 선택'}
                        </Text>
                        <Ionicons name="chevron-down" size={20} color="#666" />
                    </TouchableOpacity>
                </View>

                {/* 카테고리 버튼 */}
                <View style={styles.categoryContainer}>
                    <TouchableOpacity
                        style={[styles.categoryButton, selectedCategory === 'restaurant' && styles.categoryButtonActive]}
                        onPress={() => setSelectedCategory('restaurant')}
                    >
                        <Ionicons name="restaurant" size={24} color="#000" />
                        <Text style={styles.categoryText}>식당</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.categoryButton, selectedCategory === 'cafe' && styles.categoryButtonActive]}
                        onPress={() => setSelectedCategory('cafe')}
                    >
                        <Ionicons name="cafe" size={24} color="#000" />
                        <Text style={styles.categoryText}>카페</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.categoryButton, selectedCategory === 'attraction' && styles.categoryButtonActive]}
                        onPress={() => setSelectedCategory('attraction')}
                    >
                        <Ionicons name="telescope" size={24} color="#000" />
                        <Text style={styles.categoryText}>명소</Text>
                    </TouchableOpacity>
                </View>

                {/* 추천 장소 리스트 */}
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#7fe0faff" />
                    </View>
                ) : (
                    <View style={styles.placesList}>
                        {getCategoryData().map((place, index) => (
                            <View
                                key={place.id || index}
                                style={styles.placeCard}
                            >
                                <View style={styles.placeHeader}>
                                    <View style={styles.placeInfo}>
                                        <Text style={styles.placeName} numberOfLines={1}>{place.name}</Text>
                                        <Text style={styles.placeCategory} numberOfLines={1}>{place.category}</Text>
                                        <View style={styles.placeLocationRow}>
                                            <Ionicons name="location-outline" size={16} color="#666" />
                                            <Text style={styles.placeAddress} numberOfLines={1}>{place.address}</Text>
                                        </View>
                                        {place.phone && place.phone !== '-' && (
                                            <View style={styles.placePhoneRow}>
                                                <Ionicons name="call-outline" size={16} color="#666" />
                                                <Text style={styles.placePhone}>{place.phone}</Text>
                                            </View>
                                        )}
                                    </View>
                                    <View style={styles.distanceBadge}>
                                        <Text style={styles.distanceText}>{Math.round(place.distance)}m</Text>
                                    </View>
                                </View>

                                {/* 액션 버튼 */}
                                <View style={styles.actionButtons}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => Linking.openURL(place.placeUrl)}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="map-outline" size={18} color="#0066cc" />
                                        <Text style={styles.actionButtonText}>카카오맵</Text>
                                    </TouchableOpacity>
                                    {place.phone && place.phone !== '-' && (
                                        <TouchableOpacity
                                            style={styles.actionButton}
                                            onPress={() => Linking.openURL(`tel:${place.phone}`)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="call-outline" size={18} color="#0066cc" />
                                            <Text style={styles.actionButtonText}>전화하기</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>
                            </View>
                        ))}

                        {getCategoryData().length === 0 && (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>추천 장소가 없습니다.</Text>
                            </View>
                        )}

                        {/* 더 보기 버튼 */}
                        {getCategoryData().length > 0 && getCategoryData().length >= displayCount[selectedCategory] && (
                            <TouchableOpacity
                                style={styles.loadMoreButton}
                                onPress={loadMore}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.loadMoreText}>더 보기</Text>
                                <Ionicons name="chevron-down" size={20} color="#0066cc" />
                            </TouchableOpacity>
                        )}
                    </View>
                )}
            </ScrollView>

            {/* 일정 선택 모달 */}
            <Modal
                visible={showScheduleModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowScheduleModal(false)}
            >
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowScheduleModal(false)}
                >
                    <View style={styles.modalContent} onStartShouldSetResponder={() => true}>
                        <Text style={styles.modalTitle}>일정 선택</Text>
                        <ScrollView style={styles.scheduleList}>
                            {schedules.length > 0 ? (
                                schedules.map((schedule) => (
                                    <TouchableOpacity
                                        key={schedule._id}
                                        style={[
                                            styles.scheduleItem,
                                            selectedSchedule?._id === schedule._id && styles.selectedScheduleItem
                                        ]}
                                        onPress={() => handleScheduleSelect(schedule)}
                                    >
                                        <View style={styles.scheduleItemHeader}>
                                            <Text style={styles.scheduleItemTitle}>{schedule.title}</Text>
                                            {selectedSchedule?._id === schedule._id && (
                                                <Ionicons name="checkmark-circle" size={24} color="#7fe0faff" />
                                            )}
                                        </View>
                                        <Text style={styles.scheduleItemLocation}>
                                            <Ionicons name="location-outline" size={14} color="#666" />
                                            {' '}{schedule.destinationLocation}
                                        </Text>
                                        <Text style={styles.scheduleItemTime}>
                                            <Ionicons name="time-outline" size={14} color="#666" />
                                            {' '}{schedule.date.split('T')[0]} {schedule.startTime}
                                        </Text>
                                    </TouchableOpacity>
                                ))
                            ) : (
                                <Text style={styles.emptyScheduleText}>등록된 일정이 없습니다.</Text>
                            )}
                        </ScrollView>
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setShowScheduleModal(false)}
                        >
                            <Text style={styles.closeButtonText}>닫기</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            <Btm_nav_bar />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    contentContainer: {
        paddingBottom: 100,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    titleContainer: {
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 10,
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#000',
    },
    scheduleSelectContainer: {
        padding: 20,
        paddingTop: 10,
    },
    scheduleSelector: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 12,
        gap: 8,
    },
    scheduleSelectorText: {
        fontSize: 16,
        color: '#666',
        flex: 1,
    },
    categoryContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 20,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        gap: 8,
    },
    categoryButtonActive: {
        backgroundColor: '#E8E8E8',
    },
    categoryText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
    placesList: {
        paddingHorizontal: 20,
        gap: 20,
    },
    placeCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    placeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    placeInfo: {
        flex: 1,
        gap: 4,
    },
    placeName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    placeCategory: {
        fontSize: 12,
        color: '#999',
    },
    placeLocationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    placeAddress: {
        fontSize: 13,
        color: '#666',
        flex: 1,
    },
    placePhoneRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
    },
    placePhone: {
        fontSize: 13,
        color: '#666',
    },
    distanceBadge: {
        backgroundColor: '#e8f5ff',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    distanceText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#1890ff',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: '#f0f0f0',
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f8ff',
        paddingVertical: 10,
        borderRadius: 8,
        gap: 6,
        borderWidth: 1,
        borderColor: '#b3d9ff',
    },
    actionButtonText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#0066cc',
    },
    emptyContainer: {
        padding: 40,
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        color: '#999',
    },
    loadMoreButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f0f8ff',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        marginTop: 10,
        marginBottom: 20,
        gap: 6,
        borderWidth: 1,
        borderColor: '#b3d9ff',
    },
    loadMoreText: {
        fontSize: 15,
        fontWeight: '600',
        color: '#0066cc',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '85%',
        maxHeight: '70%',
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 16,
    },
    scheduleList: {
        maxHeight: 400,
    },
    scheduleItem: {
        padding: 16,
        backgroundColor: '#f9f9f9',
        borderRadius: 12,
        marginBottom: 12,
    },
    selectedScheduleItem: {
        backgroundColor: '#e6f7ff',
        borderWidth: 2,
        borderColor: '#7fe0faff',
    },
    scheduleItemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    scheduleItemTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        flex: 1,
    },
    scheduleItemLocation: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    scheduleItemTime: {
        fontSize: 14,
        color: '#666',
    },
    emptyScheduleText: {
        textAlign: 'center',
        fontSize: 16,
        color: '#999',
        paddingVertical: 40,
    },
    emptyScheduleContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
        paddingBottom: 100,
    },
    emptyScheduleTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginTop: 20,
        marginBottom: 12,
    },
    emptyScheduleDescription: {
        fontSize: 15,
        color: '#999',
        textAlign: 'center',
        lineHeight: 22,
    },
    closeButton: {
        marginTop: 16,
        backgroundColor: '#7fe0faff',
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#000',
    },
});

export default Recommend;
