import { Stack, useRouter } from 'expo-router';
import { Image, StyleSheet, View, Linking } from 'react-native';
import { useState } from 'react';
import Btnlogin from '../components/btnlogin';
import API_CONFIG from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NAVER_CLIENT_ID = 'dt3_A23sqxNziHXwpdkq';
const REDIRECT_URI = `${API_CONFIG.BASE_URL}/auth/naver/callback`;
const LOGIN_STATE_KEY = '@tsm_login_state';

const LoginScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleNaverLogin = async () => {
    console.log('[LoginScreen] 네이버 로그인 버튼 클릭됨');

    // 새로운 로그인 세션을 위한 state 생성
    const state = Math.random().toString(36).substring(7);

    try {
      // 현재 로그인 세션의 state 저장
      await AsyncStorage.setItem(LOGIN_STATE_KEY, state);
      console.log('[LoginScreen] 로그인 state 저장:', state);
    } catch (error) {
      console.error('[LoginScreen] state 저장 실패:', error);
    }

    const naverUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;

    console.log('[LoginScreen] 네이버 로그인 URL:', naverUrl);

    // 외부 브라우저에서 네이버 로그인
    Linking.openURL(naverUrl)
      .then(() => {
        console.log('[LoginScreen] 브라우저 열기 성공');
      })
      .catch((err) => {
        console.error('[LoginScreen] 브라우저 열기 실패:', err);
      });
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Image
        source={require('../assets/icons/index_icon.png')}
        style={styles.icon}
        resizeMode="contain"
      />
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
  icon: {
    width: '70%',
    height: '70%',
    marginTop: -200,
  }
});

export default LoginScreen;