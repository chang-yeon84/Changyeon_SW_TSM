const mongoose = require('mongoose');

const routeCacheSchema = new mongoose.Schema({
    // 경로 식별 키 (출발지-도착지 좌표 조합)
    routeKey: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    // 이동 수단 타입 (WALK, TRANSIT)
    transportType: {
        type: String,
        required: true,
        enum: ['WALK', 'TRANSIT']
    },
    // 출발지 좌표
    origin: {
        x: Number,
        y: Number
    },
    // 도착지 좌표
    destination: {
        x: Number,
        y: Number
    },
    // Tmap API 응답 데이터
    routeData: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    // 캐시 생성일
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 604800 // 7일 후 자동 삭제 (TTL index)
    }
});

// 복합 인덱스 생성
routeCacheSchema.index({ routeKey: 1, transportType: 1 });

module.exports = mongoose.model('RouteCache', routeCacheSchema);
