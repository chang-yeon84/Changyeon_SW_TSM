import { Stack, useRouter } from "expo-router";
import { NavigationProvider } from '../contexts/navigationContext';
import { AuthProvider, useAuth } from '../contexts/authContext';
import { useEffect, useRef } from 'react';
import { Linking, Alert } from 'react-native';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LOGOUT_TIME_KEY = '@tsm_logout_time';
const USED_DEEPLINK_KEY = '@tsm_used_deeplink';
const LOGIN_STATE_KEY = '@tsm_login_state';

function RootLayoutContent() {
  const router = useRouter();
  const { login, user, isLoading } = useAuth();
  const lastLogoutTime = useRef(0);
  const hasProcessedInitialUrl = useRef(false);

  useEffect(() => {
    // Deep Link 리스너 (전역)
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // 앱 시작 시 초기 URL 확인 (한 번만)
    if (!hasProcessedInitialUrl.current) {
      Linking.getInitialURL().then((url) => {
        if (url) {
          console.log('[RootLayout] 초기 URL 확인:', url);
          handleDeepLink({ url });
          hasProcessedInitialUrl.current = true;
        }
      });
    }

    return () => {
      subscription.remove();
    };
  }, []);

  // 로그인 상태에 따른 자동 네비게이션
  useEffect(() => {
    if (isLoading) return; // 로딩 중에는 아무것도 하지 않음

    const currentPath = router.pathname || '/';

    // 로그인된 상태에서 로그인 화면에 있으면 홈으로 이동
    if (user.userId && (currentPath === '/' || currentPath === '/index')) {
      console.log('[RootLayout] 자동 로그인 - 홈 화면으로 이동');
      router.replace('/home');
    }
    // 로그인 안 된 상태에서 다른 화면에 있으면 로그인 화면으로 이동
    else if (!user.userId && currentPath !== '/' && currentPath !== '/index') {
      console.log('[RootLayout] 로그인 필요 - 로그인 화면으로 이동');
      // 로그아웃 시간 기록 (Deep Link 무시를 위해)
      lastLogoutTime.current = Date.now();
      router.replace('/');
    }
  }, [user.userId, isLoading]);

  const handleDeepLink = async ({ url }) => {
    console.log('[RootLayout] Deep Link 받음:', url);

    if (url && url.startsWith('tsmapp://')) {
      const urlObj = new URL(url);
      const userId = urlObj.searchParams.get('userId');
      const accessToken = urlObj.searchParams.get('accessToken');
      const name = urlObj.searchParams.get('name');
      const callback = urlObj.searchParams.get('callback');
      const state = urlObj.searchParams.get('state');
      const error = urlObj.searchParams.get('error');

      // 로그인 콜백인 경우
      if (callback === 'true') {
        // 이미 로그인된 상태면 Deep Link 무시
        if (user.userId) {
          console.log('[RootLayout] 이미 로그인된 상태 - Deep Link 무시');
          return;
        }

        // state 검증: 현재 로그인 세션의 state와 일치하는지 확인
        try {
          const savedState = await AsyncStorage.getItem(LOGIN_STATE_KEY);
          console.log('[RootLayout] state 비교:', { received: state, saved: savedState });

          // state가 없거나 일치하지 않으면 무시 (단, savedState가 있을 때만 검증)
          if (savedState && state && savedState !== state) {
            console.log('[RootLayout] 유효하지 않은 로그인 세션 - Deep Link 무시 (이전 세션)');
            return;
          }
        } catch (error) {
          console.error('[RootLayout] state 확인 에러:', error);
          return;
        }

        if (error) {
          Alert.alert('오류', '로그인에 실패했습니다.');
          await AsyncStorage.removeItem(LOGIN_STATE_KEY); // state 삭제
          router.replace('/');
        } else if (userId && accessToken) {
          console.log('[RootLayout] 로그인 성공:', { userId, name });

          // Context에 사용자 정보 저장 (AsyncStorage 저장 완료 대기)
          await login(userId, accessToken, name || '사용자');

          // 로그인 완료 후 state 삭제 (일회용)
          await AsyncStorage.removeItem(LOGIN_STATE_KEY);
          console.log('[RootLayout] 로그인 완료 - state 삭제');

          // Toast 알림과 함께 home으로 이동
          router.replace('/home');
          setTimeout(() => {
            Toast.show({
              type: 'success',
              text1: '환영합니다!',
              text2: `${name || '사용자'}님, 로그인되었습니다.`,
              position: 'top',
              visibilityTime: 2500,
              topOffset: 60,
            });
          }, 300);
        }
      }
    }
  };

  return (
    <Stack>
      <Stack.Screen name="index" />
      <Stack.Screen name="home" />
      <Stack.Screen name="sch_list" />
      <Stack.Screen name="sch_detail" />
      <Stack.Screen name="recom" options={{ headerShown: false }} />
      <Stack.Screen name="profile" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <RootLayoutContent />
        <Toast />
      </NavigationProvider>
    </AuthProvider>
  );
}
