import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from "react-native";

const Plancard_List = ({ time, title, location, weather, departureLocation, transport, journeyTime }) => {
    return (
        <View style={styles.cardContainer}>
            <View style={styles.content}>
                <Text style={styles.title}>{title}</Text>
                <View style={styles.mainContent}>
                    <View style={styles.leftSection}>
                        <View style={styles.infoRow}>
                            <Ionicons name="time-outline" size={18} color="#000" />
                            <Text style={styles.infoText}>{time}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Ionicons name="location-outline" size={18} color="#000" />
                            <Text style={styles.departureLocation}>{location}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <Text>☀️</Text>
                            <Text style={styles.infoText}>{weather}</Text>
                        </View>
                    </View>
                    {departureLocation ? (
                        <>
                            <View style={styles.rightSection}>
                                <Text style={styles.tagText}>출발 : {departureLocation}</Text>
                                <Text style={styles.transportIcon}>{transport}</Text>
                            </View>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{journeyTime}</Text>
                            </View>
                        </>
                    ) : null}
                </View>
            </View>
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
    departureLocation: {
        fontSize: 12,
        color: '#000',
    },
    rightSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        marginLeft: 12
    },

    tagText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#000',
    },

    transportIcon: {
        fontSize: 16,
        marginRight: 3
    },

    statusBadge: {
        backgroundColor: '#D4FC79',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        marginRight: 10,
    },

    statusText: {
        fontSize: 12,
        color: '#000',
        fontWeight: '700',
    }
})
export default Plancard_List;
