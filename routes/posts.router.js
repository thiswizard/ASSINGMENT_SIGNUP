import { PrismaClient } from "@prisma/client";
import express from "express"; // express 모듈 임포트

const prisma = new PrismaClient();
const router = express.Router(); // router 객체를 생성

// 회원가입 라우트
const register = async (req, res) => {
  const { id, name, password, confirmPassword } = req.body;

  if (!id || !password || !confirmPassword || !name) {
    return res.status(400).json({ message: "아이디, 이름, 비밀번호, 비밀번호 확인을 모두 입력해주세요." });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: "비밀번호는 6자 이상이어야 합니다." });
  }

  // 이미 존재하는 id 체크
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (existingUser) {
    return res.status(400).json({ message: "이미 존재하는 아이디입니다." });
  }

  try {
    const user = await prisma.user.create({
      data: { id, name, password },
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: "회원가입 성공!",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "서버 오류.", error });
  }
};



// 모든 사용자 가져오기
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        createdAt: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error.", error });
  }
};

const createCharacter = async (req, res) => {
  const { userId, characterName } = req.body;

  if (!userId || !characterName) {
    return res.status(400).json({ message: "User ID와 캐릭터 이름을 모두 입력해주세요." });
  }

  // 해당 userId가 실제로 존재하는지 확인
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    return res.status(400).json({ message: "존재하지 않는 사용자입니다." });
  }

  // 캐릭터 이름 중복 체크 (findUnique 대신 findFirst 사용)
  const existingCharacter = await prisma.character.findFirst({
    where: { name: characterName },
  });

  if (existingCharacter) {
    return res.status(400).json({ message: "이미 존재하는 캐릭터 이름입니다." });
  }

  // 캐릭터 생성
  const newCharacter = await prisma.character.create({
    data: {
      name: characterName,
      userId: userId, // 실제 사용자 ID 연결
      health: 500,
      power: 100,
      money: 10000,
    },
  });

  res.status(201).json({
    message: "Character created successfully!",
    characterId: newCharacter.id,
  });
};

const getAllCharacters = async (req, res) => {
  try {
    const characters = await prisma.character.findMany({
      select: {
        id: true,
        name: true,
        health: true,
        power: true,
        money: true,
        userId: true,
      },
    });
    res.status(200).json(characters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error.", error });
  }
};


// 라우트 추가
router.post("/register", register); // 회원가입

// {
//   "id": "user123",
//   "name": "John Doe",
//   "password": "password123",
//   "confirmPassword": "password123"
// }
router.post("/createCharacter",createCharacter) // 게임캐릭터 생성

// {
//   "userId": "user123",          // 회원가입된 유저의 ID
//   "characterName": "Warrior123"  // 생성할 캐릭터 이름
// }

router.get("/users", getAllUsers); // 회원가입 유저 조회
router.get("/Characters", getAllCharacters); // 게임캐릭터 유저 조회

export default router;
