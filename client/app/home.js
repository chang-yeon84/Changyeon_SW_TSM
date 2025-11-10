import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Btm_nav_bar from '../components/btn_btm_nav_bar';
import BtnSch_List from '../components/btnsch_list';
import Plancard_Home from "../components/plancard_home";
import { useNavigation } from '../contexts/navigationContext';
import { useAuth } from '../contexts/authContext';

const home = () => {
    const router = useRouter();
    const { setActiveTab } = useNavigation();
    const { user } = useAuth();

    console.log('[home] 렌더링 시 user 상태:', user);

    useFocusEffect(
        useCallback(() => {
            setActiveTab('home');
            console.log('[home] useFocusEffect - user 상태:', user);
        }, [])
    );
    return (

        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            < View style={styles.whiteBox}>
                < Text style={styles.header}>오늘의 일정</Text>


                < Text style={styles.subHeader}>
                    <Text style={styles.planCount}>3</Text> 개의 일정이 있습니다.
                </Text>

                <View style={styles.buttonContainer}>
                    <BtnSch_List
                        onPress={() => router.push('sch_list')}
                    />
                </View>
                <View style={styles.allPlanSections}>
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: "/sch_detail", params: { id: 0 } })}
                        activeOpacity={1}
                    >
                        <View style={styles.planSection1}>
                            <Plancard_Home
                                time="09:00"
                                title="아침 운동"
                                location="뚝섬 한강 공원"
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.push({ pathname: "/sch_detail", params: { id: 1 } })}
                        activeOpacity={1}
                    >
                        <View style={styles.planSection2}>
                            <Plancard_Home
                                time="12:00"
                                title="점심 약속"
                                location="밀플랜비 인하대점"
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => router.replace({ pathname: "/sch_detail", params: { id: 2 } })}
                    >
                        <View style={styles.planSection3}>
                            <Plancard_Home
                                time="17:00"
                                title="아르바이트"
                                location="인하대병원"
                            />
                        </View>
                    </TouchableOpacity>
                </View>
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
        marginTop: 50

    },
    header: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#000',
        justifyContent: 'flex-start',
        marginLeft: 20,
        marginTop: 20

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
    allPlanSections: {
        alignItems: 'center',
        marginTop: 20,
    },
    planSection1: {
        marginBottom: 10,

    },
    planSection2: {
        marginBottom: 10,

    },
    planSection3: {
        marginBottom: 10,

    },
    buttonContainer: {
        position: 'absolute',
        top: 30,
        right: 30,
    },
});

export default home;