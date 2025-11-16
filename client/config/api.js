// API 서버 설정 
const API_CONFIG = {
    BASE_URL: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.0.17:5000',
};

// API 엔드포인트
export const API_ENDPOINTS = {
    // 로그인 
    AUTH: `${API_CONFIG.BASE_URL}/auth`,
    CALLBACK: `${API_CONFIG.BASE_URL}/auth/callback`,

    // 일정 관련
    SCHEDULES: `${API_CONFIG.BASE_URL}/api/schedules`,
};

export default API_CONFIG;