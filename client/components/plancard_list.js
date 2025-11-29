import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from "react-native";

const Plancard_List = ({ time, title, location, weather, journeyTime, transportType, isPast }) => {
    // 날씨 정보에 따른 아이콘 반환
    const getWeatherIcon = () => {
        if (!weather || weather === '정보 없음') return null;

        const weatherLower = weather.toLowerCase();
        if (weatherLower.includes('맑음') || weatherLower.includes('clear')) {
            return '☀️';
        } else if (weatherLower.includes('구름') || weatherLower.includes('cloud')) {
            return '☁️';
        } else if (weatherLower.includes('비') || weatherLower.includes('rain')) {
            return '🌧️';
        } else if (weatherLower.includes('눈') || weatherLower.includes('snow')) {
            return '❄️';
        } else if (weatherLower.includes('흐림')) {
            return '☁️';
        }
        return '☀️';
    };

    // 교통수단 아이콘 반환
    const getTransportIcon = () => {
        if (!transportType) return null;

        if (transportType === 'walk') {
            return <Ionicons name="walk" size={16} color="#000" />;
        } else if (transportType === 'transit') {
            return <Ionicons name="bus" size={16} color="#000" />;
        }
        return null;
    };

    return (
        <View style={styles.cardContainer}>
            <View style={styles.content}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <View style={styles.mainContent}>
                    <View style={styles.leftSection}>
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={18} color="#000" />
                            <Text style={styles.infoText}>{time}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={18} color="#000" />
                            <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
                        </View>
                        {weather && weather !== '정보 없음' && (
                            <View style={styles.infoRow}>
                                <Text style={styles.weatherIcon}>{getWeatherIcon()}</Text>
                                <Text style={styles.weatherText} numberOfLines={1}>{weather}</Text>
                            </View>
                        )}
                    </View>
                    {journeyTime && journeyTime !== '-' && (
                        <View style={styles.statusBadge}>
                            {getTransportIcon()}
                            <Text style={styles.statusText}>{journeyTime}</Text>
                        </View>
                    )}
                </View>
            </View>
            {isPast && (
                <View style={styles.completedOverlay}>
                    <Ionicons name="checkmark-circle" size={80} color="rgba(255, 255, 255, 0.4)" />
                </View>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    cardContainer: {
        width: 360,
        minHeight: 125,
        backgroundColor: '#7fe0faff',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        paddingVertical: 5,
        position: 'relative',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        textAlign: 'center',
        marginBottom: 8,
        marginTop: 5,
    },
    mainContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: 15
    },
    leftSection: {
        flex: 1,
        gap: 1,
    },
    rightSection: {
        alignItems: 'flex-end',
        justifyContent: 'flex-end',
        marginRight: 10,
    },
    rightRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginLeft: 10
    },
    infoText: {
        fontSize: 15,
        color: '#000',
    },
    locationText: {
        fontSize: 15,
        color: '#000',
        flex: 1,
    },
    weatherIcon: {
        fontSize: 16,
    },
    weatherText: {
        fontSize: 12,
        color: '#000',
        flex: 1,
    },
    departureText: {
        fontSize: 12,
        color: '#000',
        fontWeight: '600',
        maxWidth: 120,
    },
    statusBadge: {
        backgroundColor: '#D4FC79',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        marginRight: 10,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },

    statusText: {
        fontSize: 12,
        color: '#000',
        fontWeight: '700',
    },
    completedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(200, 200, 200, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 16,
    },
})
export default Plancard_List;
