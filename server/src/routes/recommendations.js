// v2 - KA Header added
const express = require('express');
const router = express.Router();
const axios = require('axios');

// 카테고리별 키워드 매핑
const CATEGORY_KEYWORDS = {
    restaurant: '맛집',
    cafe: '카페',
    attraction: '관광명소'
};

// 주변 장소 추천 조회
router.get('/nearby', async (req, res) => {
    try {
        const { latitude, longitude, category, size = 3 } = req.query;

        console.log('추천 요청 받음:', { latitude, longitude, category, size });

        if (!latitude || !longitude || !category) {
            return res.status(400).json({
                success: false,
                message: '위도, 경도, 카테고리가 필요합니다.'
            });
        }

        const keyword = CATEGORY_KEYWORDS[category] || category;
        const requestedSize = parseInt(size);
        console.log('검색 키워드:', keyword, '요청 개수:', requestedSize);
        console.log('KA 헤더 사용 중');

        // Kakao API는 최대 15개까지만 반환하므로, 15개로 제한
        // 식당 카테고리는 카페 필터링 때문에 항상 최대로 요청
        const apiSize = category === 'restaurant' ? 15 : Math.min(requestedSize, 15);

        // 반경을 늘려서 더 많은 결과 확보 (requestedSize가 클수록 반경 증가)
        const radius = requestedSize > 6 ? 5000 : requestedSize > 3 ? 3000 : 2000;

        // 카카오 로컬 API 호출
        const response = await axios.get(
            'https://dapi.kakao.com/v2/local/search/keyword.json',
            {
                params: {
                    query: keyword,
                    x: longitude,
                    y: latitude,
                    radius: radius,
                    size: apiSize,
                    sort: 'distance' // 거리순 정렬
                },
                headers: {
                    'Authorization': `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
                }
            }
        );

        console.log('카카오 API 응답:', response.data.documents.length, '개 장소 찾음 (반경:', radius, 'm)');

        // 장소 데이터 매핑 및 필터링
        let places = response.data.documents.map(place => ({
            id: place.id,
            name: place.place_name,
            category: place.category_name,
            address: place.road_address_name || place.address_name,
            phone: place.phone || '-',
            coordinates: {
                x: parseFloat(place.x),
                y: parseFloat(place.y)
            },
            distance: parseInt(place.distance),
            placeUrl: place.place_url
        }));

        // 식당 카테고리일 경우 카페 제외 후 요청한 개수만큼만 반환
        if (category === 'restaurant') {
            const filtered = places.filter(place =>
                !place.category.includes('카페') &&
                !place.category.includes('cafe') &&
                !place.category.includes('Cafe')
            );
            console.log('카페 필터링 후:', filtered.length, '개 (요청:', requestedSize, '개)');
            places = filtered.slice(0, requestedSize);
        } else {
            places = places.slice(0, requestedSize);
        }

        res.json({
            success: true,
            data: places,
            count: places.length
        });

    } catch (error) {
        console.error('장소 추천 조회 에러:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: '장소 추천을 불러올 수 없습니다.',
            error: error.response?.data || error.message
        });
    }
});

// 특정 키워드로 장소 검색
router.get('/search', async (req, res) => {
    try {
        const { keyword, latitude, longitude, size = 15 } = req.query;

        if (!keyword) {
            return res.status(400).json({
                success: false,
                message: '검색 키워드가 필요합니다.'
            });
        }

        const params = {
            query: keyword,
            size: parseInt(size)
        };

        // 위치 정보가 있으면 추가
        if (latitude && longitude) {
            params.x = longitude;
            params.y = latitude;
            params.radius = 5000; // 5km 반경
            params.sort = 'distance';
        }

        // 카카오 로컬 API 호출
        const response = await axios.get(
            'https://dapi.kakao.com/v2/local/search/keyword.json',
            {
                params,
                headers: {
                    'Authorization': `KakaoAK ${process.env.KAKAO_REST_API_KEY}`
                }
            }
        );

        const places = response.data.documents.map(place => ({
            id: place.id,
            name: place.place_name,
            category: place.category_name,
            address: place.road_address_name || place.address_name,
            phone: place.phone || '-',
            coordinates: {
                x: parseFloat(place.x),
                y: parseFloat(place.y)
            },
            distance: place.distance ? parseInt(place.distance) : null,
            placeUrl: place.place_url
        }));

        res.json({
            success: true,
            data: places,
            count: places.length
        });

    } catch (error) {
        console.error('장소 검색 에러:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: '장소 검색을 수행할 수 없습니다.',
            error: error.response?.data || error.message
        });
    }
});

module.exports = router;
