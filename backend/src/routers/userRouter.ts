import express from "express"
import { UserController } from "../controllers/userController"


const userRouter = express.Router()


userRouter.route("/employees/node").get(
    (req,res)=>new UserController().getEmployeesNode(req,res)
)

userRouter.route("/employees/descendants").get(
    (req,res)=>new UserController().getEmployeesDescendants(req,res)
)


userRouter.route("/managers/node").get(
    (req,res)=>new UserController().getManagersNode(req,res)
)

userRouter.route("/managers/descendants").get(
    (req,res)=>new UserController().getManagersDescendants(req,res)
)

userRouter.route("/insert").post(
    (req,res)=>new UserController().insertUser(req,res)
)

userRouter.route("/change/stores").get(
    (req,res)=>new UserController().getStores(req,res)
)

userRouter.route("/change/:id").get(
    (req,res)=>new UserController().getUser(req,res)
)

userRouter.route("/change/:id").put(
    (req,res)=>new UserController().updateUser(req,res)
)

userRouter.route("/change/:id").delete(
    (req,res)=>new UserController().deleteUser(req,res)
)


export default userRouter