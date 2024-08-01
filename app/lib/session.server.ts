import { createCookieSessionStorage, redirect } from "@remix-run/node"
import { getLan } from "./persistence/lan.server"
import { getUserById } from "./persistence/users.server"
import { User } from "./types/user"

const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
    throw new Error("SESSION_SECRET must be set")
}

const secureStorage =
    createCookieSessionStorage(
        {
            // a Cookie from `createCookie` or the CookieOptions to create one
            cookie: {
                name: "oozturn_session",
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 7,
                path: "/",
                sameSite: "lax",
                secrets: [sessionSecret],
                secure: process.env.NODE_ENV === "production",
            },
        }
    )

async function getSession(request: Request) {
    return await secureStorage.getSession(
        request.headers.get("Cookie")
    )
}

export async function createSessionWithUser(user: User) {
    const session = await secureStorage.getSession()
    session.set("userId", user.id)
    session.set("username", user.username)
    session.set("auth", "username")
    return await secureStorage.commitSession(session)
}

export async function destroySession(request: Request) {
    const session = await getSession(request)
    return await secureStorage.destroySession(session)
}

export async function updateSessionWithAdminElevation(request: Request) {
    const session = await getSession(request)
    session.set("admin", true)
    return await secureStorage.commitSession(session)
}

export async function updateSessionWithPasswordAuth(request: Request) {
    const session = await getSession(request)
    session.set("auth", "password")
    return await secureStorage.commitSession(session)
}

export async function isUserLoggedIn(request: Request) {
    const session = await getSession(request)
    if (getLan().authenticationNeeded) {
        return session.has("userId")
            && session.get("auth") === "password"
    }
    return session.has("userId")
}

export async function isUserAdmin(request: Request): Promise<boolean> {
    const session = await getSession(request)
    return !!session.get("admin")
}

export async function getUserId(request: Request): Promise<string | undefined> {
    const session = await getSession(request)
    return session.get("userId")
}

export async function getUserFromRequest(request: Request): Promise<User | undefined> {
    const userId = await getUserId(request)
    if(userId) {
        return getUserById(userId)
    }
}

export async function requireUserLoggedIn(request: Request) {
    const userLoggedIn = await isUserLoggedIn(request)
    if (!userLoggedIn) {
        throw redirect('/login')
    }
    return await getUserId(request) as string
}

export async function requireUserAdmin(request: Request) {
    await requireUserLoggedIn(request)
    const userIdAdmin = await isUserAdmin(request)
    if (!userIdAdmin) {
        throw redirect('/admin/login')
    }
}