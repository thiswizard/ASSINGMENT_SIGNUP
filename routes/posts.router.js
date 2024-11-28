import { PrismaClient } from "@prisma/client"; // 데이터베이스와 상호작용을함
import express from "express"; // 서브라우터를 생성하기위해 express 라이브러리 사용

const prisma = new PrismaClient(); // 새로운 prisma client 생성
const router = express.Router(); // router 객체를 생성

// 회원가입 라우트
const register = async (req, res) => {
  const { id, name, password, confirmPassword } = req.body;

  if (!id || !password || !confirmPassword || !name) {
    return res.status(400).json({ message: "아이디,이름,패스워드,패스워드확인을 정확히 입력해주세요" });
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

    const { password: _, ...restall } = user; // 객체 분해 할당
    // password 값은 무시하고(_) 나머지 값들을 압축한다(...restall) 스프레드연산자

    res.status(201).json({
      message: "회원가입 성공!",
      user: restall,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "회원가입 오류.", error });
  }
};
// 회원가입 라우트



// 모든 사용자 가져오기
const getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { // select는 데이터베이스를 조회할떄 특정 필드만 가져올수있다.
        id: true,
        name: true,
        createdAt: true,
      },
    });
    res.status(200).json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "모든 사용자를 가지고 올수 없습니다.", error });
  }
};
// 모든 사용자 가져오기


// 게임 캐릭터 생성하기(회원가입 한 유저만 가능)
const createCharacter = async (req, res) => {
  const { userId, characterName } = req.body;

  if (!userId || !characterName) {
    return res.status(400).json({ message: "아이디 및 캐릭터 이름을 정확하게 입력해주세요" });
  }

  // 해당 userId가 실제로 존재하는지 확인(회원가입 ID를 검색)
  const userExists = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!userExists) {
    return res.status(400).json({ message: "존재하지 않는 사용자입니다 회원가입을 먼저 하세요." });
  }

  // 캐릭터 이름 중복 체크 (findUnique 대신 findFirst 사용하고 싶으면 중복필드 값이 있어야할것)
  const existingCharacter = await prisma.character.findFirst({
    where: { name: characterName },
  });

  if (existingCharacter) {
    return res.status(400).json({ message: "이미 존재하는 캐릭터 이름입니다." });
  }


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
    message: "성공적으로 캐릭터를 생성했습니다!",
    characterId: newCharacter.id,
  });
};
// 게임 캐릭터 생성하기


// 게임 캐릭터 조회하기
const getAllCharacters = async (req, res) => {
  try {
    const characters = await prisma.character.findMany({
      select: {
        userId: true,
        name: true,
        health: true,
        power: true,
        money: true,
      },
    });
    res.status(200).json(characters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "게임 캐릭터 조회 오류 발생.", error });
  }
};
// 게임 캐릭터 조회하기




// 라우트 추가
router.post("/register", register); // 회원가입

// 예시
// {
//   "id": "kim123",
//   "name": "john wick",
//   "password": "wick1234",
//   "confirmPassword": "wick1234"
// }


router.post("/createCharacter",createCharacter) // 게임캐릭터 생성

// {
//   "userId": "kim123",          // 회원가입된 유저의 ID
//   "characterName": "Warrior123"  // 생성할 캐릭터 이름
// }

router.get("/users", getAllUsers); // 회원가입 유저 조회
router.get("/Characters", getAllCharacters); // 게임캐릭터 유저 조회

export default router;
