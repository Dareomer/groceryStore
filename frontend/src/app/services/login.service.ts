import { HttpClient } from '@angular/common/http'
import { inject, Injectable } from '@angular/core'
import { User } from '../models/user'

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  constructor() { }

  private http = inject(HttpClient)


  loginRequest(username:string,password:string)
  {
    return this.http.post<User>("http://localhost:4000/login",{username:username,password:password},{withCredentials:true})
  }

  checkSession()
  {
    return this.http.get<User>("http://localhost:4000/me", {withCredentials: true})
  }

  logout()
  {
    return this.http.post("http://localhost:4000/logout",{},{ withCredentials: true })
  }

  


}
