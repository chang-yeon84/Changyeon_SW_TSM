const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/User');

router.get('/naver/callback', async (req, res) => {
    const { code, state } = req.query;

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

        // 디버깅: 어디서 온 요청인지 확인
        console.log('Referer:', req.headers['referer']);
        console.log('User-Agent:', req.headers['user-agent']);

        const referrer = req.headers['referer'] || '';
        const userAgent = req.headers['user-agent'] || '';

        // 웹 브라우저인지 확인 (여러 조건)
        const isFromWeb =
            referrer.includes('localhost:8081') ||
            referrer.includes('localhost:19006') ||
            referrer.includes('192.168.0.4:8081') ||
            userAgent.includes('Chrome') ||
            userAgent.includes('Firefox') ||
            userAgent.includes('Safari');

        console.log('isFromWeb:', isFromWeb);

        if (isFromWeb) {
            // 웹: home으로 리다이렉트
            console.log('웹 로그인 처리');
            res.send(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <meta charset="utf-8">
                        <title>로그인 완료</title>
                    </head>
                    <body>
                        <h2>로그인 완료!</h2>
                        <p>${user.name}님 환영합니다.</p>
                        <p>잠시 후 이동합니다...</p>
                        <script>
                            setTimeout(function() {
                                window.location.href = 'http://localhost:8081/home';
                            }, 1000);
                        </script>
                    </body>
                </html>
            `);
        } else {
            // 앱: Deep Link
            console.log('앱 로그인 처리');
            const deepLink = `tsmapp://auth/callback?userId=${user._id}&accessToken=${accessToken}&name=${encodeURIComponent(user.name)}`;

            res.send(`
                <!DOCTYPE html>
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
                            
                            setTimeout(function() {
                                document.body.innerHTML = '<h2>로그인 완료!</h2>';
                            }, 3000);
                        </script>
                    </body>
                </html>
            `);
        }

    } catch (error) {
        console.error('네이버 로그인 에러:', error);
        res.send(`
            <html>
                <body>
                    <h2>로그인 실패</h2>
                    <p>오류가 발생했습니다.</p>
                </body>
            </html>
        `);
    }
});

module.exports = router;