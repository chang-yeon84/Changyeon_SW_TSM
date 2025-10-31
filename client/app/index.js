import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View, Alert, Linking, Platform } from 'react-native';
import { useState, useEffect } from 'react';
import Btnlogin from '../components/btnlogin';

// 환경에 따라 다른 API URL 사용
const API_URL = Platform.OS === 'web'
  ? 'http://localhost:5000'  // 웹
  : 'http://192.168.0.4:5000';  // 안드로이드 에뮬레이터

const NAVER_CLIENT_ID = 'dt3_A23sqxNziHXwpdkq';

const LoginScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', handleOpenURL);

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleOpenURL({ url });
      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  const handleOpenURL = async ({ url }) => {
    console.log('받은 URL:', url);

    // Deep Link에서 사용자 정보 받기
    if (url && url.includes('auth/callback')) {
      const urlObj = new URL(url);
      const userId = urlObj.searchParams.get('userId');
      const accessToken = urlObj.searchParams.get('accessToken');
      const name = urlObj.searchParams.get('name');
      const error = urlObj.searchParams.get('error');

      if (error) {
        Alert.alert('오류', '로그인에 실패했습니다.');
      } else if (userId && accessToken) {
        console.log('로그인 성공:', { userId, name });
        router.replace('home');
      }
    }

    //code로 받는 경우
    if (url && url.includes('code=')) {
      const urlObj = new URL(url);
      const code = urlObj.searchParams.get('code');
      const state = urlObj.searchParams.get('state');

      if (code && state) {
        await processNaverLogin(code, state);
      }
    }
  };
  const processNaverLogin = async (code, state) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${API_URL}/api/auth/naver/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code, state })
      });

      const data = await response.json();

      if (data.success) {
        console.log('로그인 성공:', data.user);
        router.replace('home');
      } else {
        Alert.alert('오류', data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error('로그인 처리 에러:', error);
      Alert.alert('오류', '로그인 처리 중 문제가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleNaverLogin = () => {
    const state = Math.random().toString(36).substring(7);

    // 환경에 따라 다른 Callback URL 사용
    const redirectUri = Platform.OS === 'web'
      ? 'http://localhost:5000/api/auth/naver/callback'
      : 'http://192.168.0.4:5000/api/auth/naver/callback';

    const naverUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}`;

    Linking.openURL(naverUrl).catch((err) => {
      console.error('브라우저 열기 실패:', err);
      Alert.alert('오류', '브라우저를 열 수 없습니다.');
    });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Btnlogin onPress={handleNaverLogin} disabled={isLoading} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default LoginScreen;
