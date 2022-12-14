<script lang="ts">
    import Autocomplete from '@smui-extra/autocomplete'
    import Select, { Option } from '@smui/select'
    import Textfield from '@smui/textfield'
    import Icon from '@smui/textfield/icon'
    import Chip, { Set as ChipSet, Text, TrailingAction } from '@smui/chips'
    import IconButton from '@smui/icon-button'
    import {
        configFile,
        allRules,
        type Rule,
        categories,
        repos,
        branches,
        currentConfig,
    } from '../stores'
    import otherConfigFiles from './other-config-files'

    export let filteredRules: Rule[] = []
    let ruleCount = 0

    const configFiles = [
        ...new Set([
            'carpet.conf',
            ...Object.values(otherConfigFiles)
                .flat()
                .map(f => f + '.conf'),
        ]),
    ]
    let search = ''
    let descriptionSearch = ''
    let typeSearch = ''
    let repoSearch = ''
    let branchSearch = ''
    let searchModified: 'yes' | 'no' | 'any' = 'any'

    let categoryTemp = ''
    let searchCategories: string[] = []
    let otherCategories: string[]
    $: otherCategories = $categories.filter(c => !searchCategories.includes(c))

    // Read url query params
    const params = new URLSearchParams(window.location.search)
    if (params.get('search') !== null) search = params.get('search')
    if (params.get('file') !== null) $configFile = params.get('file')
    if (params.get('desc') !== null) descriptionSearch = params.get('desc')
    if (params.get('type') !== null) typeSearch = params.get('type')
    if (params.get('repo') !== null) repoSearch = params.get('repo')
    if (params.get('branch') !== null) branchSearch = params.get('branch')
    if (params.get('modified') !== null)
        searchModified = params.get('modified') as 'yes' | 'no' | 'any'
    if (params.get('categories') !== null)
        searchCategories = params.get('categories').split(',')

    function addCategory() {
        if (
            categoryTemp === '' ||
            categoryTemp === undefined ||
            searchCategories.includes(categoryTemp)
        )
            return
        searchCategories = [...searchCategories, categoryTemp]
        categoryTemp = ''
    }

    filterRules()
    $: search,
        $configFile,
        descriptionSearch,
        typeSearch,
        repoSearch,
        branchSearch,
        searchModified,
        searchCategories,
        filterRules()
    function filterRules() {
        // Update url query params
        const params = new URLSearchParams(
            [
                ['search', search],
                ['file', $configFile],
                ['desc', descriptionSearch],
                ['type', typeSearch],
                ['repo', repoSearch],
                ['branch', branchSearch],
                ['modified', searchModified],
                ['categories', searchCategories.join(',')],
            ].filter(p => p[1] !== ''),
        )
        history.pushState(
            null,
            '',
            window.location.pathname + '?' + params.toString(),
        )

        filteredRules = $allRules.filter(
            rule =>
                rule.configFiles.includes($configFile) &&
                rule.name.toLowerCase().includes(search.toLowerCase()) &&
                (rule.description
                    .toLowerCase()
                    .includes(descriptionSearch.toLowerCase()) ||
                    (rule.extras !== null &&
                        rule.extras.some(extra =>
                            extra
                                .toLowerCase()
                                .includes(descriptionSearch.toLowerCase()),
                        ))) &&
                rule.type.toLowerCase().includes(typeSearch.toLowerCase()) &&
                rule.repo.toLowerCase().includes(repoSearch.toLowerCase()) &&
                rule.branches.some(branch =>
                    branch.toLowerCase().includes(branchSearch.toLowerCase()),
                ) &&
                (searchModified === 'any' ||
                    (Object.keys($currentConfig).includes(rule.id) &&
                        searchModified === 'yes') ||
                    (!Object.keys($currentConfig).includes(rule.id) &&
                        searchModified === 'no')) &&
                searchCategories.every(category =>
                    rule.categories.includes(category),
                ),
        )
        ruleCount = filteredRules.length
    }
</script>

<div id="filter" class="mdc-elevation--z4">
    <div id="filter-title">
        <h5>Search</h5>
        <span>{ruleCount} result{ruleCount === 1 ? '' : 's'}</span>
    </div>

    <Select bind:value={$configFile} variant="outlined" label="Config File">
        {#each configFiles as file}
            <Option value={file}>{file}</Option>
        {/each}
    </Select>
    <Textfield variant="outlined" bind:value={search} label="Search by name">
        <Icon class="material-icons" slot="leadingIcon">search</Icon>
    </Textfield>

    <strong>Advanced Search</strong>
    <div id="advanced-filters">
        <Textfield
            bind:value={descriptionSearch}
            label="Description contents"
        />

        <Autocomplete
            combobox
            options={['boolean', 'String', 'int', 'long', 'float', 'double']}
            bind:value={typeSearch}
            label="Rule type"
        />

        <Autocomplete
            combobox
            options={$repos}
            bind:value={repoSearch}
            label="Repository"
        />

        <Autocomplete
            combobox
            options={$branches}
            bind:value={branchSearch}
            label="Branch"
        />

        <Select bind:value={searchModified} label="Modified">
            {#each ['yes', 'no', 'any'] as option}
                <Option value={option}>{option}</Option>
            {/each}
        </Select>
    </div>

    <div id="category-select">
        <Select bind:value={categoryTemp} label="Categories">
            {#each otherCategories as category}
                <Option value={category}>{category}</Option>
            {/each}
        </Select>
        <IconButton class="material-icons" on:click={addCategory}
            >add</IconButton
        >
    </div>
    <div id="selected-categories">
        {#if searchCategories.length === 0}
            <div id="no-selected-categories">No categories selected</div>
        {:else}
            <ChipSet bind:chips={searchCategories} let:chip input>
                <Chip {chip}>
                    <Text>{chip}</Text>
                    <TrailingAction icon$class="material-icons"
                        >cancel</TrailingAction
                    >
                </Chip>
            </ChipSet>
        {/if}
    </div>
</div>

<style lang="scss">
    #filter {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        padding: 1.5rem 1rem;
        box-sizing: border-box;
        border-radius: 0.25rem;
        background-color: var(--clr-height-0-4);

        #filter-title {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 1rem;

            & > h5 {
                margin: 0;
            }
            & > span {
                color: var(--clr-text-hint);
            }
        }
    }

    strong {
        margin-top: 2rem;
    }

    #advanced-filters {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;

        & > :global * {
            flex-grow: 1;
            @media screen and (min-width: 59rem) {
                min-width: 15rem;
            }
        }
    }

    #category-select {
        display: flex;
        align-items: center;
        & > :global *:first-child {
            width: 100%;
        }
    }

    #selected-categories {
        min-height: 3rem;

        #no-selected-categories {
            min-height: 3rem;
            color: var(--clr-text-hint);
            display: flex;
            align-items: center;
        }
    }
</style>
