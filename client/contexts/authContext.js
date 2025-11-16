import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

let globalUserState = {
  userId: null,
  accessToken: null,
  userName: null,
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(globalUserState);

  const login = (userId, accessToken, userName) => {
    console.log('[AuthContext] login 함수 호출됨:', { userId, accessToken, userName });
    const newUser = { userId, accessToken, userName };
    globalUserState = newUser; // 전역 저장소에 저장
    setUser(newUser);
    console.log('[AuthContext] setUser 완료, globalUserState 업데이트:', globalUserState);
  };

  const logout = () => {
    console.log('[AuthContext] logout 함수 호출됨');
    const emptyUser = { userId: null, accessToken: null, userName: null };
    globalUserState = emptyUser;
    setUser(emptyUser);
  };

  // Provider가 재마운트될 때 전역 상태에서 복원
  useEffect(() => {
    console.log('[AuthContext] Provider 마운트됨, globalUserState에서 복원:', globalUserState);
    if (globalUserState.userId !== user.userId) {
      setUser(globalUserState);
    }
  }, []);

  console.log('[AuthContext] 현재 user 상태:', user);

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
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
