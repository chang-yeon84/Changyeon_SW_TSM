import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;

/**
 * 모달 팝업 형태의 날짜 선택 컴포넌트
 */
const DatePickerModal = ({ visible, onClose, initialDate = new Date(), onConfirm }) => {
  const [selectedYear, setSelectedYear] = useState(initialDate.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(initialDate.getDate());

  const yearScrollRef = useRef(null);
  const monthScrollRef = useRef(null);
  const dayScrollRef = useRef(null);

  // 년도 배열 (현재 년도 기준 -5년 ~ +5년)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

  // 월 배열 (1-12)
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  // 선택된 년/월에 따른 일 배열
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const days = Array.from(
    { length: getDaysInMonth(selectedYear, selectedMonth) },
    (_, i) => i + 1
  );

  // 월이 변경되면 일자 조정
  useEffect(() => {
    const maxDay = getDaysInMonth(selectedYear, selectedMonth);
    if (selectedDay > maxDay) {
      setSelectedDay(maxDay);
    }
  }, [selectedYear, selectedMonth]);

  const handleYearScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < years.length) {
      setSelectedYear(years[index]);
    }
  };

  const handleMonthScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < months.length) {
      setSelectedMonth(months[index]);
    }
  };

  const handleDayScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < days.length) {
      setSelectedDay(days[index]);
    }
  };

  const handleConfirm = () => {
    const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
    console.log('날짜 선택 확인:', selectedDate);
    onConfirm(selectedDate);
    onClose();
  };

  const handleOpen = () => {
    // 모달이 열릴 때 초기 위치로 스크롤
    setTimeout(() => {
      const date = initialDate;
      const yearIndex = years.indexOf(date.getFullYear());
      const monthIndex = date.getMonth();
      const dayIndex = date.getDate() - 1;

      if (yearScrollRef.current && yearIndex >= 0) {
        yearScrollRef.current.scrollTo({
          y: yearIndex * ITEM_HEIGHT,
          animated: false,
        });
      }

      if (monthScrollRef.current) {
        monthScrollRef.current.scrollTo({
          y: monthIndex * ITEM_HEIGHT,
          animated: false,
        });
      }

      if (dayScrollRef.current) {
        dayScrollRef.current.scrollTo({
          y: dayIndex * ITEM_HEIGHT,
          animated: false,
        });
      }
    }, 100);
  };

  const renderPickerItems = (items, selectedValue, onScroll, scrollRef, suffix = '') => (
    <View style={styles.pickerColumn}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM_HEIGHT}
        snapToAlignment="center"
        decelerationRate="fast"
        onScroll={onScroll}
        scrollEventThrottle={16}
        contentContainerStyle={{
          paddingVertical: ITEM_HEIGHT * 2,
        }}
      >
        {items.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.pickerItem}
            onPress={() => {
              if (scrollRef.current) {
                scrollRef.current.scrollTo({
                  y: index * ITEM_HEIGHT,
                  animated: true,
                });
              }
            }}
          >
            <Text
              style={[
                styles.pickerText,
                item === selectedValue && styles.selectedText,
              ]}
            >
              {item}{suffix}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
      onShow={handleOpen}
    >
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity activeOpacity={1} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>날짜 선택</Text>

            <View style={styles.pickerContainer}>
              <View style={styles.selectionIndicator} />
              {renderPickerItems(years, selectedYear, handleYearScroll, yearScrollRef, '년')}
              {renderPickerItems(months, selectedMonth, handleMonthScroll, monthScrollRef, '월')}
              {renderPickerItems(days, selectedDay, handleDayScroll, dayScrollRef, '일')}
            </View>

            <View style={styles.selectedDateDisplay}>
              <Text style={styles.selectedDateText}>
                선택된 날짜: {selectedYear}년 {selectedMonth}월 {selectedDay}일
              </Text>
            </View>

            <View style={styles.buttonContainer}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 20,
    width: Dimensions.get('window').width * 0.9,
    maxWidth: 400,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    top: ITEM_HEIGHT * 2,
    left: 10,
    right: 10,
    height: ITEM_HEIGHT,
    backgroundColor: '#00A8FF15',
    borderRadius: 8,
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#00A8FF',
  },
  pickerColumn: {
    flex: 1,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    zIndex: 2,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 18,
    color: '#999',
  },
  selectedText: {
    color: '#00A8FF',
    fontWeight: 'bold',
    fontSize: 20,
  },
  selectedDateDisplay: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#00A8FF',
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#E5E5E5',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#00A8FF',
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
});

export default DatePickerModal;
