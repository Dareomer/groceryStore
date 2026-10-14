import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { LoginComponent } from './login.component'
import { LoginService } from '../services/login.service'

describe('LoginComponent', () => {
  let component:LoginComponent
  let service:jasmine.SpyObj<LoginService>
  let router:jasmine.SpyObj<Router>
  beforeEach(async () => {
    service=jasmine.createSpyObj('LoginService',['loginRequest'])
    router=jasmine.createSpyObj('Router',['navigate'])
    await TestBed.configureTestingModule({
      imports:[LoginComponent],
      providers:[{provide:LoginService,useValue:service},{provide:Router,useValue:router}]
    }).overrideComponent(LoginComponent,{set:{template:''}}).compileComponents()
    component=TestBed.createComponent(LoginComponent).componentInstance
    component.username='alice'
    component.password='Secret1!'
  })
  it('navigates manager after valid login', () => {
    service.loginRequest.and.returnValue(of({_id:'u1',username:'alice',role:1} as any))
    component.login()
    expect(router.navigate).toHaveBeenCalledWith(['/manager'])
  })
  it('displays error when login returns 401', () => {
    service.loginRequest.and.returnValue(throwError(()=>({status:401})))
    component.login()
    expect(component.errorMsg).toContain('Invalid')
    expect(router.navigate).not.toHaveBeenCalled()
  })
  it('navigates employee after valid login', () => {
    service.loginRequest.and.returnValue(of({_id:'u1',username:'alice',role:2} as any))
    component.login()
    expect(router.navigate).toHaveBeenCalledWith(['/employee'])
  })
})
