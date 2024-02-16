import { globalTournamentSettings } from "./tournaments"

export interface Lan {
    name: string
    motd: string
    startDate: DateType
    endDate: DateType
    newUsersByAdminOnly: boolean
    authenticationNeeded: boolean
    globalTournamentDefaultSettings: globalTournamentSettings
    showPartialResults: boolean
    weightTeamsResults: boolean
    showTeamsResults: boolean
}

export interface DateType {
    day: number
    hour: number
    min: number
}
