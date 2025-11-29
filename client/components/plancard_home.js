import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

const Plancard_Home = ({ time, title, location, isPast }) => {
    return (

        <View style={styles.cardContainer}>
            <View style={styles.solidBackground}>
                <View style={styles.content}>
                    <View style={styles.timeSection}>
                        <Ionicons name="time-outline" size={24} color="#000" />
                        <Text style={styles.timeText}>{time}</Text>
                    </View>
                    <View style={styles.textSection}>
                        <Text style={styles.titleText}>{title}</Text>
                        <View style={styles.locationContainer}>
                            <Ionicons name="location-outline" size={16} color='rgba(0, 0, 0, 0.5)' />
                            <Text style={styles.locationText}>{location}</Text>
                        </View>
                    </View>
                </View>
                {isPast && (
                    <View style={styles.completedOverlay}>
                        <Ionicons name="checkmark-circle" size={80} color="rgba(255, 255, 255, 0.4)" />
                    </View>
                )}
            </View>
        </View >
    );
};

const styles = StyleSheet.create({
    cardContainer: {
        width: 350,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 5,
    },
    solidBackground: {
        padding: 20,
        backgroundColor: '#7fe0faff',
        position: 'relative',
    },
    content: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    timeSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 20,
    },
    textSection: {
        justifyContent: 'center',
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 5,
    },
    timeText: { fontSize: 20, marginLeft: 5 },
    titleText: { fontSize: 22, fontWeight: 'bold' },
    locationText: { color: 'rgba(0, 0, 0, 0.8)', fontSize: 14, marginLeft: 5 },
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
});

export default Plancard_Home;