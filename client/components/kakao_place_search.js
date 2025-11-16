import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Modal,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const KakaoPlaceSearch = ({ visible, onClose, onSelectPlace, placeholder, type }) => {
  const [keyword, setKeyword] = useState('');
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);

  const KAKAO_REST_API_KEY = process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY;

  const searchPlaces = async () => {
    if (!keyword.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(
        `https://dapi.kakao.com/v2/local/search/keyword.json?query=${encodeURIComponent(keyword)}&size=15`,
        {
          headers: {
            Authorization: `KakaoAK ${KAKAO_REST_API_KEY}`,
          },
        }
      );

      const data = await response.json();
      setPlaces(data.documents || []);
    } catch (error) {
      console.error('장소 검색 에러:', error);
      alert('장소 검색에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlace = (place) => {
    onSelectPlace({
      name: place.place_name,
      address: place.address_name || place.road_address_name,
      x: place.x,
      y: place.y,
    });
    setKeyword('');
    setPlaces([]);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{placeholder || '장소 검색'}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.searchContainer}>
            <View style={styles.searchInputContainer}>
              <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="장소명, 주소 검색"
                placeholderTextColor="#999"
                value={keyword}
                onChangeText={setKeyword}
                onSubmitEditing={searchPlaces}
                returnKeyType="search"
                autoFocus
              />
            </View>
            <TouchableOpacity style={styles.searchButton} onPress={searchPlaces}>
              <Text style={styles.searchButtonText}>검색</Text>
            </TouchableOpacity>
          </View>

          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#00A8FF" />
              <Text style={styles.loadingText}>검색 중...</Text>
            </View>
          )}

          <FlatList
            data={places}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.placeItem}
                onPress={() => handleSelectPlace(item)}
                activeOpacity={0.7}
              >
                <View style={styles.placeIconContainer}>
                  <Ionicons 
                    name="location-sharp" 
                    size={24} 
                    color={type === 'departure' ? '#00A8FF' : '#FF4757'} 
                  />
                </View>
                <View style={styles.placeInfo}>
                  <Text style={styles.placeName} numberOfLines={1}>
                    {item.place_name}
                  </Text>
                  <Text style={styles.placeAddress} numberOfLines={1}>
                    {item.road_address_name || item.address_name}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#CCC" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              !loading && keyword ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>검색 결과가 없습니다</Text>
                </View>
              ) : null
            }
          />
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)' },
  modalContent: { flex: 1, backgroundColor: '#F5F5F5', marginTop: 50, borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: 'white', borderTopLeftRadius: 20, borderTopRightRadius: 20, borderBottomWidth: 1, borderBottomColor: '#E0E0E0' },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  closeButton: { padding: 4 },
  searchContainer: { flexDirection: 'row', padding: 16, gap: 10, backgroundColor: 'white' },
  searchInputContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F8F8', borderRadius: 12, paddingHorizontal: 12 },
  searchIcon: { marginRight: 8 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 12, color: '#333' },
  searchButton: { backgroundColor: '#00A8FF', paddingHorizontal: 24, borderRadius: 12, justifyContent: 'center' },
  searchButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 14, color: '#666' },
  placeItem: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  placeIconContainer: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F8F8F8', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  placeInfo: { flex: 1, gap: 4 },
  placeName: { fontSize: 16, fontWeight: '600', color: '#333' },
  placeAddress: { fontSize: 14, color: '#666' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingVertical: 60 },
  emptyText: { fontSize: 16, color: '#999' },
});

export default KakaoPlaceSearch;