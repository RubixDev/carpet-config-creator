import type { ConfigAction } from '@smui/snackbar/kitchen'
import { writable, derived, type Writable, type Readable } from 'svelte/store'

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
    id: string
    name: string
    description: string
    type: string
    value: string
    strict: boolean
    categories: string[]
    options: string[]
    extras?: string[]
    validators?: string[]
    config_files: string[]
    mod_name: string
    mod_slug: string
    mod_url: string
    minecraft_versions: string[]
    version_urls: string[]
}
export const allRules: Writable<Rule[]> = writable([])
export const categories = derived(allRules, rules =>
    [...new Set(rules.flatMap(r => r.categories))].sort(),
)
export const mods = derived(allRules, rules =>
    [...new Set(rules.map(r => r.mod_name))].sort(),
)
export const mod_slugs = derived(allRules, rules =>
    [...new Set(rules.map(r => r.mod_slug))].sort(),
)
export const mcVersions = derived(allRules, rules =>
    [...new Set(rules.flatMap(r => r.minecraft_versions))].sort(),
)
export const configFiles = derived(allRules, rules =>
    [...new Set(rules.flatMap(r => r.config_files))].sort(),
)

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
