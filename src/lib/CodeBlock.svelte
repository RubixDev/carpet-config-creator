<script lang="ts">
    import Fab, { Icon } from '@smui/fab'
    import { createSnackbar } from '../stores'

    export let content: string

    async function copyContent() {
        console.log('copying config to clipboard')
        try {
            await navigator.clipboard.writeText(content)
            $createSnackbar('Copied config content to clipboard')
        } catch (err) {
            console.error('could not copy config:', err)
            $createSnackbar('Could not copy config: ' + err)
        }
    }
</script>

<div>
    <pre>{content}</pre>
    <Fab
        class="material-icons"
        color="primary"
        mini
        id="copy-button"
        on:click={copyContent}
    >
        <Icon class="material-icons">content_copy</Icon>
    </Fab>
</div>

<style lang="scss">
    pre {
        display: block;
        padding: 1rem;
        background-color: var(--clr-height-0-4);
        border-radius: 0.5rem;
    }

    div {
        position: relative;
    }

    :global #copy-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
    }
</style>
