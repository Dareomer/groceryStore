import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { User } from '../models/user'
import { Store } from '../models/store'

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor() { }

  private http = inject(HttpClient)

  getEmployeesNode()
  {
    return this.http.get<User[]>("http://localhost:4000/user/employees/node",{ withCredentials: true })
  }

  getEmployeesDescendants()
  {
    return this.http.get<User[]>("http://localhost:4000/user/employees/descendants",{ withCredentials: true })
  }

  getManagersNode()
  {
    return this.http.get<User[]>("http://localhost:4000/user/managers/node",{ withCredentials: true })
  }

  getManagersDescendants()
  {
    return this.http.get<User[]>("http://localhost:4000/user/managers/descendants",{ withCredentials: true })
  }

  getUser(id:string)
  {
    return this.http.get<User>(`http://localhost:4000/user/change/${id}`,{withCredentials:true})
  }

  getStores()
  {
    return this.http.get<Store[]>("http://localhost:4000/user/change/stores",{withCredentials:true})
  }

  updateUser(id:string,username:string,email:string,department:string,role:number)
  {
    const data = {username:username,email:email,department:department,role:role}
    return this.http.put(`http://localhost:4000/user/change/${id}`,data,{withCredentials:true})
  }

  deleteUser(id:string)
  {
    return this.http.delete(`http://localhost:4000/user/change/${id}`,{withCredentials:true})
  }

  insertUser(username:string,password:string,email:string,department:string,role:number)
  {
    const data = {
      username:username,
      password:password,
      email:email,
      role:role,
      department:department
    }
    return this.http.post<{message:string}>("http://localhost:4000/user/insert",data,{withCredentials:true})
  }
}
