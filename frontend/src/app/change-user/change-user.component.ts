import { Component, inject, OnInit } from '@angular/core'
import { Store } from '../models/store'
import { UserService } from '../services/user.service'
import { ActivatedRoute, Router } from '@angular/router'
import { FormsModule } from '@angular/forms'

@Component({
  selector: 'app-change-user',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './change-user.component.html',
  styleUrl: './change-user.component.css'
})
export class ChangeUserComponent implements OnInit{

  userId: string = ""
  username: string = ""
  email: string = ""
  department: string = ""
  role:number = 2

  departments: Store[] = []
  loaded: boolean = false
  saving: boolean = false

  errorMsg:string = ""


  private userService = inject(UserService)
  private router = inject(Router)
  private actRoute = inject(ActivatedRoute)

  ngOnInit(): void {
      this.userId = this.actRoute.snapshot.paramMap.get("id")?? ""
      this.userService.getUser(this.userId).subscribe({
        next:data=>{
          this.username = data.username
          this.email=data.email
          this.department=data.department??""
          this.role=data.role
        },
        error:(err)=>{
          this.errorMsg = "Failed to load user info."
        }
      })
      this.userService.getStores().subscribe({
        next:data=>{
          this.departments=data
        },
        error:(err)=>{
          this.errorMsg = "Failed to load departments."
        }
      })
  }

  update() {
      this.userService.updateUser(
          this.userId,
          this.username,
          this.email,
          this.department,
          this.role
      ).subscribe({
          next: () => {
            this.router.navigate(["/manager"])
          },
          error: err =>{
            if(err.status==409)
            {
              this.errorMsg=err.error?.message ?? "Failed to change user info."
            }
            else if(err.status==400)
            {
              this.errorMsg="Invalid user data."
            }
            else if(err.status==403)
            {
              this.errorMsg="You don't have permission to change this users info."
            }
            else
            {
              this.errorMsg="Failed to change user info."
            }
          }
      })
  }

  delete() {
      if (confirm("Are you sure you want to delete this user?")) {
          this.userService.deleteUser(this.userId).subscribe({
              next: () => {
                this.router.navigate(["/manager"])
              },
              error: err =>{
                this.errorMsg=err.status==403 ? "You don't have permission to delete this user.":"Failed to delete user."
              }
          })
      }
  }

  cancel()
  {
      this.router.navigate(["/manager"])
  }


}
