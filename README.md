# Ashes of Velsar

Ashes of Velsar is a Foundry VTT v13 campaign module for the D&D5e-based SW5E module. It packages a 1st–4th-level adventure for four to six characters.

## Included compendiums

- **Complete Adventure:** imports the campaign journals, handouts, scenes, actors, folders, and scene-to-journal pins in one operation.
- **Journals:** the full campaign manuscript, a quick reference, a GM dashboard, and player handouts.
- **Scenes:** eighteen illustrated battlemaps organized by chapter at their native dimensions, including Doctor Vey’s Clinic, the Desert Shrine, and an optional Bracken’s Point town map for random encounters. Campaign encounter tokens are staged, but Scene walls are intentionally empty for the GM to configure manually.
- **Campaign:** sixteen Velsar NPCs, the BT-9 Stargazer, and three official SW5E encounter actors, including embedded features, actor portraits, and tokens.

The supplied Landing Page is used as the module cover, Adventure artwork, and a GM Dashboard image page.

Encounter tokens that depend on earlier campaign choices, reinforcements, or optional objectives begin hidden so the GM can reveal only the appropriate roster.

## Requirements

- Foundry Virtual Tabletop 13
- D&D5e 5.2.5 or newer compatible release
- SW5E module 1.3.9 or newer compatible release

The SW5E rules and content module are maintained separately by the [SW5E Foundry project](https://github.com/sw5e-foundry/sw5e-module). Rules references should be checked against [SW5E.com](https://sw5e.com/rules).

## Installation for local development

For a normal installation, paste this URL into Foundry's **Install Module → Manifest URL** field:

```text
https://raw.githubusercontent.com/DeviousFate/Ashes-of-Velsar/main/module.json
```

After installation, enable **SW5E** and **Ashes of Velsar** in the world, open the Compendium Packs sidebar, and import **Ashes of Velsar — Complete Adventure**.

### Local development

Copy or junction this directory into Foundry's `Data/modules/ashes-of-velsar` directory, enable **SW5E** and **Ashes of Velsar**, then import **Ashes of Velsar — Complete Adventure** from the Compendium Packs sidebar.

The build scripts infer the local Foundry installation and campaign world from `%LOCALAPPDATA%`. Override them with `FOUNDRY_DATA_PATH`, `FOUNDRY_APP_PATH`, or `AOV_WORLD_PATH` when needed.

```powershell
npm run extract
npm run build
npm test
```

## Attribution

This is unofficial fan-made campaign content. Star Wars and related marks belong to their respective owners. SW5E rules support is supplied by the separately installed SW5E module; this repository does not replace its rules compendiums.
