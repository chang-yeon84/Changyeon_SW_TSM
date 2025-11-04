import { Stack, useRouter } from 'expo-router';
import { StyleSheet, View, Alert, Linking } from 'react-native';
import { useState, useEffect } from 'react';
import Btnlogin from '../components/btnlogin';

const API_URL = 'http://192.168.0.4:5000';
const NAVER_CLIENT_ID = 'dt3_A23sqxNziHXwpdkq';
const REDIRECT_URI = 'http://192.168.0.4:5000/api/auth/naver/callback';

const LoginScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Deep Link 리스너
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
        // TODO: AsyncStorage에 사용자 정보 저장
        router.replace('home');
      }
    }
  };

  const handleNaverLogin = () => {
    const state = Math.random().toString(36).substring(7);
    const naverUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;

    // 외부 브라우저에서 네이버 로그인
    Linking.openURL(naverUrl);
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