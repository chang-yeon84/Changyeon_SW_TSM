const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');

// GET: 브라우저에서 호출 (네이버 로그인 후)
router.get('/naver/callback', async (req, res) => {
    const { code, state } = req.query;

    try {
        // 1. Access Token 받기
        const tokenResponse = await axios.get('https://nid.naver.com/oauth2.0/token', {
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.NAVER_CLIENT_ID,
                client_secret: process.env.NAVER_CLIENT_SECRET,
                code: code,
                state: state
            }
        });

        const accessToken = tokenResponse.data.access_token;

        // 2. 사용자 정보 가져오기
        const userResponse = await axios.get('https://openapi.naver.com/v1/nid/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const naverUser = userResponse.data.response;

        // 3. 사용자 찾기 또는 생성
        let user = await User.findOne({ naverId: naverUser.id });

        if (!user) {
            user = new User({
                naverId: naverUser.id,
                name: naverUser.name || naverUser.nickname,
                email: naverUser.email,
                profileImage: naverUser.profile_image
            });
            await user.save();
        }

        // 4. Deep Link로 앱 열기 (중요!)
        const deepLink = `tsmapp://auth/callback?userId=${user._id}&accessToken=${accessToken}&name=${encodeURIComponent(user.name)}`;

        // HTML 응답: 자동으로 앱 열기
        res.send(`
      <html>
        <head>
          <meta charset="utf-8">
          <title>로그인 중...</title>
        </head>
        <body>
          <h2>로그인 처리 중...</h2>
          <p>잠시만 기다려주세요.</p>
          <script>
            window.location.href = '${deepLink}';
            
            // 3초 후에도 안 되면 수동으로 닫기 안내
            setTimeout(function() {
              document.body.innerHTML = '<h2>로그인 완료!</h2><p>앱으로 돌아가세요.</p><p>자동으로 이동하지 않으면 이 창을 닫으세요.</p>';
            }, 3000);
          </script>
        </body>
      </html>
    `);

    } catch (error) {
        console.error('네이버 로그인 에러:', error);
        res.send(`
      <html>
        <body>
          <h2>로그인 실패</h2>
          <p>오류가 발생했습니다. 앱으로 돌아가세요.</p>
        </body>
      </html>
    `);
    }
});

// POST: 앱에서 직접 호출 (모바일용)
router.post('/naver/login', async (req, res) => {
    const { code, state } = req.body;

    try {
        const tokenResponse = await axios.get('https://nid.naver.com/oauth2.0/token', {
            params: {
                grant_type: 'authorization_code',
                client_id: process.env.NAVER_CLIENT_ID,
                client_secret: process.env.NAVER_CLIENT_SECRET,
                code: code,
                state: state
            }
        });

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://openapi.naver.com/v1/nid/me', {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        const naverUser = userResponse.data.response;

        let user = await User.findOne({ naverId: naverUser.id });

        if (!user) {
            user = new User({
                naverId: naverUser.id,
                name: naverUser.name || naverUser.nickname,
                email: naverUser.email,
                profileImage: naverUser.profile_image
            });
            await user.save();
        }

        res.json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                profileImage: user.profileImage
            },
            accessToken
        });

    } catch (error) {
        console.error('네이버 로그인 에러:', error);
        res.status(500).json({
            success: false,
            message: '로그인 처리 중 오류가 발생했습니다.',
            error: error.message
        });
    }
});

module.exports = router;