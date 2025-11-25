// API 서버 설정
const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.0.4:5000',
    OPENWEATHER_API_KEY: process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY,
    KAKAO_REST_API_KEY: process.env.EXPO_PUBLIC_KAKAO_REST_API_KEY,
    KAKAO_JS_KEY: process.env.EXPO_PUBLIC_KAKAO_JS_KEY,
};

// API 엔드포인트
export const API_ENDPOINTS = {
    // 로그인
    AUTH: `${API_CONFIG.BASE_URL}/auth`,
    CALLBACK: `${API_CONFIG.BASE_URL}/auth/callback`,
    USER: `${API_CONFIG.BASE_URL}/auth/user`,

    // 일정 관련
    SCHEDULES: `${API_CONFIG.BASE_URL}/api/schedules`,

    // 날씨 API
    WEATHER: 'https://api.openweathermap.org/data/2.5/weather',

    // 경로 API
    ROUTE_TRANSIT: `${API_CONFIG.BASE_URL}/api/routes/transit`,
    ROUTE_WALK: `${API_CONFIG.BASE_URL}/api/routes/walk`,
};

export default API_CONFIG;