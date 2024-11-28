import dotenv from "dotenv";
import express from "express";
import register from "./routes/posts.router.js"; 

dotenv.config();

const app = express();
app.use(express.json());

// 회원가입 라우트 연결
app.use("/api", register); 

const PORT = process.env.PORT || 3306; // 포트 수정
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
