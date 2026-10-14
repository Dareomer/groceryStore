import { Component, inject, OnInit } from '@angular/core'
import { LoginService } from '../services/login.service'
import { Router } from '@angular/router'
import { User } from '../models/user'
import { UserService } from '../services/user.service'
import { Store } from '../models/store'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-manager',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './manager.component.html',
  styleUrl: './manager.component.css'
})
export class ManagerComponent implements OnInit{

  private loginService = inject(LoginService)
  private userService = inject(UserService)
  private router = inject(Router)

  employees:User[]|null=null
  managers:User[]|null=null

  departments:Store[] = []

  currentId:string = ""

  newUsername:string = ""
  newPassword:string = ""
  newEmail:string = ""
  newDepartment:string = ""
  newRole:number = 2

  insertSuccesMessage:string = ""
  successColor:string = "green"

  ngOnInit(): void {
      this.loginService.checkSession().subscribe({
        next:data=>{
          this.currentId=data._id
        },
        error:(err)=>{
          console.log(err)
        }
      })
      this.userService.getStores().subscribe({
        next:data=>{
          this.departments = data
        },
        error:(err)=>{
          console.log(err)
        }
      })
      this.insertSuccesMessage = ""
  }
  
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

  getManagersNode()
  {
    this.userService.getManagersNode().subscribe({
      next:data=>{
        this.managers = data
      },
      error: err=>console.error(err)
    })
  }

  getManagersDescendants()
  {
    this.userService.getManagersDescendants().subscribe({
      next:data=>{
        this.managers = data
      },
      error: err=>console.error(err)
    })
  }

  changeUser(id:string)
  {
    this.router.navigate(["/manager/change",id])
  }

  insertUser() {
    this.userService.insertUser(
        this.newUsername,
        this.newPassword,
        this.newEmail,
        this.newDepartment,
        this.newRole
    ).subscribe({
        next: data => {
            this.insertSuccesMessage = data.message
            this.successColor="green"

            this.newUsername=""
            this.newPassword=""
            this.newEmail=""
        },
        error: (err) =>{
          this.successColor="red"

          if(err.status==409)
          {
            this.insertSuccesMessage=err.error.message
          }
          else if(err.status==400)
          {
            this.insertSuccesMessage="Please fill in all fields correctly."
          }
          else if(err.status==403)
          {
            this.insertSuccesMessage="Can't create user for this department."
          }
          else
          {
            this.insertSuccesMessage="Failed to insert user."
          }
        }
    })
  }

}
