import { Stack, useRouter } from 'expo-router';
import { Image, StyleSheet, View, Linking } from 'react-native';
import { useState } from 'react';
import Btnlogin from '../components/btnlogin';
import API_CONFIG from '../config/api';
const NAVER_CLIENT_ID = 'dt3_A23sqxNziHXwpdkq';
const REDIRECT_URI = `${API_CONFIG.BASE_URL}/api/auth/naver/callback`;

const LoginScreen = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleNaverLogin = () => {
    const state = Math.random().toString(36).substring(7);
    const naverUrl = `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${NAVER_CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&state=${state}`;

    // 외부 브라우저에서 네이버 로그인
    Linking.openURL(naverUrl);
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