import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { EmployeeComponent } from './employee.component'
import { LoginService } from '../services/login.service'
import { UserService } from '../services/user.service'

describe('EmployeeComponent', () => {
  let component:EmployeeComponent
  let user:jasmine.SpyObj<UserService>
  let login:jasmine.SpyObj<LoginService>
  let router:jasmine.SpyObj<Router>
  beforeEach(async () => {
    user=jasmine.createSpyObj('UserService',['getEmployeesNode','getEmployeesDescendants'])
    login=jasmine.createSpyObj('LoginService',['logout'])
    router=jasmine.createSpyObj('Router',['navigate'])
    await TestBed.configureTestingModule({
      imports:[EmployeeComponent],
      providers:[{provide:UserService,useValue:user},{provide:LoginService,useValue:login},{provide:Router,useValue:router}]
    }).overrideComponent(EmployeeComponent,{set:{template:''}}).compileComponents()
    component=TestBed.createComponent(EmployeeComponent).componentInstance
  })
  for (const method of ['getEmployeesNode','getEmployeesDescendants'] as const) {
    it(method + ': displays returned employees', () => {
      user[method].and.returnValue(of([{_id:'u1',username:'alice'} as any]))
      component[method]()
      expect(component.employees?.[0].username).toBe('alice')
    })
    it(method + ': does not change list after error', () => {
      spyOn(console,'error')
      user[method].and.returnValue(throwError(()=>({status:500})))
      component[method]()
      expect(component.employees).toBeNull()
    })
  }
  it('logout: navigates to login on success', () => {
    login.logout.and.returnValue(of({}))
    component.logout()
    expect(router.navigate).toHaveBeenCalledWith(['/login'])
  })
  it('logout: does not navigate when logout fails', () => {
    spyOn(console,'error')
    login.logout.and.returnValue(throwError(()=>({status:500})))
    component.logout()
    expect(router.navigate).not.toHaveBeenCalled()
  })
})
