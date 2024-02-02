import { logger } from "~/lib/logging/logging"
import { dbFolderPath, subscribeObjectManager } from "./db.server"
import * as fs from 'fs'
import * as path from 'path'

declare global {
    var users: User[]
}

export interface User {
    username: string,
    avatar: string,
    team: string,
    isAdmin: boolean,
    ips: string[]
}

const usersFilePath = path.join(dbFolderPath, 'users.json')

subscribeObjectManager("users", {
    onRestore: () => {
        if (global.users) {
            return;
        }

        if (fs.existsSync(usersFilePath)) {
            global.users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'))
        } else {
            logger.info("Initialise users")
            global.users = []
        }
    },
    onStore: () => {
        fs.writeFileSync(usersFilePath, JSON.stringify(global.users, null, 2), 'utf-8')
    }
})

export function getUsers() {
    return global.users
}

export function getUser(username: string) {
    return global.users.find(user => user.username == username)
}

export function registerNewUser(username: string) {
    const user: User = { username: username, avatar: "", team: "", isAdmin: false, ips: [] }
    global.users.push(user)
    return user
}

export function updateUser(username: string, partialUser: Partial<User>) {
    let userIndex = global.users.findIndex(user => user.username == username)
    if (userIndex != -1) {
        global.users[userIndex] = { ...global.users[userIndex], ...partialUser }
    }
}