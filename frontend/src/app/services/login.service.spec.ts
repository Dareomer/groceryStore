import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { LoginService } from './login.service'

describe('LoginService', () => {
  let service: LoginService
  let http: HttpTestingController
  const base = 'http://localhost:4000'

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [LoginService, provideHttpClient(), provideHttpClientTesting()]
    })
    service = TestBed.inject(LoginService)
    http = TestBed.inject(HttpTestingController)
  })
  afterEach(() => http.verify())

  it('login: sends credentials and accepts a valid response', () => {
    const user = { _id:'1', username:'alice', email:'a@test.com', role:1, department:'d1' }
    let result: any
    service.loginRequest('alice', 'Secret1!').subscribe(v => result = v)
    const req = http.expectOne(base + '/login')
    expect(req.request.method).toBe('POST')
    expect(req.request.withCredentials).toBeTrue()
    expect(req.request.body).toEqual({username:'alice', password:'Secret1!'})
    req.flush(user)
    expect(result._id).toBe('1')
  })

  it('login: passes 401 into error callback', () => {
    let status = 0
    service.loginRequest('alice', 'wrong').subscribe({
      error: e => status = e.status
    })
    http.expectOne(base + '/login').flush(
      {message:'Invalid username or password'},
      {status:401,statusText:'Unauthorized'}
    )
    expect(status).toBe(401)
  })

  it('session: returns current user', () => {
    let role = 0
    service.checkSession().subscribe(u => role = u.role)
    const req = http.expectOne(base + '/me')
    expect(req.request.withCredentials).toBeTrue()
    req.flush({_id:'1', username:'a', role:2})
    expect(role).toBe(2)
  })

  it('session: reports unauthenticated request', () => {
    let status = 0
    service.checkSession().subscribe({error:e=>status=e.status})
    http.expectOne(base + '/me').flush('Unauthorized',{status:401,statusText:'Unauthorized'})
    expect(status).toBe(401)
  })

  it('logout: posts with credentials and succeeds on 204', () => {
    let succeeded = false
    service.logout().subscribe(()=>succeeded=true)
    const req = http.expectOne(base + '/logout')
    expect(req.request.method).toBe('POST')
    expect(req.request.withCredentials).toBeTrue()
    req.flush(null,{status:204,statusText:'No Content'})
    expect(succeeded).toBeTrue()
  })

  it('logout: propagates server errors', () => {
    let status = 0
    service.logout().subscribe({error:e=>status=e.status})
    http.expectOne(base + '/logout').flush('Server error',{status:500,statusText:'Server Error'})
    expect(status).toBe(500)
  })
})
