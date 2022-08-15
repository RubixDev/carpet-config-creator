<script lang="ts">
    import Switch from '@smui/switch'
    import FormField from '@smui/form-field'
    import Select, { Option } from '@smui/select'
    import IconButton from '@smui/icon-button'
    import Autocomplete from '@smui-extra/autocomplete'
    import { config } from '../stores'
    import { onMount } from 'svelte'

    export let name: string
    export let type: string
    export let defaultValue: string
    export let strict: boolean
    export let options: string[] | null
    export let repo: string
    export let branches: string[]

    const ID = name + '|||' + repo + branches.join()
    let value: string = $config[ID] !== undefined ? $config[ID] : defaultValue

    $: value, updateConfig()
    function updateConfig() {
        if ($config[ID] === value) return
        if (value !== defaultValue) {
            $config[ID] = value
        } else {
            delete $config[ID]
            $config = $config // Trigger update
        }
    }

    $: $config, resetValue()
    function resetValue() {
        if (value === defaultValue) return
        if ($config[ID] === undefined) {
            value = defaultValue
            booleanValue = type === 'boolean' ? defaultValue === 'true' : null
        }
    }

    let undoDisabled = true
    $: undoDisabled = value === defaultValue
    onMount(() => (undoDisabled = value === defaultValue))

    let invalid = false
    $: invalid =
        !strict &&
        type !== 'String' &&
        (value === '' || (type === 'int' && !/^-?\d+$/.test(value)))

    let booleanValue: boolean | null =
        type === 'boolean' ? value === 'true' : null
    $: if (booleanValue !== null) value = booleanValue + ''
</script>

<div class="container">
    {#if type === 'boolean'}
        <FormField>
            <Switch bind:checked={booleanValue} />
            <code class="bool-label" slot="label"
                >{value}{@html booleanValue ? '&nbsp;' : ''}</code
            >
        </FormField>
    {:else if strict}
        <Select bind:value label="Option">
            {#each options || [] as option}
                <Option value={option}>{option}</Option>
            {/each}
        </Select>
    {:else if type === 'String'}
        <Autocomplete
            combobox
            {options}
            bind:text={value}
            label="Custom Value"
        />
    {:else if type === 'int'}
        <Autocomplete
            combobox
            {options}
            bind:text={value}
            bind:textfield$invalid={invalid}
            label="Custom Value"
            textfield$type="Number"
            textfield$input$max="2147483647"
            textfield$input$min="-2147483648"
        />
    {:else if type === 'long'}
        <Autocomplete
            combobox
            {options}
            bind:text={value}
            bind:textfield$invalid={invalid}
            label="Custom Value"
            textfield$type="Number"
            textfield$input$max="9223372036854775807"
            textfield$input$min="-9223372036854775808"
        />
    {:else if type === 'float' || type == 'double'}
        <Autocomplete
            combobox
            {options}
            bind:text={value}
            bind:textfield$invalid={invalid}
            label="Custom Value"
            textfield$type="Number"
        />
    {:else}
        <span style="color: var(--clr-error);">Type not supported</span>
    {/if}
    <IconButton
        class="material-icons"
        title="Reset to Default"
        bind:disabled={undoDisabled}
        on:click={() => {
            value = defaultValue
        }}>undo</IconButton
    >
</div>

<style lang="scss">
    .container {
        display: flex;
        gap: 1rem;
        align-items: center;
    }

    .bool-label {
        @media screen and (max-width: 23rem) {
            display: none;
        }
    }
</style>
