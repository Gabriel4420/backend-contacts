const bcrypt = require('bcryptjs/dist/bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const config = require('../config/auth')
class LoginController {
  async index(req, res) {
    const { email, password } = req.body

    const userExist = await User.findOne({ email })
    const passwordValid = await User.findOne({ email }).select('password')

    !userExist &&
      res.status(404).json({
        error: true,
        message: 'User Non existent',
      })


    !bcrypt.compare(password, passwordValid.password) &&
      res.status(400).json({
        error: true,
        message: 'Invalid Password',
      })

    return res.status(200).json({
      user: {
        name: userExist.name,
        email: userExist.email,
      },
      token: jwt.sign(
        {
          id: userExist._id,
        },
        config.secret,
        { expiresIn: config.expireIn },
      ),
    })
  }
}

module.exports = new LoginController()
