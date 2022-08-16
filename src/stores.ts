import type { ConfigAction } from '@smui/snackbar/kitchen'
import { writable, type Writable } from 'svelte/store'

export const createSnackbar: Writable<
    (message: string, actions?: ConfigAction[]) => void
> = writable(() => {})

export enum SchemeKind {
    Light,
    Dark,
    System,
}
export const colorScheme = writable(SchemeKind.System)
export const darkTheme = writable(false)

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
export const config: Writable<{ [key: string]: string }> =
    writable(parsedConfig)
