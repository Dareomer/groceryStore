import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { ManagerComponent } from './manager/manager.component';
import { EmployeeComponent } from './employee/employee.component';
import { authGuard } from './guards/auth.guard';
import { ChangeUserComponent } from './change-user/change-user.component';

export const routes: Routes = [
    {path:"",redirectTo:"login",pathMatch:"full"},
    {path:"login",component:LoginComponent,canActivate:[authGuard]},
    {path:"manager/change/:id",component:ChangeUserComponent,canActivate:[authGuard],data:{role:1}},
    {path:"manager",component:ManagerComponent,canActivate:[authGuard],data:{role:1}},
    {path:"employee",component:EmployeeComponent,canActivate:[authGuard],data:{role:2}},
    {path:"**",redirectTo:"login"}
];
