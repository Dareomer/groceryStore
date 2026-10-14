import { TestBed } from '@angular/core/testing'
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router'
import { of, throwError, firstValueFrom, Observable } from 'rxjs'
import { authGuard } from './auth.guard'
import { LoginService } from '../services/login.service'

describe('authGuard', () => {
  let login: jasmine.SpyObj<LoginService>
  let router: jasmine.SpyObj<Router>
  beforeEach(() => {
    login = jasmine.createSpyObj<LoginService>('LoginService', ['checkSession'])
    router = jasmine.createSpyObj<Router>('Router', ['parseUrl'])
    router.parseUrl.and.callFake(path => ({redirectTo:path} as unknown as UrlTree))
    TestBed.configureTestingModule({providers:[
      {provide:LoginService,useValue:login},
      {provide:Router,useValue:router}
    ]})
  })

  async function check(path:string, role:number|undefined, sessionRole:number|null):Promise<any> {
    const route = {routeConfig:{path}, data: role===undefined?{}:{role}} as unknown as ActivatedRouteSnapshot
    const state = {url:'/'+path} as RouterStateSnapshot
    login.checkSession.and.returnValue(sessionRole===null ?
      throwError(()=>({status:401})) :
      of({_id:'u1', username:'a', role:sessionRole} as any))
    const result = TestBed.runInInjectionContext(()=>authGuard(route,state))
    return firstValueFrom(result as Observable<any>)
  }

  it('allows manager into manager page', async () => {
    expect(await check('manager',1,1)).toBeTrue()
  })
  it('redirects employee away from manager page', async () => {
    expect((await check('manager',1,2)).redirectTo).toBe('/employee')
  })
  it('allows employee into employee page', async () => {
    expect(await check('employee',2,2)).toBeTrue()
  })
  it('redirects manager away from employee page', async () => {
    expect((await check('employee',2,1)).redirectTo).toBe('/manager')
  })
  it('allows manager into change-user route', async () => {
    expect(await check('manager/change/:id',1,1)).toBeTrue()
  })
  it('redirects employee away from change-user route', async () => {
    expect((await check('manager/change/:id',1,2)).redirectTo).toBe('/employee')
  })
  it('redirects authenticated user away from login', async () => {
    expect((await check('login',undefined,1)).redirectTo).toBe('/manager')
  })
  it('allows unauthenticated user into login', async () => {
    expect(await check('login',undefined,null)).toBeTrue()
  })
  it('redirects unauthenticated user from protected route', async () => {
    expect((await check('manager',1,null)).redirectTo).toBe('/login')
  })
})
