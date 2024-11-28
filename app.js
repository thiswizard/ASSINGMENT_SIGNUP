import dotenv from "dotenv"; // 중요한 정보를 하드코딩하지 않고 .env를 통해 불러와서 함
import express from "express"; // Node.js 에 대표적인 웹 프레임워크
import register from "./routes/posts.router.js"; 

dotenv.config(); // env 파일에 있는 환경변수들을 사용할수있지

const app = express();
app.use(express.json()); 


app.use("/api", register);  // 회원가입 라우트 연결(미들웨어 추가)

const PORT = process.env.PORT || 3306; // 포트 수정
app.listen(PORT, () => {
  console.log(`${PORT}포트 서버가 정상적으로 실행되고 있습니다`);
});
