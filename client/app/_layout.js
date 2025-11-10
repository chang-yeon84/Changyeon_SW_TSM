import { Stack, useRouter } from "expo-router";
import { NavigationProvider } from '../contexts/navigationContext';
import { AuthProvider, useAuth } from '../contexts/authContext';
import { useEffect } from 'react';
import { Linking, Alert } from 'react-native';

function RootLayoutContent() {
  const router = useRouter();
  const { login } = useAuth();

  useEffect(() => {
    // Deep Link 리스너 (전역)
    const subscription = Linking.addEventListener('url', handleDeepLink);

    // 앱 시작 시 초기 URL 확인
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async ({ url }) => {
    console.log('[RootLayout] Deep Link 받음:', url);

    if (url && url.startsWith('tsmapp://')) {
      const urlObj = new URL(url);
      const userId = urlObj.searchParams.get('userId');
      const accessToken = urlObj.searchParams.get('accessToken');
      const name = urlObj.searchParams.get('name');
      const callback = urlObj.searchParams.get('callback');
      const error = urlObj.searchParams.get('error');

      // 로그인 콜백인 경우
      if (callback === 'true') {
        if (error) {
          Alert.alert('오류', '로그인에 실패했습니다.');
          router.replace('/');
        } else if (userId && accessToken) {
          console.log('[RootLayout] 로그인 성공:', { userId, name });

          // Context에 사용자 정보 저장
          login(userId, accessToken, name || '사용자');

          // Alert 후 home으로 이동
          setTimeout(() => {
            Alert.alert('환영합니다!', `${name || '사용자'}님, 로그인되었습니다.`, [
              {
                text: '확인',
                onPress: () => {
                  router.replace('/home');
                }
              }
            ]);
          }, 100);
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
      <Stack.Screen name="recom" />
      <Stack.Screen name="profile" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <NavigationProvider>
        <RootLayoutContent />
      </NavigationProvider>
    </AuthProvider>
  );
}
