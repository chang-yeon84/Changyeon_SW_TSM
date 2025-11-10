const express = require('express');
const router = express.Router();
const axios = require('axios');
const User = require('../models/user');

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

        // 앱으로 Deep Link 전송 (경로 없이 루트로 전송)
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