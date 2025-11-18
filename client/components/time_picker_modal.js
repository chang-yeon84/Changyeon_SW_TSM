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
 * 모달 팝업 형태의 시간 선택 컴포넌트
 */
const TimePickerModal = ({ visible, onClose, initialTime = '09:00', onConfirm, title = '시간 선택' }) => {
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  const [selectedHour, setSelectedHour] = useState(initialTime.split(':')[0]);
  const [selectedMinute, setSelectedMinute] = useState(initialTime.split(':')[1]);

  const hourScrollRef = useRef(null);
  const minuteScrollRef = useRef(null);

  // initialTime이 변경되면 state 업데이트
  useEffect(() => {
    if (visible) {
      const [hour, minute] = initialTime.split(':');
      setSelectedHour(hour);
      setSelectedMinute(minute);
    }
  }, [visible, initialTime]);

  const handleHourScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < hours.length) {
      setSelectedHour(hours[index]);
    }
  };

  const handleMinuteScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    const index = Math.round(offsetY / ITEM_HEIGHT);
    if (index >= 0 && index < minutes.length) {
      setSelectedMinute(minutes[index]);
    }
  };

  const handleConfirm = () => {
    const timeString = `${selectedHour}:${selectedMinute}`;
    console.log('시간 선택 확인:', timeString);
    onConfirm(timeString);
    onClose();
  };

  const handleOpen = () => {
    // 모달이 열릴 때 초기 위치로 스크롤
    setTimeout(() => {
      const [hour, minute] = initialTime.split(':');
      const hourIndex = hours.indexOf(hour);
      const minuteIndex = minutes.indexOf(minute);

      if (hourScrollRef.current && hourIndex >= 0) {
        hourScrollRef.current.scrollTo({
          y: hourIndex * ITEM_HEIGHT,
          animated: false,
        });
      }

      if (minuteScrollRef.current && minuteIndex >= 0) {
        minuteScrollRef.current.scrollTo({
          y: minuteIndex * ITEM_HEIGHT,
          animated: false,
        });
      }
    }, 100);
  };

  const renderPickerItems = (items, selectedValue, onScroll, scrollRef) => (
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
              // 아이템 클릭 시 해당 위치로 스크롤
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
              {item}
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
            <Text style={styles.modalTitle}>{title}</Text>

            <View style={styles.pickerContainer}>
              <View style={styles.selectionIndicator} />
              {renderPickerItems(hours, selectedHour, handleHourScroll, hourScrollRef)}
              <Text style={styles.separator}>:</Text>
              {renderPickerItems(minutes, selectedMinute, handleMinuteScroll, minuteScrollRef)}
            </View>

            <View style={styles.selectedTimeDisplay}>
              <Text style={styles.selectedTimeText}>
                선택된 시간: {selectedHour}:{selectedMinute}
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
    width: Dimensions.get('window').width * 0.85,
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
    left: 20,
    right: 20,
    height: ITEM_HEIGHT,
    backgroundColor: '#00A8FF15',
    borderRadius: 8,
    zIndex: 1,
    borderWidth: 2,
    borderColor: '#00A8FF',
  },
  pickerColumn: {
    width: 60,
    height: ITEM_HEIGHT * VISIBLE_ITEMS,
    zIndex: 2,
  },
  pickerItem: {
    height: ITEM_HEIGHT,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pickerText: {
    fontSize: 20,
    color: '#999',
  },
  selectedText: {
    color: '#00A8FF',
    fontWeight: 'bold',
    fontSize: 24,
  },
  separator: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginHorizontal: 10,
    zIndex: 2,
  },
  selectedTimeDisplay: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    alignItems: 'center',
  },
  selectedTimeText: {
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

export default TimePickerModal;
