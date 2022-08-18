<script lang="ts">
    import Fab, { Icon } from '@smui/fab'
    import type { FabComponentDev } from '@smui/fab'
    import CircularProgress from '@smui/circular-progress'
    import Kitchen from '@smui/snackbar/kitchen'
    import type {
        KitchenComponentDev,
        ConfigAction,
    } from '@smui/snackbar/kitchen'
    import { tick } from 'svelte'
    import {
        createSnackbar,
        colorScheme,
        darkTheme,
        SchemeKind,
        config,
        allRules,
        type Rule,
    } from './stores'
    import otherConfigFiles from './lib/other-config-files'
    import NavBar from './lib/NavBar.svelte'
    import RuleCard from './lib/RuleCard.svelte'
    import Filter from './lib/Filter.svelte'

    let scheme = window.localStorage.getItem('color-scheme')
    if (scheme == 'null' || scheme == 'undefined') scheme = 'System'
    $colorScheme =
        SchemeKind[scheme] !== undefined
            ? SchemeKind[scheme]
            : SchemeKind.System
    $: $darkTheme =
        $colorScheme === SchemeKind.Dark ||
        ($colorScheme === SchemeKind.System &&
            window.matchMedia('(prefers-color-scheme: dark)').matches)
    $: window.localStorage.setItem('color-scheme', SchemeKind[$colorScheme])

    let filteredRules: Rule[] = []
    let renderedRules: Rule[] = []
    let showSpinner = true

    async function fetchRules() {
        const res = await fetch(
            'https://carpet-rules.crec.dev/data/parsed_data.json',
        )
        $allRules = (await res.json()).map((rule: Rule) => {
            const isBool = rule.type === 'boolean'
            const overrideStrict =
                rule.strict && (rule.options || []).length === 0
            return {
                ...rule,
                // Lowercase and strip trailing 'f', 'd' or 'l' from numbers
                value: rule.value
                    .toLowerCase()
                    .replace(/^(\d+(\.\d+)?)[lfd]$/, '$1'),
                strict: isBool ? true : overrideStrict ? false : rule.strict,
                options: isBool
                    ? ['true', 'false']
                    : overrideStrict
                    ? [rule.value]
                    : rule.options,
                id: rule.name + '|||' + rule.repo + rule.branches.join(),
                configFiles: (otherConfigFiles[rule.repo] || ['carpet']).map(
                    (f: string) => f + '.conf',
                ),
            }
        })
        $allRules.sort((a, b) => a.name.localeCompare(b.name))
    }

    $: filteredRules, renderRules()
    function renderRules() {
        renderedRules = filteredRules.splice(0, 1)
        tick().then(() => onScroll(true))
    }

    $: showSpinner = filteredRules.length > 0 || $allRules.length === 0

    let toTopButton: FabComponentDev
    let toTopButtonShown = false

    function onScroll(initial = false) {
        if (
            2 * window.innerHeight + window.scrollY >=
                document.body.offsetHeight &&
            filteredRules.length > 0
        ) {
            renderedRules = [...renderedRules, ...filteredRules.splice(0, 1)]
            if (initial) tick().then(() => onScroll(true))
        }
        toTopButtonShown = window.scrollY >= 50
    }
    window.addEventListener('scroll', () => onScroll(), { passive: true })
    $: if (toTopButtonShown) {
        let button = toTopButton.getElement() as HTMLButtonElement
        button.style.display = 'block'
        setTimeout(() => (button.style.opacity = '1'), 100)
    } else if (toTopButton !== undefined) {
        let button = toTopButton.getElement() as HTMLButtonElement
        button.style.opacity = '0'
        setTimeout(() => (button.style.display = 'none'), 200)
    }

    $: window.localStorage.setItem('config', JSON.stringify($config))

    let kitchen: KitchenComponentDev
    $createSnackbar = (message: string, actions?: ConfigAction[]) => {
        kitchen.push({
            label: message,
            dismissButton: true,
            actions,
        })
    }
</script>

<svelte:head>
    {#if $darkTheme}
        <link rel="stylesheet" href="/theme-dark.css" />
    {/if}
</svelte:head>
<NavBar />
<div id="rule-container">
    {#await fetchRules() then}
        <Filter bind:filteredRules />
        {#each renderedRules as rule (rule.id)}
            <RuleCard {...rule} />
        {/each}
    {/await}
    <div id="spinner-container">
        <CircularProgress
            id="spinner"
            class={showSpinner ? 'visible' : ''}
            indeterminate
        />
    </div>
</div>
<Fab
    id="to-top"
    color="primary"
    title="Back to Top"
    on:click={() => document.documentElement.scrollTo({ top: 0 })}
    bind:this={toTopButton}
>
    <Icon class="material-icons">expand_less</Icon>
</Fab>

<Kitchen bind:this={kitchen} dismiss$class="material-icons" />

<style lang="scss">
    #rule-container {
        display: grid;
        margin: auto;
        padding: 5rem 1rem;
        gap: 1rem;
        max-width: 60rem;

        #spinner-container {
            display: flex;
            justify-content: center;
        }

        :global #spinner {
            width: 4rem;
            height: 4rem;
            opacity: 0;
            transition-property: opacity;
            transition-duration: 200ms;

            &.visible {
                opacity: 1;
            }
        }
    }

    :global #to-top {
        position: fixed;
        bottom: 3rem;
        right: 3rem;
        opacity: 0;
        transition-property: opacity;
        transition-duration: 200ms;
    }
</style>
