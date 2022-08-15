import { writable, type Writable } from 'svelte/store'

export enum SchemeKind {
    Light,
    Dark,
    System,
}
export let colorScheme = writable(SchemeKind.System)
export let darkTheme = writable(false)

const localConfig = window.localStorage.getItem('config')
let parsedConfig: { [key: string]: string } = {}
if (localConfig != null && localConfig != undefined) {
    parsedConfig = JSON.parse(localConfig)
}
export let config: Writable<{ [key: string]: string }> = writable(parsedConfig)
