import { TestBed } from '@angular/core/testing'
import { Router } from '@angular/router'
import { of, throwError } from 'rxjs'
import { ManagerComponent } from './manager.component'
import { LoginService } from '../services/login.service'
import { UserService } from '../services/user.service'

describe('ManagerComponent', () => {
  let component:ManagerComponent
  let user:jasmine.SpyObj<UserService>
  let login:jasmine.SpyObj<LoginService>
  let router:jasmine.SpyObj<Router>
  beforeEach(async () => {
    user=jasmine.createSpyObj('UserService',[
      'getStores','getEmployeesNode','getEmployeesDescendants',
      'getManagersNode','getManagersDescendants','insertUser'
    ])
    login=jasmine.createSpyObj('LoginService',['checkSession','logout'])
    router=jasmine.createSpyObj('Router',['navigate'])
    login.checkSession.and.returnValue(of({_id:'u1',role:1} as any))
    user.getStores.and.returnValue(of([]))
    await TestBed.configureTestingModule({
      imports:[ManagerComponent],
      providers:[
        {provide:UserService,useValue:user},
        {provide:LoginService,useValue:login},
        {provide:Router,useValue:router}
      ]
    }).overrideComponent(ManagerComponent,{set:{template:''}}).compileComponents()
    component=TestBed.createComponent(ManagerComponent).componentInstance
  })

  it('initialization: loads logged-in ID and departments', () => {
    user.getStores.and.returnValue(of([{_id:'d1',name:'Srbija'} as any]))
    component.ngOnInit()
    expect(component.currentId).toBe('u1')
    expect(component.departments[0].name).toBe('Srbija')
  })
  it('initialization: handles department load failure without data', () => {
    user.getStores.and.returnValue(throwError(()=>({status:500})))
    spyOn(console,'log')
    component.ngOnInit()
    expect(component.departments).toEqual([])
  })

  const lists = [
    {method:'getEmployeesNode',property:'employees'},
    {method:'getEmployeesDescendants',property:'employees'},
    {method:'getManagersNode',property:'managers'},
    {method:'getManagersDescendants',property:'managers'}
  ] as const
  for (const item of lists) {
    it(item.method + ': stores returned users', () => {
      (user[item.method] as jasmine.Spy).and.returnValue(of([{_id:'u2',username:'test'} as any]))
      (component[item.method] as ()=>void).call(component)
      expect((component[item.property] || [])[0]._id).toBe('u2')
    })
    it(item.method + ': does not replace list on failed request', () => {
      spyOn(console,'error')
      (user[item.method] as jasmine.Spy).and.returnValue(throwError(()=>({status:500})))
      (component[item.method] as ()=>void).call(component)
      expect(component[item.property]).toBeNull()
    })
  }
  it('changeUser: navigates to selected ID', () => {
    component.changeUser('u2')
    expect(router.navigate).toHaveBeenCalledWith(['/manager/change','u2'])
  })
  it('insertUser: displays success message and resets inputs', () => {
    component.newUsername='test'
    component.newPassword='Secret1!'
    component.newEmail='a@test.com'
    component.newDepartment='d1'
    component.newRole=2
    user.insertUser.and.returnValue(of({message:'User inserted successfully!'}))
    component.insertUser()
    expect(user.insertUser).toHaveBeenCalledWith('test','Secret1!','a@test.com','d1',2)
    expect(component.insertSuccesMessage).toContain('successfully')
    expect(component.newUsername).toBe('')
  })
  it('insertUser: handles conflict without falsely reporting success', () => {
    spyOn(console,'log')
    user.insertUser.and.returnValue(throwError(()=>({status:409,error:{message:'Username already exists'}})))
    component.insertUser()
    expect(component.insertSuccesMessage).toBe('Username already exists')
    expect(component.successColor).toBe('red')
  })
  it('logout: redirects on success', () => {
    login.logout.and.returnValue(of({}))
    component.logout()
    expect(router.navigate).toHaveBeenCalledWith(['/login'])
  })
  it('logout: does not redirect on failure', () => {
    spyOn(console,'error')
    login.logout.and.returnValue(throwError(()=>({status:500})))
    component.logout()
    expect(router.navigate).not.toHaveBeenCalled()
  })
})
