import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

const STORAGE_KEY = '@tsm_user_info';
const LOGOUT_TIME_KEY = '@tsm_logout_time';
const USED_DEEPLINK_KEY = '@tsm_used_deeplink';
const LOGIN_STATE_KEY = '@tsm_login_state';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    userId: null,
    accessToken: null,
    userName: null,
  });
  const [isLoading, setIsLoading] = useState(true);

  // 앱 시작 시 저장된 로그인 정보 복원
  useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const savedUser = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          console.log('[AuthContext] 저장된 로그인 정보 복원:', userData);
          setUser(userData);
        } else {
          console.log('[AuthContext] 저장된 로그인 정보 없음');
        }
      } catch (error) {
        console.error('[AuthContext] 로그인 정보 불러오기 실패:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  const login = async (userId, accessToken, userName) => {
    console.log('[AuthContext] login 함수 호출됨:', { userId, accessToken, userName });
    const newUser = { userId, accessToken, userName };

    try {
      // AsyncStorage에 영구 저장
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      console.log('[AuthContext] 로그인 정보 AsyncStorage에 저장 완료');
      setUser(newUser);
    } catch (error) {
      console.error('[AuthContext] 로그인 정보 저장 실패:', error);
      setUser(newUser); // 저장 실패해도 메모리에는 저장
    }
  };

  const logout = async () => {
    console.log('[AuthContext] logout 함수 호출됨 - AsyncStorage 삭제 시작');
    const emptyUser = { userId: null, accessToken: null, userName: null };

    try {
      // AsyncStorage에서 로그인 정보 삭제
      await AsyncStorage.removeItem(STORAGE_KEY);
      console.log('[AuthContext] 사용자 정보 삭제 완료');

      // 로그인 세션 state도 삭제 (혹시 남아있다면)
      await AsyncStorage.removeItem(LOGIN_STATE_KEY);
      console.log('[AuthContext] 로그인 state 삭제 완료');

      // 삭제 확인
      const check = await AsyncStorage.getItem(STORAGE_KEY);
      console.log('[AuthContext] 삭제 후 확인:', check === null ? '삭제 성공' : '삭제 실패');

      setUser(emptyUser);
      console.log('[AuthContext] user 상태 초기화 완료');
    } catch (error) {
      console.error('[AuthContext] 로그인 정보 삭제 실패:', error);
      setUser(emptyUser); // 삭제 실패해도 메모리에서는 제거
    }
  };

  console.log('[AuthContext] 현재 user 상태:', user);

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
