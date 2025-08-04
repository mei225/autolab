// 필요한 라이브러리들을 불러옵니다.
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const multer = require('multer');

// Express 앱을 생성합니다.
const app = express();
const port = 3001; // 서버가 실행될 포트 번호

// CORS 설정: 다른 주소(여기서는 HTML 파일)에서의 요청을 허용합니다.
app.use(cors());
// JSON 형태의 요청 본문을 파싱하기 위해 필요합니다.
app.use(express.json());

// Multer 설정: 파일 업로드를 처리합니다. 메모리에 임시 저장합니다.
const upload = multer({ storage: multer.memoryStorage() });

// '/api/quote' 경로로 POST 요청이 왔을 때 처리할 로직
app.post('/api/quote', upload.single('file'), (req, res) => {
    console.log('견적문의 요청 받음:', req.body);
    
    // 폼에서 전송된 데이터를 변수에 저장합니다.
    const { inquiryType, company, name, phone, email, message } = req.body;
    const file = req.file;

    // Nodemailer transporter 설정 (Gmail 사용)
    // 중요: 아래 user와 pass는 실제 이메일 계정 정보로 변경해야 합니다.
    // pass에는 실제 비밀번호가 아닌, 아래 설명된 '앱 비밀번호'를 사용해야 합니다.
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '2025autolab@gmail.com', // 보내는 사람의 이메일 주소
            pass: 'YOUR_GMAIL_APP_PASSWORD' // 생성한 Gmail 앱 비밀번호 16자리
        }
    });

    // 이메일 내용 설정
    const mailOptions = {
        from: '"AUTOLAB" <2025autolab@gmail.com>', // 보내는 사람 정보 (별명 <이메일>)
        to: '2025autolab@gmail.com',      // 받는 사람 이메일 (관리자 이메일)
        subject: `[${inquiryType}] AUTOLAB 견적문의가 도착했습니다.`, // 이메일 제목
        html: `
            <h2>${inquiryType} 견적문의</h2>
            <p><strong>회사/기관명:</strong> ${company}</p>
            <p><strong>담당자명:</strong> ${name}</p>
            <p><strong>연락처:</strong> ${phone}</p>
            <p><strong>이메일:</strong> ${email}</p>
            <hr>
            <h3>문의 내용</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
        `,
        // 첨부 파일이 있는 경우, 이메일에 추가합니다.
        attachments: file ? [{
            filename: file.originalname,
            content: file.buffer
        }] : []
    };

    // 이메일 전송
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('이메일 전송 실패:', error);
            // 클라이언트에게 에러 응답 전송
            return res.status(500).send('문의 전송에 실패했습니다. 다시 시도해주세요.');
        }
        console.log('이메일 전송 성공:', info.response);
        // 클라이언트에게 성공 응답 전송
        res.status(200).send('문의가 성공적으로 접수되었습니다.');
    });
});

// 서버 실행
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});
