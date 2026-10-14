import express from "express"
import { LoginController} from "../controllers/loginController"


const loginRouter = express.Router()

loginRouter.route("/login").post(
    (req,res)=> new LoginController().login(req,res)
)

loginRouter.route("/me").get(
    (req,res)=> new LoginController().me(req,res)
)

loginRouter.route("/logout").post(
    (req,res)=>new LoginController().logout(req,res)
)



export default loginRouter