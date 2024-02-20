<script lang="ts">
    import IconButton from '@smui/icon-button'
    import TopAppBar, { Row, Section, Title } from '@smui/top-app-bar'
    import Dialog, {
        Content as DialogContent,
        Title as DialogTitle,
        Header,
        Actions,
    } from '@smui/dialog'
    import Button, { Label } from '@smui/button'
    import Menu from '@smui/menu'
    import type { MenuComponentDev } from '@smui/menu'
    import List, { Item, Text, Graphic } from '@smui/list'
    import { Span } from '@smui/common/elements'
    import Radio from '@smui/radio'
    import { siGithub } from 'simple-icons/icons'
    import {
        createSnackbar,
        colorScheme,
        SchemeKind,
        config,
        configFile,
        currentConfig,
        allRules,
        type Rule,
        configFiles,
    } from '../stores'
    import './navbar.scss'
    import CodeBlock from './CodeBlock.svelte'

    let confirmDialogOpen = false
    let infoDialogOpen = false
    let exportDialogOpen = false
    let exportOut = ''
    let menu: MenuComponentDev

    let ambiguationDialogOpen = false
    let ambiguousRuleName = ''
    let ambiguousRules = []
    let selectedRule = ''
    let completeRuleSelect: (value: string) => void
    let ruleSelectPromise: Promise<string>

    function canAssignValueToRule(value: string, rule: Rule): boolean {
        return (
            (rule.strict && rule.options.includes(value)) ||
            (['int', 'long'].includes(rule.type) && parseInt(value) !== NaN) ||
            (['float', 'double'].includes(rule.type) &&
                parseFloat(value) !== NaN) ||
            (rule.type === 'String' && !rule.strict)
        )
    }

    async function importConfig(file?: File) {
        if (file === undefined) return
        if (!$configFiles.includes(file.name)) {
            $createSnackbar(`Unknown config file named '${file.name}'`)
            return
        }
        if (file.name !== $configFile) $configFile = file.name

        let didChange = false
        for (const line of (await file.text()).split('\n')) {
            if (/^\s*$/.test(line)) continue
            const [name, value] = line.split(' ')
            const found = $allRules.filter(
                rule =>
                    rule.name === name &&
                    canAssignValueToRule(value, rule) &&
                    rule.config_files.includes($configFile),
            )

            let rule: Rule
            if (found.length < 1) {
                console.log(`Skipping unknown rule ${name}`)
                $createSnackbar(`Warning: Skipping unknown rule ${name}`)
                continue
            } else if (found.length === 1) {
                rule = found[0]
            } else if (found.length > 1) {
                ambiguousRuleName = name
                ambiguousRules = found
                selectedRule = found[0].id
                ambiguationDialogOpen = true
                ruleSelectPromise = new Promise(
                    resolve => (completeRuleSelect = resolve),
                )

                const ruleId = await ruleSelectPromise
                rule = $allRules.find(r => r.id === ruleId)
            }

            if (!canAssignValueToRule(value, rule)) {
                console.warn(
                    `Config contains invalid value '${value}' for rule '${rule.id}'`,
                )
                $createSnackbar(
                    `Warning: Config contains invalid value '${value}' for rule '${rule.name}', ignoring`,
                )
                continue
            }
            if (!didChange || $config[$configFile] === undefined)
                $config[$configFile] = {}
            $config[$configFile][rule.id] = value
            didChange = true
        }
        if (!didChange)
            $createSnackbar('Error: Config file is either empty or malformed')
    }

    function exportConfig() {
        exportOut = Object.entries($currentConfig)
            .map(([id, value]) => `${id.split('|||')[0]} ${value}`)
            .join('\n')
        if (exportOut.length === 0) {
            $createSnackbar('Config file is empty')
            return
        }
        console.log(`Exporting ${$configFile}:`, $config, exportOut)

        const blob = new Blob([exportOut], { type: 'text/plain' })
        const elem = window.document.createElement('a')
        elem.href = window.URL.createObjectURL(blob)
        elem.download = $configFile
        elem.style.display = 'none'
        document.body.appendChild(elem)
        elem.click()
        document.body.removeChild(elem)
        exportDialogOpen = true
    }

    function resetAll() {
        if (Object.keys($config).length > 0) confirmDialogOpen = true
        else $createSnackbar('No changes to reset')
    }

    function cycleTheme() {
        $colorScheme = ($colorScheme + 1) % (Object.keys(SchemeKind).length / 2)
    }

    function showInfo() {
        infoDialogOpen = true
    }
</script>

<TopAppBar variant="standard">
    <Row>
        <Section>
            <Title>Carpet Config Creator</Title>
        </Section>

        <Section id="toolbar" align="end" toolbar>
            <label>
                <input
                    type="file"
                    accept=".conf"
                    style="display: none;"
                    on:change={e => {
                        importConfig(e.currentTarget.files[0])
                        e.currentTarget.value = ''
                    }}
                />
                <IconButton
                    class="material-icons"
                    title="Import config file"
                    component={Span}>file_upload</IconButton
                >
            </label>
            <IconButton
                class="material-icons"
                title="Export config file"
                on:click={exportConfig}>file_download</IconButton
            >
            <IconButton
                class="material-icons"
                title="Reset all changes"
                on:click={resetAll}>delete_forever</IconButton
            >
            <IconButton
                class="material-icons"
                title={$colorScheme === SchemeKind.Light
                    ? 'Light Theme'
                    : $colorScheme === SchemeKind.System
                    ? 'System Theme'
                    : 'Dark Theme'}
                on:click={cycleTheme}
                >{$colorScheme === SchemeKind.Light
                    ? 'light_mode'
                    : $colorScheme === SchemeKind.System
                    ? 'auto_mode'
                    : 'dark_mode'}</IconButton
            >
            <IconButton
                title="Open GitHub repository"
                href="https://github.com/RubixDev/carpet-config-creator"
                >{@html siGithub.svg}</IconButton
            >
            <IconButton
                class="material-icons"
                title="Show Information"
                on:click={showInfo}>info</IconButton
            >
        </Section>

        <Section id="menubar" align="end" toolbar>
            <IconButton
                id="menu-button"
                class="material-icons"
                on:click={() => menu.setOpen(true)}>more_vert</IconButton
            >
            <Menu bind:this={menu}>
                <List>
                    <label>
                        <input
                            type="file"
                            accept=".conf"
                            style="display: none;"
                            on:change={e => {
                                importConfig(e.currentTarget.files[0])
                                e.currentTarget.value = ''
                            }}
                        />
                        <Item title="Import config file">
                            <Graphic class="material-icons">file_upload</Graphic
                            >
                            <Text>Import Config</Text>
                        </Item>
                    </label>
                    <Item
                        title="Export config file"
                        on:SMUI:action={exportConfig}
                    >
                        <Graphic class="material-icons">file_download</Graphic>
                        <Text>Export Config</Text>
                    </Item>
                    <Item title="Reset all changes" on:SMUI:action={resetAll}>
                        <Graphic class="material-icons">delete_forever</Graphic>
                        <Text>Reset All</Text>
                    </Item>
                    <Item
                        title={$colorScheme === SchemeKind.Light
                            ? 'Light Theme'
                            : $colorScheme === SchemeKind.System
                            ? 'System Theme'
                            : 'Dark Theme'}
                        on:SMUI:action={cycleTheme}
                    >
                        <Graphic class="material-icons"
                            >{$colorScheme === SchemeKind.Light
                                ? 'light_mode'
                                : $colorScheme === SchemeKind.System
                                ? 'auto_mode'
                                : 'dark_mode'}</Graphic
                        >
                        <Text
                            >{$colorScheme === SchemeKind.Light
                                ? 'Switch to Dark Theme'
                                : $colorScheme === SchemeKind.System
                                ? 'Switch to Light Theme'
                                : 'Switch to System Theme'}</Text
                        >
                    </Item>
                    <Item
                        title="Open GitHub repository"
                        on:SMUI:action={() =>
                            (window.location.href =
                                'https://github.com/RubixDev/carpet-config-creator')}
                    >
                        <Graphic>{@html siGithub.svg}</Graphic>
                        <Text>GitHub Page</Text>
                    </Item>
                    <Item title="Show Information" on:SMUI:action={showInfo}>
                        <Graphic class="material-icons">info</Graphic>
                        <Text>Information</Text>
                    </Item>
                </List>
            </Menu>
        </Section>
    </Row>
</TopAppBar>

<Dialog
    bind:open={confirmDialogOpen}
    aria-labelledby="confirm-dialog-title"
    aria-describedby="confirm-dialog-content"
>
    <DialogTitle id="confirm-dialog-title">Are you sure?</DialogTitle>
    <DialogContent id="confirm-dialog-content"
        >This will irreversibly erase all changes you have made to the rule
        values</DialogContent
    >
    <Actions>
        <Button defaultAction><Label>No</Label></Button>
        <Button on:click={() => ($config = {})}><Label>Yes</Label></Button>
    </Actions>
</Dialog>

<Dialog
    bind:open={infoDialogOpen}
    fullscreen
    aria-labelledby="info-dialog-title"
    aria-describedby="info-dialog-content"
>
    <Header>
        <DialogTitle id="info-dialog-title"
            >Information on Carpet Config Creator</DialogTitle
        >
    </Header>
    <DialogContent id="info-dialog-content">
        <p>
            This webpage aims to help with configuring the enourmous amount of
            new gamerules introduced by gnembon's amazing <a
                href="https://github.com/gnembon/fabric-carpet">Carpet Mod</a
            >
            and
            <a
                href="https://github.com/gnembon/fabric-carpet/wiki/List-of-Carpet-extensions"
                >all its extensions</a
            >. Configuring all the settings in game can get quite annoying and
            time consuming, especially with multiple extensions installed.
        </p>
        <p>
            <s
                >This page currently uses Crec0's <a
                    href="https://carpet-rules.crec.dev/"
                    >Carpet Rules Database</a
                > for the list of rules and their information.</s
            >
            <br />
            This page now uses my own
            <a href="https://github.com/RubixDev/carpet-database"
                >Carpet Rules Database</a
            >.
        </p>
    </DialogContent>
    <Actions>
        <Button><Label>Done</Label></Button>
    </Actions>
</Dialog>

<Dialog
    bind:open={ambiguationDialogOpen}
    scrimClickAction=""
    escapeKeyAction=""
    aria-labelledby="ambiguation-dialog-title"
    aria-describedby="ambiguation-dialog-content"
>
    <DialogTitle id="ambiguation-dialog-title">Ambiguous Rule Name</DialogTitle>
    <DialogContent id="ambiguation-dialog-content">
        The rule name <code>{ambiguousRuleName}</code> exists multiple times.
        Please select one to use below.
        <List radioList>
            {#each ambiguousRules as rule (rule.id)}
                <Item>
                    <Graphic
                        ><Radio
                            bind:group={selectedRule}
                            value={rule.id}
                        /></Graphic
                    >
                    <Label
                        >{rule.mod_name +
                            ' in version' +
                            (rule.minecraft_versions.length === 1 ? '' : 's') +
                            ' ' +
                            rule.minecraft_versions.join(', ')}</Label
                    >
                </Item>
            {/each}
        </List>
    </DialogContent>
    <Actions>
        <Button
            on:click={() =>
                setTimeout(() => completeRuleSelect(selectedRule), 100)}
            ><Label>Select</Label></Button
        >
    </Actions>
</Dialog>

<Dialog
    bind:open={exportDialogOpen}
    aria-labelledby="export-dialog-title"
    aria-describedby="export-dialog-content"
>
    <DialogTitle id="export-dialog-title">Exported Config File</DialogTitle>
    <DialogContent id="export-dialog-content">
        The <code>{$configFile}</code> should have downloaded automatically. In
        case it hasn't, you can copy the contents from here:
        <CodeBlock content={exportOut} />
    </DialogContent>
    <Actions>
        <Button defaultAction><Label>Close</Label></Button>
    </Actions>
</Dialog>
