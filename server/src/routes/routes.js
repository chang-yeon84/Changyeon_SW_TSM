const express = require('express');
const router = express.Router();
const axios = require('axios');
const RouteCache = require('../models/routeCache');

// 경로 키 생성 함수 (좌표를 반올림하여 근접한 위치는 같은 키 사용)
const generateRouteKey = (originX, originY, destX, destY, transportType) => {
    // 좌표를 소수점 4자리로 반올림 (약 11m 정확도)
    const ox = Math.round(originX * 10000) / 10000;
    const oy = Math.round(originY * 10000) / 10000;
    const dx = Math.round(destX * 10000) / 10000;
    const dy = Math.round(destY * 10000) / 10000;

    return `${ox},${oy}_${dx},${dy}_${transportType}`;
};

// 대중교통 경로 조회
router.get('/transit', async (req, res) => {
    try {
        const { startX, startY, endX, endY } = req.query;

        if (!startX || !startY || !endX || !endY) {
            return res.status(400).json({
                success: false,
                message: '출발지와 도착지 좌표가 필요합니다.'
            });
        }

        // 경로 키 생성
        const routeKey = generateRouteKey(
            parseFloat(startX),
            parseFloat(startY),
            parseFloat(endX),
            parseFloat(endY),
            'TRANSIT'
        );

        // 캐시 확인
        let cachedRoute = await RouteCache.findOne({ routeKey, transportType: 'TRANSIT' });

        if (cachedRoute) {
            console.log('캐시에서 대중교통 경로 반환:', routeKey);
            return res.json({
                success: true,
                data: cachedRoute.routeData,
                cached: true
            });
        }

        // 캐시가 없으면 Tmap API 호출
        console.log('Tmap API 호출 - 대중교통:', routeKey);

        const tmapResponse = await axios.post(
            'https://apis.openapi.sk.com/transit/routes',
            {
                startX: parseFloat(startX),
                startY: parseFloat(startY),
                endX: parseFloat(endX),
                endY: parseFloat(endY),
                count: 1
            },
            {
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'appKey': process.env.TMAP_API_KEY
                }
            }
        );

        // API 응답 저장
        const routeData = tmapResponse.data;

        // 디버깅: 응답 구조 확인
        console.log('대중교통 API 응답 구조:', JSON.stringify(routeData).substring(0, 500));

        // 캐시에 저장
        await RouteCache.create({
            routeKey,
            transportType: 'TRANSIT',
            origin: { x: parseFloat(startX), y: parseFloat(startY) },
            destination: { x: parseFloat(endX), y: parseFloat(endY) },
            routeData
        });

        console.log('대중교통 경로 캐시 저장 완료:', routeKey);

        res.json({
            success: true,
            data: routeData,
            cached: false
        });

    } catch (error) {
        console.error('대중교통 경로 조회 에러:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: '대중교통 경로를 불러올 수 없습니다.',
            error: error.response?.data || error.message
        });
    }
});

// 도보 경로 조회
router.get('/walk', async (req, res) => {
    try {
        const { startX, startY, endX, endY } = req.query;

        if (!startX || !startY || !endX || !endY) {
            return res.status(400).json({
                success: false,
                message: '출발지와 도착지 좌표가 필요합니다.'
            });
        }

        // 경로 키 생성
        const routeKey = generateRouteKey(
            parseFloat(startX),
            parseFloat(startY),
            parseFloat(endX),
            parseFloat(endY),
            'WALK'
        );

        // 캐시 확인
        let cachedRoute = await RouteCache.findOne({ routeKey, transportType: 'WALK' });

        if (cachedRoute) {
            console.log('캐시에서 도보 경로 반환:', routeKey);
            return res.json({
                success: true,
                data: cachedRoute.routeData,
                cached: true
            });
        }

        // 캐시가 없으면 Tmap API 호출
        console.log('Tmap API 호출 - 도보:', routeKey);

        const tmapResponse = await axios.post(
            'https://apis.openapi.sk.com/tmap/routes/pedestrian?version=1',
            {
                startX: parseFloat(startX),
                startY: parseFloat(startY),
                endX: parseFloat(endX),
                endY: parseFloat(endY),
                reqCoordType: 'WGS84GEO',
                resCoordType: 'WGS84GEO',
                startName: '출발지',
                endName: '도착지'
            },
            {
                headers: {
                    'accept': 'application/json',
                    'content-type': 'application/json',
                    'appKey': process.env.TMAP_API_KEY
                }
            }
        );

        // API 응답 저장
        const routeData = tmapResponse.data;

        // 캐시에 저장
        await RouteCache.create({
            routeKey,
            transportType: 'WALK',
            origin: { x: parseFloat(startX), y: parseFloat(startY) },
            destination: { x: parseFloat(endX), y: parseFloat(endY) },
            routeData
        });

        console.log('도보 경로 캐시 저장 완료:', routeKey);

        res.json({
            success: true,
            data: routeData,
            cached: false
        });

    } catch (error) {
        console.error('도보 경로 조회 에러:', error.response?.data || error.message);
        res.status(500).json({
            success: false,
            message: '도보 경로를 불러올 수 없습니다.',
            error: error.response?.data || error.message
        });
    }
});

module.exports = router;
