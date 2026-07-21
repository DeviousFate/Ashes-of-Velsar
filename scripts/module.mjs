const MODULE_ID = "ashes-of-velsar";

Hooks.once("ready", () => {
  if (!game.user?.isGM) return;

  const version = game.modules.get(MODULE_ID)?.version;
  console.info(`Ashes of Velsar | Ready (v${version})`);
});

Hooks.on("renderJournalSheet", (application) => {
  const journal = application.document ?? application.object;
  if (!journal?.getFlag?.(MODULE_ID, "campaignJournal")) return;

  const element = application.element?.[0] ?? application.element;
  element?.classList?.add("ashes-of-velsar-journal");
});
