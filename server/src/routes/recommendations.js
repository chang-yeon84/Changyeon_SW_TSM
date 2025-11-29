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

        if (!latitude || !longitude || !category) {
            return res.status(400).json({
                success: false,
                message: '위도, 경도, 카테고리가 필요합니다.'
            });
        }

        const keyword = CATEGORY_KEYWORDS[category] || category;

        // 카카오 로컬 API 호출
        const response = await axios.get(
            'https://dapi.kakao.com/v2/local/search/keyword.json',
            {
                params: {
                    query: keyword,
                    x: longitude,
                    y: latitude,
                    radius: 2000, // 2km 반경
                    size: parseInt(size),
                    sort: 'distance' // 거리순 정렬
                },
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
            distance: parseInt(place.distance), // 미터 단위
            placeUrl: place.place_url
        }));

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
