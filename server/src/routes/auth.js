const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/user');

router.get('/naver/callback', async (req, res) => {
    const { code, state } = req.query;

    console.log('=== 네이버 콜백 시작 ===');
    console.log('Code:', code);
    console.log('State:', state);

    try {
        // 토큰 요청
        const tokenResponse = await axios.post(
            'https://nid.naver.com/oauth2.0/token',
            null,
            {
                params: {
                    grant_type: 'authorization_code',
                    client_id: process.env.NAVER_CLIENT_ID,
                    client_secret: process.env.NAVER_CLIENT_SECRET,
                    code: code,
                    state: state
                }
            }
        );

        console.log('=== 토큰 응답 ===');
        console.log('전체 응답:', JSON.stringify(tokenResponse.data, null, 2));

        const accessToken = tokenResponse.data.access_token;
        console.log('Access Token:', accessToken);

        // 토큰이 없으면 여기서 중단
        if (!accessToken) {
            throw new Error('액세스 토큰을 받지 못했습니다.');
        }

        const userResponse = await axios.get('https://openapi.naver.com/v1/nid/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const naverUser = userResponse.data.response;

        // naverId 또는 email로 사용자 찾기
        let user = await User.findOne({ 
            $or: [
                { naverId: naverUser.id },
                { email: naverUser.email }
            ]
        });

        if (!user) {
            // 새 사용자 생성
            user = new User({
                naverId: naverUser.id,
                name: naverUser.name || naverUser.nickname,
                email: naverUser.email,
                profileImage: naverUser.profile_image
            });
            await user.save();
            console.log('새 사용자 생성:', user.name);
        } else {
            // 기존 사용자가 있으면 naverId 업데이트 (없는 경우에만)
            if (!user.naverId) {
                user.naverId = naverUser.id;
                await user.save();
            }
            console.log('기존 사용자 로그인:', user.name);
        }

        // 🔥 deepLink는 user 정보를 얻은 후에 생성
        console.log('앱 로그인 처리:', user.name);
        const deepLink = `tsmapp://?userId=${user._id}&accessToken=${accessToken}&name=${encodeURIComponent(user.name)}&callback=true`;

        res.send(`
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title>로그인 중...</title>
                </head>
                <body>
                    <h2>로그인 처리 중...</h2>
                    <p>${user.name}님, 잠시만 기다려주세요.</p>
                    <p>앱으로 돌아가는 중입니다...</p>
                    <script>
                        window.location.href = '${deepLink}';

                        setTimeout(function() {
                            document.body.innerHTML = '<h2>로그인 완료!</h2><p>앱을 확인해주세요.</p>';
                        }, 2000);
                    </script>
                </body>
            </html>
        `);

    } catch (error) {
        console.error('=== 네이버 로그인 에러 ===');
        console.error('에러 메시지:', error.message);
        console.error('에러 상세:', error.response?.data);
        
        // 토큰 요청 실패 시 더 자세한 정보
        if (error.config) {
            console.error('요청 URL:', error.config.url);
            console.error('요청 파라미터:', error.config.params);
        }
        
        res.send(`
            <html>
                <body>
                    <h2>로그인 실패</h2>
                    <p>오류가 발생했습니다: ${error.message}</p>
                    <p>콘솔을 확인해주세요.</p>
                </body>
            </html>
        `);
    }
});

module.exports = router;