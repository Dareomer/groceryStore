import { Component, inject } from '@angular/core'
import { LoginService } from '../services/login.service'
import { Router } from '@angular/router'
import { User } from '../models/user'
import { UserService } from '../services/user.service'

@Component({
  selector: 'app-employee',
  standalone: true,
  imports: [],
  templateUrl: './employee.component.html',
  styleUrl: './employee.component.css'
})
export class EmployeeComponent {

  private loginService = inject(LoginService)
  private userService = inject(UserService)
  private router = inject(Router)

  employees:User[]|null = null

  logout()
  {
    this.loginService.logout().subscribe({
      next: ()=>{
        this.router.navigate(["/login"])
      },
      error:(err)=>{
        console.error("Logout failed",err)
      }
    })
  }

  getEmployeesNode()
  {
    this.userService.getEmployeesNode().subscribe({
      next:data=>{
        this.employees = data
      },
      error: err=>console.error(err)
    })
  }

  getEmployeesDescendants()
  {
    this.userService.getEmployeesDescendants().subscribe({
      next:data=>{
        this.employees = data
      },
      error: err=>console.error(err)
    })
  }

}
