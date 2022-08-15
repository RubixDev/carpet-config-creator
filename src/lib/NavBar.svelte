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
    import { siGithub } from 'simple-icons/icons'
    import { colorScheme, SchemeKind, config } from '../stores'
    import './navbar.scss'

    let confirmDialogOpen = false
    let infoDialogOpen = false
    let menu: MenuComponentDev

    function exportConfig() {
        const out = Object.entries($config)
            .map(([id, value]) => `${id.split('|||')[0]} ${value}`)
            .join('\n')
        if (out.length === 0) {
            alert('Config file is empty')
            return
        }
        console.log('Exporting config file:', $config, out)
        downloadFile('carpet.conf', out)
    }

    function downloadFile(filename: string, content: string) {
        const temp = document.createElement('a')
        temp.href =
            'data:text/plain;charset=utf-8,' + encodeURIComponent(content)
        temp.download = filename
        temp.style.display = 'none'
        document.body.appendChild(temp)
        temp.click()
        document.body.removeChild(temp)
    }

    function resetAll() {
        if (Object.keys($config).length > 0) confirmDialogOpen = true
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
            >. Configuring all the settings in game can get rather annoying and
            time consuming, especially with multiple extensions installed.
        </p>
        <p>
            This page currently uses Crec0's <a
                href="https://carpet-rules.crec.dev/">Carpet Rules Database</a
            > for the list of rules and their information.
        </p>
    </DialogContent>
    <Actions>
        <Button><Label>Done</Label></Button>
    </Actions>
</Dialog>
