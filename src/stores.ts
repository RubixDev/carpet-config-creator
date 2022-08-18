import type { ConfigAction } from '@smui/snackbar/kitchen'
import { writable, derived, type Writable, type Readable } from 'svelte/store'
import otherConfigFiles from './lib/other-config-files'

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
    configFiles: string[]
}
export const allRules: Writable<Rule[]> = writable([])

interface Config {
    [configFile: string]: {
        [id: string]: string
    }
}
const localConfig = window.localStorage.getItem('config')
let parsedConfig: Config = {}
if (localConfig != null && localConfig != undefined) {
    parsedConfig = JSON.parse(localConfig)
    if (typeof Object.values(parsedConfig)[0] === 'string') parsedConfig = {}
}
export const config: Writable<Config> = writable(parsedConfig)
export const configFile = writable('carpet.conf')
export const currentConfig: Readable<{ [id: string]: string }> = derived(
    [config, configFile],
    ([conf, file]) => conf[file] || {},
)

export const configFiles = [
    ...new Set([
        'carpet.conf',
        ...Object.values(otherConfigFiles)
            .flat()
            .map(f => f + '.conf'),
    ]),
]
