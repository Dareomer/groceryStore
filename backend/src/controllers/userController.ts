import * as express from "express"
import User from "../models/user"
import Store from "../models/store"
import mongoose from "mongoose"
import bcrypt from "bcrypt"

export class UserController{

    private async canManage(managerId: string, userId: string) {
        const manager = await User.findById(managerId)
        const user = await User.findById(userId)

        if (!manager || !user || manager.role !== 1) return false
        if (manager._id.equals(user._id)) return false

        const allowed = await Store.exists({_id: user.department,$or: [{ _id: manager.department },{ parents: manager.department }]})

        return !!allowed
    }


    getUser = async(req:express.Request,res:express.Response)=>{
        try
        {
            //active session exists check
            if(!req.session.userId)
            {
                return res.sendStatus(401)
            }

            const id = String(req.params.id)
            //valid id format
            if(!mongoose.isObjectIdOrHexString(id))
            {
                return res.sendStatus(400)
            }

            //check if user has the right to alter
            if(!await this.canManage(req.session.userId,id))
            {
                return res.sendStatus(403)
            }
            
            const user=await User.findById(id).select("-password")
            return res.json(user)
        }
        catch (error)
        {
            return res.sendStatus(500)
        }
    }

    updateUser = async(req:express.Request,res:express.Response)=>{
        try
        {
            //active session exists check
            if(!req.session.userId)
            {
                return res.sendStatus(401)    
            }

            const id = String(req.params.id)
            const {username,email,department,role} = req.body

            //valid input format
            if (
                !mongoose.isObjectIdOrHexString(id) ||
                !mongoose.isObjectIdOrHexString(department) ||
                typeof username !== "string" ||
                typeof email !== "string" ||
                !username.trim() ||
                !email.trim() ||
                ![1, 2].includes(role)
            ) 
            {
                return res.sendStatus(400)
            }

            //check if user has the right to alter
            if (!await this.canManage(req.session.userId,id))
            {
                return res.sendStatus(403)
            }

            const manager = await User.findById(req.session.userId)

            const allowDep = await Store.exists({_id:department,$or:[{_id:manager!.department},{parents:manager!.department}]})

            //check if new department is managable by current user
            if(!allowDep)
            {
                return res.sendStatus(403)
            }

            const exists = await User.findOne({_id: { $ne: id },$or: [{ username: username.trim() },{ email: email.trim() }]})
            //check if there is an existing user with the same username or email
            if(exists)
            {
                return res.status(409).json({message:"Username or email already exists!"})
            }

            await User.findByIdAndUpdate(id,{
                username:username.trim(),
                email:email.trim(),
                department,
                role
            })
            
            return res.status(200).json({message:"User updated succesfully!"})
        }
        catch (error)
        {
            return res.sendStatus(500)
        }
    }

    deleteUser = async(req:express.Request,res:express.Response)=>{
        try
        {
            //active session exists check
            if(!req.session.userId)
            {
                return res.sendStatus(401)
            }

            const id = String(req.params.id)

            //valid id format
            if(!mongoose.isObjectIdOrHexString(id))
            {
                return res.sendStatus(400)
            }

            //check if user has the right to alter
            if(!await this.canManage(req.session.userId,id))
            {
                return res.sendStatus(403)
            }
            await User.findByIdAndDelete(id)

            return res.status(200).json({message:"User deleted succesfully!"})
        }
        catch (error)
        {
            return res.sendStatus(500)
        }
    }


    getStores = async(req:express.Request,res:express.Response)=>{
        try
        {
            //active session exists check
            if(!req.session.userId)
            {
                res.sendStatus(401)
                return
            }
            
            const user = await User.findById(req.session.userId)
            //user with the session.userId exists in db
            if(!user)
            {
                res.sendStatus(401)
                return
            }
            //user has the manager role
            if(user.role!=1)
            {
                res.sendStatus(403)
                return
            }
            const departments = await Store.find({$or:[{_id:user!.department},{parents:user!.department}]})
            res.json(departments)
        }
        catch (error)
        {
            res.sendStatus(500)
        }
    }

    getEmployeesNode = async(req: express.Request, res: express.Response) =>{
        try
        {
            //active session exists check
            if(!req.session.userId)
            {
                res.sendStatus(401)
                return
            }

            const user = await User.findById(req.session.userId)
            //user with the session.userId exists in db
            if(!user)
            {
                res.sendStatus(401)
                return
            }
            const employees = await User.find({department:user.department,role:2}).select("-password")
            res.json(employees)
        } 
        catch (error)
        {
            res.sendStatus(500)
        }
    }

    getEmployeesDescendants = async (req: express.Request, res: express.Response) =>{
        try
        {
            //active session exists check
            if(!req.session.userId)
            {
                res.sendStatus(401)
                return
            }
            
            const user = await User.findById(req.session.userId)
            //user with the session.userId exists in db
            if(!user)
            {
                res.sendStatus(401)
                return
            }
            
            const descendants = await Store.find({parents:user.department}).select("_id")

            const depIds = [user.department,...descendants.map(store=>store._id)]

            const employees = await User.find({department:{$in:depIds},role:2}).select("-password")
            res.json(employees)
        } 
        catch (error)
        {
            res.sendStatus(500)
        }
    }

    getManagersNode = async(req: express.Request, res: express.Response) =>{
        try
        {
            //active session exists check
            if(!req.session.userId)
            {
                res.sendStatus(401)
                return
            }

            const user = await User.findById(req.session.userId)

            //user with the session.userId exists in db
            if(!user)
            {
                res.sendStatus(401)
                return
            }
            //user has the manager role
            if(user.role!=1)
            {
                res.sendStatus(403)
                return
            }
            const managers = await User.find({department:user.department,role:1}).select("-password")
            res.json(managers)
        } 
        catch (error)
        {
            res.sendStatus(500)
        }
    }

    getManagersDescendants = async (req: express.Request, res: express.Response) =>{
        try
        {
            //active session exists check
            if(!req.session.userId)
            {
                res.sendStatus(401)
                return
            }
            
            const user = await User.findById(req.session.userId)

            //user with the session.userId exists in db
            if(!user)
            {
                res.sendStatus(401)
                return
            }
            //user has the manager role
            if(user.role!=1)
            {
                res.sendStatus(403)
                return
            }
            
            const descendants = await Store.find({parents:user.department}).select("_id")

            const depIds = [user.department,...descendants.map(store=>store._id)]

            const managers = await User.find({department:{$in:depIds},role:1}).select("-password")
            res.json(managers)
        } 
        catch (error)
        {
            res.sendStatus(500)
        }
    }

    insertUser = async(req:express.Request,res:express.Response)=>{
        try
        {
            //active session exists check
            if(!req.session.userId)
            {
                return res.sendStatus(401)
            }

            const manager = await User.findById(req.session.userId)

            //manager exists and is the adequate role
            if(!manager || manager.role !=1)
            {
                return res.sendStatus(403)
            }

            const {username,password,email,role,department}=req.body

            //sent data validation for new user
            if (
                typeof username !== "string" || !username.trim() ||
                typeof password !== "string" || !password.trim() ||
                typeof email !== "string" || !email.trim() ||
                !department || ![1, 2].includes(role)
            )
            {
                return res.sendStatus(400)
            }

            const exists = await User.findOne({$or:[{username:username.trim()},{email:email.trim()}]})
            //check if there is a user with existing username or email
            if(exists)
            {
                return res.status(409).json({
                    message:"Username or email already exists"
                })
            }

            //department check if in adequate format
            if(!mongoose.isObjectIdOrHexString(department))
            {
                return res.sendStatus(400)
            }

            const store = await Store.findOne({_id:department,$or:[{_id:manager.department},{parents:manager.department}]})

            //check if the department exists in db
            if(!store)
            {
                return res.sendStatus(403)
            }

            const hashedPw = await bcrypt.hash(password,12)

            await User.create({username:username.trim(),password:hashedPw,email:email.trim(),role,department})

            return res.status(201).json({message:"User inserted succesfully!"})
        }catch (error)
        {
            console.log(error)
            return res.sendStatus(500)
        }
    }
}