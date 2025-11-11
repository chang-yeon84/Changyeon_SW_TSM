// API 서버 설정 
const API_CONFIG = {
    //여기 부분 ip 주소 본인 ipv4 로 수정하기 :5000 뒤에 포트는 남기고 
    BASE_URL: 'http://192.168.0.4:5000',
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
