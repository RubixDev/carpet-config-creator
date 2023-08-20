<script lang="ts">
    import Paper, { Title, Subtitle, Content } from '@smui/paper'
    import type { PaperComponentDev } from '@smui/paper'
    import { onMount, onDestroy } from 'svelte'
    import RuleEditor from './RuleEditor.svelte'

    export let id: string
    export let name: string
    export let description: string
    export let type: string
    export let value: string
    export let strict: boolean
    export let categories: string[]
    export let options: string[]
    export let extras: string[] | null = null
    export let validators: string[] | null = null
    export let config_files: string[]
    export let mod_name: string
    export let mod_slug: string
    export let mod_url: string
    export let minecraft_versions: string[]
    export let version_urls: string[]

    function checkVisible(elem: HTMLElement) {
        const rect = elem.getBoundingClientRect()
        const viewHeight = Math.max(
            document.documentElement.clientHeight,
            window.innerHeight,
        )
        return !(rect.bottom < -viewHeight || rect.top - 2 * viewHeight >= 0)
    }

    let card: PaperComponentDev
    let dummy = false
    let height = 0
    function onScroll() {
        if (checkVisible(card.getElement()) && dummy) {
            dummy = false
        } else if (!checkVisible(card.getElement()) && !dummy) {
            height = card.getElement().getBoundingClientRect().height
            card.getElement().getBoundingClientRect()
            dummy = true
        }
    }
    onMount(() =>
        window.addEventListener('scroll', onScroll, { passive: true }),
    )
    onDestroy(() => window.removeEventListener('scroll', onScroll))

    function simpleMd(md: string): string {
        return md
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(
                /\[([^\]]+)]\(([^)]+)\)/g,
                '<a href="$2" target="_blank">$1</a>',
            )
            .replace(/`([^`]+)`/g, '<code>$1</code>')
    }
</script>

<Paper
    bind:this={card}
    style="background-color: var(--clr-height-0-4);"
    elevation={4}
>
    {#if dummy}
        <div style="height: calc({height}px - 3rem);" />
    {:else}
        <Title><code class="title">{name}</code></Title>
        <Subtitle><p>{@html simpleMd(description)}</p></Subtitle>
        <Content>
            <p>
                {#each extras || [] as extra}
                    <div>{@html simpleMd(extra)}</div>
                {/each}
            </p>
            <div class="rule-info-table">
                <strong>Type:</strong>
                <div><code>{type}</code></div>

                <strong>Default&nbsp;Value:</strong>
                <div><code>{value}</code></div>

                <strong>Categories:</strong>
                <div>
                    {#each categories as category, index}<code>{category}</code
                        >{#if index !== categories.length - 1}, {/if}{/each}
                </div>

                {#if options.length !== 0}
                    <strong>{strict ? 'Required' : 'Suggested'} Options:</strong
                    >
                    <div>
                        {#each options as option, index}<code>{option}</code
                            >{#if index !== options.length - 1}, {/if}{/each}
                    </div>
                {/if}

                {#if (validators || []).length !== 0}
                    <strong>Additional&nbsp;Notes:</strong>
                    <ul>
                        {#each validators as note}
                            <li>{@html simpleMd(note)}</li>
                        {/each}
                    </ul>
                {/if}

                <strong>Mod:</strong>
                <div>
                    <a href={mod_url} target="_blank" title={mod_slug}
                        >{mod_name}</a
                    >
                </div>

                <strong>MC Versions:</strong>
                <div>
                    {#each minecraft_versions as version, index}<a
                            href={version_urls[index]}>{version}</a
                        >{#if index !== minecraft_versions.length - 1},
                        {/if}{/each}
                </div>

                <strong>Config Files:</strong>
                <div>
                    {#each config_files as file, index}<code>{file}</code
                        >{#if index !== config_files.length - 1}, {/if}{/each}
                </div>

                <div class="current"><strong>Current&nbsp;Value:</strong></div>
                <RuleEditor
                    {type}
                    defaultValue={value}
                    {strict}
                    {options}
                    {id}
                />
            </div>
        </Content>
    {/if}
</Paper>

<style lang="scss">
    .title {
        overflow-wrap: anywhere;
    }

    a {
        overflow-wrap: anywhere;
    }

    .rule-info-table {
        display: grid;
        grid-template-columns: 1fr 2fr;
        gap: 0.4rem;

        ul {
            margin: 0;
            padding-inline-start: 1.25rem;
        }

        :global code {
            background-color: var(--clr-code-bg);
            max-width: fit-content;
            padding: 0.1rem 0.5rem;
            border-radius: 0.2rem;
        }

        .current {
            display: grid;
            align-items: center;
        }

        & > *:nth-child(even) {
            overflow-wrap: anywhere;
        }
    }
</style>
