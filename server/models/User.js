import mongoose from 'mongoose'
const { Schema, model } = mongoose

const schema = new Schema({
  userName: { type: String, required: true },
  userPhone: { type: String, required: true, unique: true },
  userPassword: { type: String, required: true },
})

export default model('User', schema)
