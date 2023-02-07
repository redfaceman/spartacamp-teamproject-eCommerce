const UserService = require('../services/users.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

class ApiController {
  userService = new UserService();
  // 회원가입(id 동일하면 안됨!)
  join = async (req, res, next) => {
    try {
      const { id, password, nickname, email, address } = req.body;
      if (!id || !password || !nickname || !email || !address) {
        return res.status(400).json({ errorMessage: '모든 값을 입력하세요.' });
      }

      // 아이디: 영어대소문자숫자
      const idCheck = /^[A-Za-z0-9]{3,}$/;
      // 비밀번호: 영어대소문자숫자
      const passwordCheck = /^[A-Za-z0-9]{3,}$/;
      // 닉네임:한글포함영어대소문자숫자
      const nicknameCheck = /^[ㄱ-ㅎ|가-힣|a-z|A-Z|0-9|]+$/;
      // 이메일: aaa@aaa.aaa
      const emailCheck = /^[a-zA-Z0-9+-\_.]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
      if (
        !idCheck.test(id) ||
        !passwordCheck.test(password) ||
        !nicknameCheck.test(nickname) ||
        !emailCheck.test(email)
      ) {
        return res.status(412).json({
          errorMessage: '형식이 올바르지 않습니다. 다시 확인해주세요.',
        });
      }

      const foundById = await this.userService.findById(id);

      if (foundById.length > 0) {
        return res
          .status(409)
          .json({ errorMessage: `${id}는 이미 존재하는 아이디입니다.` });
      }

      const foundByNickname = await this.userService.findByNickname(nickname);

      if (foundByNickname.length > 0) {
        return res
          .status(409)
          .json({ errorMessage: `${nickname}는 이미 존재하는 닉네임입니다.` });
      }

      const hashed = await bcrypt.hash(password, 12);

      const createUser = await this.userService.createUser(
        id,
        hashed,
        nickname,
        email,
        address
      );

      res
        .status(201)
        .json({ data: createUser, message: '회원가입이 완료되었습니다.' });
    } catch (error) {
      res.status(400).json({ errorMessage: '회원가입이 실패하였습니다' });
    }
  };

  // 로그인
  login = async (req, res) => {
    try {
      const { id, password } = req.body;

      const user = await this.userService.findById(id);

      const passwordTest = await bcrypt.compare(password, user[0].password);
      if (user.length === 0 || !passwordTest) {
        return res
          .status(401)
          .json({ errorMessage: '사용자가 없거나 비밀번호가 틀렸습니다.' });
      }

      const accessToken = jwt.sign(
        {
          userId: user[0].userId,
          id: user[0].id,
          userNickname: user[0].nickname,
        },
        'my-secrect-key', //비밀키
        { expiresIn: '1d' }
      );

      // 쿠키에 토큰 담아서 보내기
      // res.cookie("accessToken", accessToken, { httpOnly: true, secure: true });
      res.cookie('accessToken', accessToken);

      return res.status(200).json({ message: '로그인 성공.' });
    } catch (error) {
      return res.status(400).json({ errorMessage: '로그인 실패.' });
    }
  };

  //로그아웃
  logout = async (req, res) => {
    res.clearCookie('accessToken');
    return res.json({ message: '로그아웃 성공.' });
  };
}

module.exports = ApiController;
