import { CanActivateFn, Router } from '@angular/router'
import { LoginService } from '../services/login.service'
import { inject } from '@angular/core'
import { catchError, map, of } from 'rxjs'

export const authGuard: CanActivateFn = (route, state) => {
  const service = inject(LoginService)
  const router = inject(Router)

  const isLoginPage = route.routeConfig?.path=="login"

  return service.checkSession().pipe(
    map(user=>{
      const home=user.role==1 ? "/manager" : user.role==2 ? "/employee" : "/login"

      if(isLoginPage)
      {
        return router.parseUrl(home)
      }
      if(route.data["role"]==user.role)
      {
        return true
      }
      return router.parseUrl(home)
    }),
    catchError(()=> of(isLoginPage?true:router.parseUrl("/login")))
  )
}
