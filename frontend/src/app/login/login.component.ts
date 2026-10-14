import { Component, inject, OnInit } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { LoginService } from '../services/login.service'
import { Router } from '@angular/router'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit{

  private service = inject(LoginService)
  private router = inject(Router)

  username:string = ""
  password:string = ""

  errorMsg:string = ""
  boja:string = ""

  ngOnInit(): void {
      
  }

  login()
  {
    this.service.loginRequest(this.username,this.password).subscribe({
      next:data=>{
        if(data.role==1)
        {
          this.router.navigate(["/manager"])
        }
        else if(data.role==2)
        {
          this.router.navigate(["/employee"])
        }
        else
        {
          this.errorMsg = "Invalid user role."
          this.boja = "red"
        }
      },
      error:(err)=>{
        this.boja="red"

        if(err.status==401)
        {
          this.errorMsg="Invalid username or password."
        }
        else
        {
          this.errorMsg="Login failed.Please try again."
        }
      }
    })
  }

}
