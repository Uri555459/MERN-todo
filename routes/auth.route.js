const { Router } = require('express')
const { check, validationResult } = require('express-validator')
const bctypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const router = Router()
const User = require('../models/User')
const keys = require('../conf/keys')

router.post(
  '/registration',
  [
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Некорректный пароль').isLength({ min: 6 }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при регистрации',
        })
      }

      const { email, password } = req.body

      const candidate = await User.findOne({ email })

      const hashedPassword = await bctypt.hash(password, 12)

      const user = new User({ email, password: hashedPassword })
      await user.save()

      res.status(201).json({ message: 'Пользователь создан' })

      if (candidate) {
        return res
          .status(300)
          .json({ message: 'Данный Email уже занят. Попробуйте другой.' })
      }
    } catch (error) {
      console.log(error)
    }
  }
)

router.post(
  '/login',
  [
    check('email', 'Некорректный email').isEmail(),
    check('password', 'Некорректный пароль').exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Некорректные данные при регистрации',
        })
      }

      const { email, password } = req.body

      const user = await User.findOne({ email })

      if (!user) {
        return res
          .status(400)
          .json({ message: 'Такого пользователя нет в базе' })
      }

      const isMatch = bctypt.compare(password, user.password)

      if (!isMatch) {
        return res.status(400).json({ message: 'Пароли не совпадают' })
      }

      const jwtSecret = keys.secretKey

      const token = jwt.sign({ userId: user.id }, jwtSecret, {
        expiresIn: '1h',
      })

      res.json({ token, userId: user.id })
    } catch (error) {
      console.log(error)
    }
  }
)

module.exports = router
