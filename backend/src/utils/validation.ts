

export function validRole(role: number): boolean {
    return role === 1 || role === 2
}

export function validUserInput(username: string, password: string, email: string): boolean {
    return Boolean(
        username?.trim() &&
        password?.trim() &&
        email?.trim()
    )
}