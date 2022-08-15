import { writable, type Writable } from 'svelte/store'

export enum SchemeKind {
    Light,
    Dark,
    System,
}
export let colorScheme = writable(SchemeKind.System)
export let darkTheme = writable(false)

export interface Rule {
    name: string
    description: string
    type: string
    value: string
    strict: boolean
    categories: string[]
    options: string[] | null
    extras: string[] | null
    validators: string[]
    repo: string
    branches: string[]
    id: string
}
export const allRules: Writable<Rule[]> = writable([])

const localConfig = window.localStorage.getItem('config')
let parsedConfig: { [key: string]: string } = {}
if (localConfig != null && localConfig != undefined) {
    parsedConfig = JSON.parse(localConfig)
}
export let config: Writable<{ [key: string]: string }> = writable(parsedConfig)
