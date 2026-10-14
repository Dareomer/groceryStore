import { TestBed } from '@angular/core/testing'
import { provideHttpClient } from '@angular/common/http'
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing'
import { UserService } from './user.service'

describe('UserService', () => {
  let service: UserService
  let http: HttpTestingController
  const base = 'http://localhost:4000/user'
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [UserService, provideHttpClient(), provideHttpClientTesting()]
    })
    service = TestBed.inject(UserService)
    http = TestBed.inject(HttpTestingController)
  })
  afterEach(() => http.verify())

  const listings = [
    { name:'employees node', path:'/employees/node', call:(s:UserService)=>s.getEmployeesNode() },
    { name:'employees descendants', path:'/employees/descendants', call:(s:UserService)=>s.getEmployeesDescendants() },
    { name:'managers node', path:'/managers/node', call:(s:UserService)=>s.getManagersNode() },
    { name:'managers descendants', path:'/managers/descendants', call:(s:UserService)=>s.getManagersDescendants() }
  ]
  for (const item of listings) {
    it(item.name + ': returns a user list', () => {
      let users: any[] = []
      item.call(service).subscribe(v => users = v)
      const req = http.expectOne(base + item.path)
      expect(req.request.method).toBe('GET')
      expect(req.request.withCredentials).toBeTrue()
      req.flush([{_id:'u1',username:'a',role:2}])
      expect(users.length).toBe(1)
    })
    it(item.name + ': propagates 401', () => {
      let status = 0
      item.call(service).subscribe({error:e=>status=e.status})
      http.expectOne(base + item.path).flush('',{status:401,statusText:'Unauthorized'})
      expect(status).toBe(401)
    })
  }

  it('getUser: uses selected ID and returns user', () => {
    let id = ''
    service.getUser('u1').subscribe(u=>id=u._id)
    const req=http.expectOne(base+'/change/u1')
    expect(req.request.withCredentials).toBeTrue()
    req.flush({_id:'u1',username:'alice',role:2})
    expect(id).toBe('u1')
  })
  it('getUser: propagates forbidden response', () => {
    let status=0
    service.getUser('u1').subscribe({error:e=>status=e.status})
    http.expectOne(base+'/change/u1').flush('',{status:403,statusText:'Forbidden'})
    expect(status).toBe(403)
  })

  it('getStores: returns department list', () => {
    let stores:any[]=[]
    service.getStores().subscribe(v=>stores=v)
    const req=http.expectOne(base+'/change/stores')
    expect(req.request.withCredentials).toBeTrue()
    req.flush([{_id:'d1',name:'Srbija',parentId:null,parents:[]}])
    expect(stores[0].name).toBe('Srbija')
  })
  it('getStores: propagates forbidden response', () => {
    let status=0
    service.getStores().subscribe({error:e=>status=e.status})
    http.expectOne(base+'/change/stores').flush('',{status:403,statusText:'Forbidden'})
    expect(status).toBe(403)
  })

  it('updateUser: sends only editable fields', () => {
    let success=false
    service.updateUser('u1','alice','a@test.com','d1',1).subscribe(()=>success=true)
    const req=http.expectOne(base+'/change/u1')
    expect(req.request.method).toBe('PUT')
    expect(req.request.withCredentials).toBeTrue()
    expect(req.request.body).toEqual({username:'alice',email:'a@test.com',department:'d1',role:1})
    req.flush({message:'User updated successfully'})
    expect(success).toBeTrue()
  })
  it('updateUser: propagates duplicate error with message', () => {
    let message=''
    service.updateUser('u1','alice','a@test.com','d1',1).subscribe({error:e=>message=e.error.message})
    http.expectOne(base+'/change/u1').flush({message:'Username or email already exists'}, {status:409,statusText:'Conflict'})
    expect(message).toContain('already exists')
  })

  it('deleteUser: sends DELETE and accepts success', () => {
    let success=false
    service.deleteUser('u1').subscribe(()=>success=true)
    const req=http.expectOne(base+'/change/u1')
    expect(req.request.method).toBe('DELETE')
    expect(req.request.withCredentials).toBeTrue()
    req.flush({message:'User deleted successfully'})
    expect(success).toBeTrue()
  })
  it('deleteUser: propagates 403', () => {
    let status=0
    service.deleteUser('u1').subscribe({error:e=>status=e.status})
    http.expectOne(base+'/change/u1').flush('',{status:403,statusText:'Forbidden'})
    expect(status).toBe(403)
  })

  it('insertUser: posts all fields and reads success message', () => {
    let message=''
    service.insertUser('alice','Secret1!','a@test.com','d1',2).subscribe(v=>message=v.message)
    const req=http.expectOne(base+'/insert')
    expect(req.request.method).toBe('POST')
    expect(req.request.withCredentials).toBeTrue()
    expect(req.request.body).toEqual({username:'alice',password:'Secret1!',email:'a@test.com',department:'d1',role:2})
    req.flush({message:'User inserted successfully'},{status:201,statusText:'Created'})
    expect(message).toBe('User inserted successfully')
  })
  it('insertUser: propagates duplicate message', () => {
    let message=''
    service.insertUser('alice','Secret1!','a@test.com','d1',2).subscribe({error:e=>message=e.error.message})
    http.expectOne(base+'/insert').flush({message:'Username or email already exists'},{status:409,statusText:'Conflict'})
    expect(message).toContain('already exists')
  })
})
