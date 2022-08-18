<script lang="ts">
    import Select, { Option } from '@smui/select'
    import Textfield from '@smui/textfield'
    import Icon from '@smui/textfield/icon'
    import { configFile, allRules, type Rule } from '../stores'
    import otherConfigFiles from './other-config-files'

    export let filteredRules: Rule[] = []

    const configFiles = [
        ...new Set([
            'carpet.conf',
            ...Object.values(otherConfigFiles)
                .flat()
                .map(f => f + '.conf'),
        ]),
    ]
    let search = ''

    filterRules()
    $: search, $configFile, filterRules()
    function filterRules() {
        filteredRules = $allRules.filter(
            rule =>
                rule.configFiles.includes($configFile) &&
                rule.name.toLowerCase().includes(search.toLowerCase()),
        )
    }
</script>

<div id="filter" class="mdc-elevation--z4">
    <!-- TODO: advanced filters -->
    <Select bind:value={$configFile} variant="outlined" label="Config File">
        {#each configFiles as file}
            <Option value={file}>{file}</Option>
        {/each}
    </Select>
    <Textfield variant="outlined" bind:value={search} label="Search by name">
        <Icon class="material-icons" slot="leadingIcon">search</Icon>
    </Textfield>
</div>

<style lang="scss">
    #filter {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.5rem;
        box-sizing: border-box;
        border-radius: 0.25rem;
        background-color: var(--clr-height-0-4);
    }
</style>
