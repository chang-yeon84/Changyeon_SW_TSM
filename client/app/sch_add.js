import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, TextInput, View, TouchableOpacity, Text, Alert } from "react-native";
import Btm_nav_bar from '../components/btn_btm_nav_bar';
import { useNavigation } from '../contexts/navigationContext';
import { useAuth } from '../contexts/authContext';
import { Ionicons } from '@expo/vector-icons';
import DatePickerModal from '../components/date_picker_modal';
import TimePickerModal from '../components/time_picker_modal';

const sch_add = () => {
    const { setActiveTab } = useNavigation();
    const { user } = useAuth();
    const router = useRouter();

    // 현재 시간을 HH:MM 형식으로 가져오는 함수
    const getCurrentTime = () => {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    const [text, setText] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [startTime, setStartTime] = useState(getCurrentTime());
    const [endTime, setEndTime] = useState(getCurrentTime());
    const [departureLocation, setDepartureLocation] = useState('');
    const [location, setLocation] = useState('');
    const [memo, setMemo] = useState('');

    // 모달 상태
    const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
    const [isStartTimePickerVisible, setIsStartTimePickerVisible] = useState(false);
    const [isEndTimePickerVisible, setIsEndTimePickerVisible] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setActiveTab();
        }, [])
    );

    // 날짜 포맷팅 함수
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}.${month}.${day}`;
    };

    // 날짜 확인 핸들러
    const handleDateConfirm = (date) => {
        setSelectedDate(date);
    };

    // 시작 시간 확인 핸들러
    const handleStartTimeConfirm = (time) => {
        setStartTime(time);
    };

    // 종료 시간 확인 핸들러
    const handleEndTimeConfirm = (time) => {
        setEndTime(time);
    };

    // 저장 버튼 핸들러
    const handleSave = async () => {
        // 필수 필드 검증
        if (!text.trim()) {
            Alert.alert('알림', '제목을 입력해주세요.');
            return;
        }

        try {
            setIsSaving(true);

            // Context에서 userId 가져오기
            const userId = user.userId;

            if (!userId) {
                Alert.alert('오류', '로그인이 필요합니다.');
                router.push('/');
                return;
            }

            // 일정 데이터 준비
            const scheduleData = {
                userId,
                title: text,
                date: selectedDate.toISOString(),
                startTime,
                endTime,
                departureLocation: departureLocation || '',
                destinationLocation: location || '',
                memo: memo || '',
            };

            // API 호출
            const response = await fetch('http://192.168.0.4:5000/api/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(scheduleData),
            });

            const result = await response.json();

            if (result.success) {
                Alert.alert('성공', '일정이 저장되었습니다.', [
                    {
                        text: '확인',
                        onPress: () => router.push('/sch_list'),
                    },
                ]);
            } else {
                Alert.alert('오류', result.message || '일정 저장에 실패했습니다.');
            }
        } catch (error) {
            console.error('일정 저장 에러:', error);
            Alert.alert('오류', '일정 저장 중 오류가 발생했습니다.');
        } finally {
            setIsSaving(false);
        }
    };
    return (
        <View style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            <View style={styles.topWhiteBox}>
                <TextInput style={styles.inputTitle}
                    value={text}
                    onChangeText={setText}
                    placeholder="제목"
                    placeholderTextColor="#C7C7C7"
                />
                <View style={styles.dateTimeContainer}>
                    {/* 날짜 선택 */}
                    <TouchableOpacity
                        style={styles.dateTimeRow}
                        onPress={() => setIsDatePickerVisible(true)}
                    >
                        <View style={styles.labelContainer}>
                            <Ionicons name="calendar-outline" size={23} color="#000000ff" />
                            <Text style={styles.labelText}>날짜</Text>
                        </View>
                        <Text style={styles.valueText}>{formatDate(selectedDate)}</Text>
                    </TouchableOpacity>

                    {/* 시작 시간 선택 */}
                    <TouchableOpacity
                        style={styles.dateTimeRow}
                        onPress={() => setIsStartTimePickerVisible(true)}
                    >
                        <View style={styles.labelContainer}>
                            <Ionicons name="time-outline" size={23} color="#00A8FF" />
                            <Text style={styles.labelText}>시작 시간</Text>
                        </View>
                        <Text style={styles.valueText}>{startTime}</Text>
                    </TouchableOpacity>

                    {/* 종료 시간 선택 */}
                    <TouchableOpacity
                        style={styles.dateTimeRow}
                        onPress={() => setIsEndTimePickerVisible(true)}
                    >
                        <View style={styles.labelContainer}>
                            <Ionicons name="time-outline" size={23} color="#FF4757" />
                            <Text style={styles.labelText}>종료 시간</Text>
                        </View>
                        <Text style={styles.valueText}>{endTime}</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={styles.middleWhiteBox}>
                <View style={styles.inputRow}>
                    <Ionicons name="location-sharp" size={24} color="#00A8FF" style={styles.iconStyleBlue} />
                    <TextInput style={styles.inputDepartureLocation}
                        value={departureLocation}
                        onChangeText={setDepartureLocation}
                        placeholder="출발지"
                        placeholderTextColor="#C7C7C7"
                    ></TextInput>
                </View>
                <View style={styles.dotLine}>
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                    <View style={styles.dot} />
                </View>
                <View style={styles.inputRow}>
                    <Ionicons name="location-sharp" size={24} color="#FF4757" style={styles.iconStyleRed} />
                    <TextInput style={styles.inputLocation}
                        value={location}
                        onChangeText={setLocation}
                        placeholder="도착지"
                        placeholderTextColor="#C7C7C7"
                    ></TextInput>
                </View>
            </View>
            <View style={styles.bottomWhiteBox}>
                <TextInput style={styles.inputMemo}
                    value={memo}
                    onChangeText={setMemo}
                    placeholder="메모"
                    placeholderTextColor="#C7C7C7"
                />
            </View>

            {/* 저장 버튼 */}
            <TouchableOpacity
                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={isSaving}
            >
                <Text style={styles.saveButtonText}>{isSaving ? '저장 중...' : '저장'}</Text>
            </TouchableOpacity>

            {/* 날짜 선택 모달 */}
            <DatePickerModal
                visible={isDatePickerVisible}
                onClose={() => setIsDatePickerVisible(false)}
                initialDate={selectedDate}
                onConfirm={handleDateConfirm}
            />

            {/* 시작 시간 선택 모달 */}
            <TimePickerModal
                visible={isStartTimePickerVisible}
                onClose={() => setIsStartTimePickerVisible(false)}
                initialTime={startTime}
                onConfirm={handleStartTimeConfirm}
                title="시작 시간 선택"
            />

            {/* 종료 시간 선택 모달 */}
            <TimePickerModal
                visible={isEndTimePickerVisible}
                onClose={() => setIsEndTimePickerVisible(false)}
                initialTime={endTime}
                onConfirm={handleEndTimeConfirm}
                title="종료 시간 선택"
            />

            <Btm_nav_bar />
        </View>

    )
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        gap: 10,
    },
    topWhiteBox: {
        width: 392,
        height: 270,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        marginTop: 50,
    },
    inputTitle: {
        fontSize: 45,
        color: '#000',
        paddingVertical: 16,
        borderBottomWidth: 2,
        borderBottomColor: '#E5E5E5',
        fontWeight: 'bold',
        marginLeft: 20,
        marginRight: 10,
    },
    dateTimeContainer: {
        flexDirection: 'column',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 10,
        gap: 0,
    },
    dateTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    labelContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    labelText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '500',
    },
    valueText: {
        fontSize: 18,
        color: '#666',
        fontWeight: 'bold',
        backgroundColor: '#F8F8F8',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        minWidth: 120,
        textAlign: 'center',
    },
    middleWhiteBox: {
        width: 392,
        height: 115,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,

    },
    inputRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginLeft: 15,
    },
    inputDepartureLocation: {
        flex: 1,
        fontSize: 20,
        color: '#000',
        marginBottom: 3,
        borderBottomWidth: 2,
        borderBottomColor: '#E5E5E5',
        fontWeight: '500',
        marginLeft: 15,
        marginRight: 10,
        paddingBottom: 15,

    },
    inputLocation: {
        flex: 1,
        fontSize: 20,
        color: '#000',
        fontWeight: '500',
        marginLeft: 15,
        marginRight: 10,
        marginTop: -25
    },
    dotLine: {
        flexDirection: 'column',
        marginVertical: 1,
        marginLeft: 25,
        top: -15,

    },
    dot: {
        width: 4,
        height: 4,
        borderRadius: 2,
        backgroundColor: '#C7C7C7',
        marginVertical: 2,
    },
    iconStyleBlue: {
        marginTop: 15,
    },
    iconStyleRed: {
        marginTop: -10,
    },
    bottomWhiteBox: {
        width: 392,
        height: 180,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    inputMemo: {
        fontSize: 30,
        color: '#000',
        fontWeight: 'bold',
        marginLeft: 20,
        marginRight: 10,
    },
    saveButton: {
        width: 392,
        height: 56,
        backgroundColor: '#00A8FF',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 100,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
    },
    saveButtonText: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    saveButtonDisabled: {
        backgroundColor: '#B0B0B0',
        opacity: 0.6,
    }
});
export default sch_add