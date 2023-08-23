<script lang="ts">
    import Button, { Label, Icon as ButtonIcon } from '@smui/button'
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
        mods,
        mod_slugs,
        mcVersions,
        configFiles,
        currentConfig,
    } from '../stores'

    export let filteredRules: Rule[] = []
    let ruleCount = 0

    let search = ''
    let descriptionSearch = ''
    let typeSearch = ''
    let modSearch = ''
    let mcVersionSearch = 'any'
    let searchModified: 'yes' | 'no' | 'any' = 'any'

    let categoryTemp = ''
    let searchCategories: string[] = []
    let otherCategories: string[]
    $: otherCategories = $categories.filter(c => !searchCategories.includes(c))

    let resetAllButtonDisabled = true
    $: resetAllButtonDisabled =
        search === '' &&
        descriptionSearch === '' &&
        typeSearch === '' &&
        modSearch === '' &&
        mcVersionSearch === 'any' &&
        searchModified === 'any' &&
        searchCategories.length === 0
    function resetAll() {
        // TODO: this seems to not work great with the Autocomplete boxes
        search = ''
        descriptionSearch = ''
        typeSearch = ''
        modSearch = ''
        mcVersionSearch = 'any'
        searchModified = 'any'
        searchCategories = []
    }

    // Read url query params
    const params = new URLSearchParams(window.location.search)
    if (params.get('search') !== null) search = params.get('search')
    if (params.get('file') !== null) $configFile = params.get('file')
    if (params.get('desc') !== null) descriptionSearch = params.get('desc')
    if (params.get('type') !== null) typeSearch = params.get('type')
    if (params.get('mod') !== null) modSearch = params.get('mod')
    if (
        params.get('mc') !== null &&
        ['any', ...$mcVersions].includes(params.get('mc'))
    )
        mcVersionSearch = params.get('mc')
    if (
        params.get('modified') !== null &&
        ['yes', 'no', 'any'].includes(params.get('modified'))
    )
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
        modSearch,
        mcVersionSearch,
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
                ['mod', modSearch],
                ['mc', mcVersionSearch],
                ['modified', searchModified],
                ['categories', searchCategories.join(',')],
            ].filter(
                p =>
                    p[1] !== '' &&
                    !(p[0] === 'file' && p[1] === 'carpet.conf') &&
                    !(p[0] === 'mc' && p[1] === 'any') &&
                    !(p[0] === 'modified' && p[1] === 'any'),
            ),
        )
        const paramsString = params.toString()
        history.pushState(
            null,
            '',
            window.location.pathname +
                (paramsString === '' ? '' : '?' + paramsString),
        )

        // if the modSearch matches any mod name or slug exactly, only rules of that exact mod should be shown
        const modExactMatch =
            $mods.find(mod => mod.toLowerCase() === modSearch.toLowerCase()) ||
            $mod_slugs.find(
                slug => slug.toLowerCase() === modSearch.toLowerCase(),
            )
        filteredRules = $allRules.filter(
            rule =>
                rule.config_files.includes($configFile) &&
                rule.name.toLowerCase().includes(search.toLowerCase()) &&
                (rule.description
                    .toLowerCase()
                    .includes(descriptionSearch.toLowerCase()) ||
                    (rule.extras !== undefined &&
                        rule.extras.some(extra =>
                            extra
                                .toLowerCase()
                                .includes(descriptionSearch.toLowerCase()),
                        ))) &&
                rule.type.toLowerCase().includes(typeSearch.toLowerCase()) &&
                (modExactMatch !== undefined
                    ? rule.mod_name.toLowerCase() ===
                          modExactMatch.toLowerCase() ||
                      rule.mod_slug.toLowerCase() ===
                          modExactMatch.toLowerCase()
                    : rule.mod_name
                          .toLowerCase()
                          .includes(modSearch.toLowerCase()) ||
                      rule.mod_slug
                          .toLowerCase()
                          .includes(modSearch.toLowerCase())) &&
                (mcVersionSearch === 'any' ||
                    rule.minecraft_versions.some(version =>
                        version.includes(mcVersionSearch.toLowerCase()),
                    )) &&
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
        {#each $configFiles as file}
            <Option value={file}>{file}</Option>
        {/each}
    </Select>
    <Textfield variant="outlined" bind:value={search} label="Search by name">
        <Icon class="material-icons" slot="leadingIcon">search</Icon>
    </Textfield>

    <strong>Advanced Search</strong>
    <Button
        variant="outlined"
        bind:disabled={resetAllButtonDisabled}
        on:click={resetAll}
    >
        <ButtonIcon class="material-icons">restart_alt</ButtonIcon>
        <Label>Reset all filters</Label>
    </Button>
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
            options={$mods}
            bind:value={modSearch}
            label="Mod"
        />

        <Select bind:value={mcVersionSearch} label="Minecraft Version">
            <Option value="any">any</Option>
            {#each $mcVersions as version}
                <Option value={version}>{version}</Option>
            {/each}
        </Select>

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
