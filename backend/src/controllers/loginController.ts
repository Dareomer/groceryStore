import * as express from "express"
import User from "../models/user"
import bcrypt from "bcrypt"

export class LoginController{

    login = async (req: express.Request, res: express.Response) => {
        try {

            if(typeof req.body.username!="string" || typeof req.body.password != "string")
            {
                return res.sendStatus(400)
            }

            const user = await User.findOne({username: req.body.username,})

            if (!user || !user.password) {
                res.status(401).json({message:"Invalid username or password."})
                return
            }
            
            const validPw = await bcrypt.compare(req.body.password,user.password)
            if(!validPw)
            {
                return res.status(401).json({message:"Invalid username or password."})
            }

            req.session.regenerate((err) => {
                if (err) return res.sendStatus(500)

                req.session.userId = user._id.toString()

                req.session.save((err) => {
                    if (err) return res.sendStatus(500)

                    res.json({
                        _id: user._id,
                        username: user.username,
                        email: user.email,
                        role: user.role,
                        department: user.department
                    })
                })
            })

        } catch (error) {
            res.sendStatus(500)
        }
    }


    me = async (req: express.Request, res: express.Response) => {
        if (!req.session.userId) {
            res.sendStatus(401)
            return
        }

        try {
            const user = await User.findById(req.session.userId)

            if (!user) {
                res.sendStatus(401)
                return
            }

            res.json({
                _id: user._id,
                username: user.username,
                email:user.email,
                role: user.role,
                department: user.department
            })
        } catch (error) {
            res.sendStatus(500)
        }
    }

    logout = (req: express.Request, res: express.Response) => {
        req.session.destroy((err) => {
            if (err) {
                res.sendStatus(500)
                return
            }

            res.clearCookie("connect.sid")
            res.sendStatus(204)
        })
    }
   
}