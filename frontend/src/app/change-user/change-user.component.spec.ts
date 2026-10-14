import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { ChangeUserComponent } from './change-user.component'
import { UserService } from '../services/user.service'

describe('ChangeUserComponent', () => {
  let component:ChangeUserComponent
  let service:jasmine.SpyObj<UserService>
  let router:jasmine.SpyObj<Router>
  beforeEach(async () => {
    service=jasmine.createSpyObj('UserService',['getUser','getStores','updateUser','deleteUser'])
    router=jasmine.createSpyObj('Router',['navigate'])
    service.getUser.and.returnValue(of({_id:'u2',username:'alice',email:'a@test.com',department:'d1',role:2} as any))

    service.getStores.and.returnValue(of([{_id:'d1',name:'Srbija'} as any]))
    await TestBed.configureTestingModule({
      imports:[ChangeUserComponent],
      providers:[
        {provide:UserService,useValue:service},
        {provide:Router,useValue:router},
        {provide:ActivatedRoute,useValue:{snapshot:{paramMap:convertToParamMap({id:'u2'})}}}
      ]
    }).overrideComponent(ChangeUserComponent,{set:{template:''}}).compileComponents()
    component=TestBed.createComponent(ChangeUserComponent).componentInstance
  })
  it('initialization: gets selected user and stores', () => {
    component.ngOnInit()
    expect(service.getUser).toHaveBeenCalledWith('u2')
    expect(component.username).toBe('alice')
    expect(component.departments.length).toBe(1)
  })
  it('initialization: handles failed user load', () => {
    spyOn(console,'log')
    service.getUser.and.returnValue(throwError(()=>({status:403})))
    component.ngOnInit()
    expect(component.username).toBe('')
  })
  it('update: sends all changed fields and returns to manager', () => {
    component.ngOnInit()
    component.username='updated'
    service.updateUser.and.returnValue(of({message:'updated'}))
    component.update()
    expect(service.updateUser).toHaveBeenCalledWith('u2','updated','a@test.com','d1',2)
    expect(router.navigate).toHaveBeenCalledWith(['/manager'])
  })
  it('update: stays on page if backend rejects request', () => {
    spyOn(console,'log')
    component.ngOnInit()
    service.updateUser.and.returnValue(throwError(()=>({status:409,error:{message:"Username or email already exists"}})))
    component.update()
    expect(router.navigate).not.toHaveBeenCalled()
  })
  it('delete: calls API and navigates after confirmation', () => {
    spyOn(window,'confirm').and.returnValue(true)
    component.ngOnInit()
    service.deleteUser.and.returnValue(of({message:'deleted'}))
    component.delete()
    expect(service.deleteUser).toHaveBeenCalledWith('u2')
    expect(router.navigate).toHaveBeenCalledWith(['/manager'])
  })
  it('delete: does nothing if user cancels confirmation', () => {
    spyOn(window,'confirm').and.returnValue(false)
    component.ngOnInit()
    component.delete()
    expect(service.deleteUser).not.toHaveBeenCalled()
  })
  it('cancel: navigates without API mutation', () => {
    component.cancel()
    expect(router.navigate).toHaveBeenCalledWith(['/manager'])
    expect(service.updateUser).not.toHaveBeenCalled()
    expect(service.deleteUser).not.toHaveBeenCalled()
  })
})
