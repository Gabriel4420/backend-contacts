const User = require('../models/user')
const bcrypt = require('bcryptjs')
const yup = require('yup')
const mongoose = require('mongoose')

class UserController {
  async hello(req, res) {
    return res.send('rodando api')
  }

  async show(req, res) {
    const query = User.find().select('-_id name email password')
    query instanceof mongoose.Query // true
    const users = await query
    return res.status(200).json({ error: false, users })
  }

  async showOne(req, res) {
    const id = req.params.id
    const query = User.findOne({ _id: id }).select(
      '-_id -__v -createdAt -updatedAt',
    )
    query instanceof mongoose.Query // true
    const user = await query
    return res.status(200).json({ error: false, user })
  }

  

  async store(req, res) {
    //todo: validação dos dados
    let schema = yup.object().shape({
      name: yup.string().required(),
      email: yup.string().email().required(),
      password: yup.string().required(),
    })

    !(await schema.isValid(req.body)) &&
      res.status(400).json({
        error: true,
        message: 'Invalid format data ',
      })

    // validação que verifica se o usuário existe

    let userExist = await User.findOne({
      email: req.body.email,
    })

    if (userExist) {
      res.status(400).json({
        error: true,
        message: 'Existing user! please create a non-existing user  ',
      })
    } else {
      // Desestruturação dos dados da requisição
      const { name, email, password } = req.body

      const data = {
        name,
        email,
        password,
      }

      //Criptografia do password

      const salt = bcrypt.genSaltSync(8)

      data.password = await bcrypt.hash(data.password, salt)

      //Inserção de usuario no MongoDB

      await User.create(data, (error) => {
        error
          ? res.status(400).json({
              error: true,
              message: 'Error when trying to enter a user in mongoDB  ',
            })
          : res.status(200).json({
              error: false,
              message: 'Successfully registered user ',
            })
      })
    }
  }
}

module.exports = new UserController()
