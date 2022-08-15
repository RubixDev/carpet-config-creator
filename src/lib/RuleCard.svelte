<script lang="ts">
    import Paper, { Title, Subtitle, Content } from '@smui/paper'
    import type { PaperComponentDev } from '@smui/paper'
    import RuleEditor from './RuleEditor.svelte'

    export let name: string
    export let description: string
    export let type: string
    export let value: string
    export let strict: boolean
    export let categories: string[]
    export let options: string[] | null
    export let extras: string[] | null
    export let validators: string[]
    export let repo: string
    export let branches: string[]
    export let id: string

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
    window.addEventListener(
        'scroll',
        () => {
            if (checkVisible(card.getElement()) && dummy) {
                dummy = false
            } else if (!checkVisible(card.getElement()) && !dummy) {
                height = card.getElement().getBoundingClientRect().height
                card.getElement().getBoundingClientRect()
                dummy = true
            }
        },
        { passive: true },
    )

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
                    {@html categories
                        .map(category => `<code>${category}</code>`)
                        .join(', ')}
                </div>

                {#if options !== null && options.length !== 0}
                    <strong>{strict ? 'Required' : 'Suggested'} Options:</strong
                    >
                    <div>
                        {@html options
                            .map(option => `<code>${option}</code>`)
                            .join(', ')}
                    </div>
                {/if}

                {#if validators.length !== 0}
                    <strong>Additional&nbsp;Notes:</strong>
                    <ul>
                        {#each validators as note}
                            <li>{@html simpleMd(note)}</li>
                        {/each}
                    </ul>
                {/if}

                <strong>Repository:</strong>
                <div>
                    <!-- TODO: gitlab -->
                    <a href="https://github.com/{repo}" target="_blank"
                        >{repo}</a
                    >
                </div>

                <strong>Branches:</strong>
                <div>
                    {@html branches
                        .map(
                            branch =>
                                `<a href="https://github.com/${repo}/tree/${branch}" target="_blank">${branch}</a>`,
                        )
                        .join(', ')}
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
