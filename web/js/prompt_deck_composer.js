import { app } from "../../../scripts/app.js";
import { api } from "../../../scripts/api.js";

const NONE_VALUE = "<none>";
const ROW_HEIGHT = 28;
const EXPANDED_SECTION_HEIGHT = 24;
const COLLAPSED_SECTION_HEIGHT = 18;
const MODE_ROW_HEIGHT = 34;
const TEXT_ROW_HEIGHT = 34;
const REROLL_BUTTON_TOP = 4;
const REROLL_BUTTON_GAP = 6;
const REROLL_BOTTOM_PADDING = 8;
const REROLL_ROW_HEIGHT = REROLL_BUTTON_TOP + 24 * 3 + REROLL_BUTTON_GAP * 2 + REROLL_BOTTOM_PADDING;
const PREVIEW_TEXT_HEIGHT = 62;
const PREVIEW_BUTTON_HEIGHT = 24;
const PREVIEW_BUTTON_GAP = 6;
const PREVIEW_HEIGHT = PREVIEW_TEXT_HEIGHT + PREVIEW_BUTTON_GAP + PREVIEW_BUTTON_HEIGHT + 16;
const RESULT_INSIGHT_HEIGHT = 118;
const DEFAULT_NODE_WIDTH = 460;
const MIN_READABLE_WIDTH = 430;
const GAP = 6;
const RANDOM_TOGGLE_WIDTH = 42;
const RANDOM_TOGGLE_GAP = 6;
const RECENT_RESULTS_KEY = "PromptDeckComposer.recentResults";
const COLLAPSED_SECTIONS_KEY = "PromptDeckComposer.collapsedSections";
const DEFAULT_COLLAPSED_SECTIONS = {
  Basic: false,
  "Prompt Format": false,
  "Manual Reroll": true,
  "THEME STACK": true,
  Scene: false,
  "Style Layers": true,
  "Artist Mix": true,
  "Style Blocks": true,
  "OLLAMA EXPAND": true,
  "RESULT INSIGHT": false,
  "RECENT RESULTS": true,
  "Final Prompt Preview": false,
};
const AUTO_COLLAPSE_SECTIONS = ["Manual Reroll", "Scene", "Style Layers", "Artist Mix", "Style Blocks"];

const SECTION_GROUPS = [
  {
    title: "Basic",
    rows: [
      { type: "mode", name: "AUTO_COMPOSE" },
      { type: "text", name: "USER_PROMPT", label: "USER PROMPT", multiline: true },
      { type: "text", name: "separator", label: "SEPARATOR" },
      { type: "chaos", name: "CHAOS_LEVEL", label: "CHAOS LEVEL" },
      { type: "tone_boolean", name: "CONSISTENCY_MODE", label: "CONSISTENCY" },
      { type: "tone_mix", name: "CONSISTENCY_STRENGTH", label: "STRENGTH" },
    ],
  },
  {
    title: "THEME STACK",
    rows: [
      { type: "theme_grid", name: "THEME_STACK" },
    ],
  },
  {
    title: "Prompt Format",
    rows: [
      { type: "structured_mode", name: "STRUCTURED_MODE" },
      { type: "combo", name: "TONE_PRESET_PRIMARY", label: "TONE PRIMARY" },
      { type: "combo", name: "TONE_PRESET_SECONDARY", label: "TONE SECONDARY" },
      { type: "tone_mix", name: "TONE_MIX", label: "TONE MIX" },
    ],
  },
  {
    title: "Manual Reroll",
    rows: [
      { type: "reroll_buttons", name: "MANUAL_REROLL" },
    ],
  },
  {
    title: "Scene",
    rows: [
      { type: "combo", name: "PRIMARY_SUBJECT" },
      { type: "combo", name: "SUBJECT_MODIFIER" },
      { type: "combo", name: "SECONDARY_SUBJECT_1" },
      { type: "combo", name: "SECONDARY_SUBJECT_2" },
      { type: "combo", name: "RELATIONSHIP" },
      { type: "combo", name: "ENVIRONMENT" },
      { type: "lock", name: "LOCK_SCENE_STRUCTURE", label: "LOCK SCENE GROUP" },
    ],
  },
  {
    title: "Style Layers",
    rows: [
      { type: "combo", name: "STYLE_RENDER" },
      { type: "combo", name: "STYLE_LIGHTING" },
      { type: "combo", name: "STYLE_COLOR" },
      { type: "combo", name: "STYLE_TEXTURE" },
      { type: "combo", name: "STYLE_MOOD" },
      { type: "lock", name: "LOCK_STYLE_LAYERS", label: "LOCK STYLE GROUP" },
    ],
  },
  {
    title: "Artist Mix",
    rows: [
      { type: "combo", name: "ARTIST_COUNT" },
      { type: "combo", name: "ARTIST_1" },
      { type: "combo", name: "ARTIST_2" },
      { type: "combo", name: "ARTIST_3" },
      { type: "lock", name: "LOCK_ARTIST_MIX", label: "LOCK ARTISTS" },
    ],
  },
  {
    title: "Style Blocks",
    rows: [
      { type: "combo", name: "STYLE_BLOCK_LIGHTING" },
      { type: "combo", name: "STYLE_BLOCK_TEXTURE" },
      { type: "combo", name: "STYLE_BLOCK_ATMOSPHERE" },
      { type: "combo", name: "STYLE_BLOCK_CAMERA" },
      { type: "combo", name: "STYLE_BLOCK_CONCEPT" },
      { type: "lock", name: "LOCK_STYLE_BLOCKS", label: "LOCK BLOCKS" },
    ],
  },
  {
    title: "OLLAMA EXPAND",
    rows: [
      { type: "tone_boolean", name: "OLLAMA_ENABLE", label: "ENABLE" },
      { type: "ollama_model", name: "OLLAMA_MODEL", label: "MODEL" },
      { type: "float", name: "OLLAMA_TEMPERATURE", label: "TEMPERATURE", min: 0, max: 2 },
      { type: "status", name: "OLLAMA_STATUS", label: "STATUS" },
      { type: "text", name: "OLLAMA_SYSTEM_PROMPT", label: "SYSTEM PROMPT", multiline: true },
      { type: "text", name: "OLLAMA_URL", label: "URL" },
      { type: "text", name: "OLLAMA_TIMEOUT", label: "TIMEOUT" },
    ],
  },
  {
    title: "RESULT INSIGHT",
    rows: [
      { type: "result_insight", name: "RESULT_INSIGHT" },
    ],
  },
  {
    title: "RECENT RESULTS",
    rows: [
      { type: "recent_results", name: "RECENT_RESULTS" },
    ],
  },
];

const THEME_STACK_WIDGETS = [
  "CONSISTENCY_WORLD_THEME",
  "CONSISTENCY_CULTURE_THEME",
  "CONSISTENCY_MATERIAL_THEME",
  "CONSISTENCY_CONCEPT_THEME",
];
const THEME_STACK_KEYS = {
  CONSISTENCY_WORLD_THEME: "world",
  CONSISTENCY_CULTURE_THEME: "culture",
  CONSISTENCY_MATERIAL_THEME: "material",
  CONSISTENCY_CONCEPT_THEME: "concept",
};
const THEME_STACK_WEIGHT_WIDGETS = {
  CONSISTENCY_WORLD_THEME: "CONSISTENCY_WORLD_WEIGHT",
  CONSISTENCY_CULTURE_THEME: "CONSISTENCY_CULTURE_WEIGHT",
  CONSISTENCY_MATERIAL_THEME: "CONSISTENCY_MATERIAL_WEIGHT",
  CONSISTENCY_CONCEPT_THEME: "CONSISTENCY_CONCEPT_WEIGHT",
};
const THEME_STACK_WEIGHT_RANDOM_WIDGETS = {
  CONSISTENCY_WORLD_WEIGHT: "world_weight_random",
  CONSISTENCY_CULTURE_WEIGHT: "culture_weight_random",
  CONSISTENCY_MATERIAL_WEIGHT: "material_weight_random",
  CONSISTENCY_CONCEPT_WEIGHT: "concept_weight_random",
};
const THEME_STACK_WEIGHT_NAMES = Object.values(THEME_STACK_WEIGHT_WIDGETS);
const THEME_STACK_WEIGHT_RANDOM_NAMES = Object.values(THEME_STACK_WEIGHT_RANDOM_WIDGETS);
const COMBO_WIDGETS = [
  ...SECTION_GROUPS.flatMap((section) => section.rows)
  .filter((row) => row.type === "combo")
  .map((row) => row.name),
  ...THEME_STACK_WIDGETS,
];

const GROUP_LOCK_WIDGETS = SECTION_GROUPS.flatMap((section) => section.rows)
  .filter((row) => row.type === "lock")
  .map((row) => row.name);

const FIELD_LOCK_BY_WIDGET = {
  PRIMARY_SUBJECT: "LOCK_PRIMARY_SUBJECT",
  SUBJECT_MODIFIER: "LOCK_SUBJECT_MODIFIER",
  SECONDARY_SUBJECT_1: "LOCK_SECONDARY_SUBJECT_1",
  SECONDARY_SUBJECT_2: "LOCK_SECONDARY_SUBJECT_2",
  RELATIONSHIP: "LOCK_RELATIONSHIP",
  ENVIRONMENT: "LOCK_ENVIRONMENT",
  STYLE_RENDER: "LOCK_STYLE_RENDER",
  STYLE_LIGHTING: "LOCK_STYLE_LIGHTING",
  STYLE_COLOR: "LOCK_STYLE_COLOR",
  STYLE_TEXTURE: "LOCK_STYLE_TEXTURE",
  STYLE_MOOD: "LOCK_STYLE_MOOD",
  ARTIST_COUNT: "LOCK_ARTIST_COUNT",
  ARTIST_1: "LOCK_ARTIST_1",
  ARTIST_2: "LOCK_ARTIST_2",
  ARTIST_3: "LOCK_ARTIST_3",
  STYLE_BLOCK_LIGHTING: "LOCK_STYLE_BLOCK_LIGHTING",
  STYLE_BLOCK_TEXTURE: "LOCK_STYLE_BLOCK_TEXTURE",
  STYLE_BLOCK_ATMOSPHERE: "LOCK_STYLE_BLOCK_ATMOSPHERE",
  STYLE_BLOCK_CAMERA: "LOCK_STYLE_BLOCK_CAMERA",
  STYLE_BLOCK_CONCEPT: "LOCK_STYLE_BLOCK_CONCEPT",
};

const FIELD_LOCK_WIDGETS = Object.values(FIELD_LOCK_BY_WIDGET);
const LOCK_WIDGETS = [...new Set([...GROUP_LOCK_WIDGETS, ...FIELD_LOCK_WIDGETS])];
const SCENE_REROLL_KEYS = ["PRIMARY_SUBJECT", "SUBJECT_MODIFIER", "SECONDARY_SUBJECT_1", "SECONDARY_SUBJECT_2", "RELATIONSHIP", "ENVIRONMENT"];
const STYLE_REROLL_KEYS = ["STYLE_RENDER", "STYLE_LIGHTING", "STYLE_COLOR", "STYLE_TEXTURE", "STYLE_MOOD"];
const ARTIST_REROLL_KEYS = ["ARTIST_1", "ARTIST_2", "ARTIST_3"];
const STYLE_BLOCK_REROLL_KEYS = ["STYLE_BLOCK_LIGHTING", "STYLE_BLOCK_TEXTURE", "STYLE_BLOCK_ATMOSPHERE", "STYLE_BLOCK_CAMERA", "STYLE_BLOCK_CONCEPT"];
const THEME_KEYWORDS = {
  urban: ["metropolis", "boulevard", "skyline", "crosswalk", "apartment", "overpass", "storefront"],
  wilderness: ["forest", "valley", "meadow", "ridge", "waterfall", "grove", "mountain"],
  desert: ["dune", "oasis", "mesa", "badlands", "sandstorm", "canyon", "wasteland"],
  oceanic: ["underwater", "submerged", "reef", "kelp", "abyssal", "lagoon", "tidal"],
  subterranean: ["cavern", "tunnel", "underground", "catacomb", "vault", "chasm", "bunker"],
  orbital: ["space", "station", "satellite", "asteroid", "spaceship", "gravity", "orbit"],
  ruinscape: ["ruins", "derelict", "overgrown", "collapsed", "weathered", "abandoned", "remnant"],
  polar: ["tundra", "glacier", "iceberg", "snowfield", "frost", "arctic", "blizzard"],
  volcanic: ["lava", "magma", "basalt", "caldera", "ashfall", "ember", "crater"],
  nomadic: ["caravan", "wayfarer", "migratory", "encampment", "traveler", "route", "itinerant"],
  monastic: ["monk", "cloister", "vow", "abbot", "contemplative", "hermitage", "discipline"],
  aristocratic: ["courtly", "noble", "dynasty", "heraldry", "regal", "lineage", "estate"],
  mercantile: ["bazaar", "trader", "merchant", "barter", "marketplace", "ledger", "commerce"],
  militaristic: ["legion", "battalion", "fortified", "campaign", "armory", "command", "regiment"],
  scholarly: ["archive", "scribe", "codex", "academy", "lecture", "manuscript", "study"],
  communal: ["collective", "village", "kinship", "gathering", "cooperative", "hearth", "neighborhood"],
  artisan: ["craft", "workshop", "apprentice", "handmade", "guild", "maker", "toolbench"],
  stone: ["granite", "marble", "limestone", "slate", "sandstone", "chiseled", "masonry"],
  metal: ["steel", "iron", "chrome", "brass", "copper", "alloy", "oxidized"],
  glass: ["translucent", "mirror", "transparent", "refraction", "prismatic", "vitreous", "shard"],
  porcelain: ["porcelain", "kaolin", "glaze", "ceramic", "enameled", "bisque", "china"],
  wood: ["timber", "oak", "cedar", "grain", "bark", "polished", "carved"],
  textile: ["woven", "fabric", "thread", "linen", "tapestry", "embroidered", "fiber"],
  crystal: ["quartz", "amethyst", "faceted", "gemstone", "geode", "mineral", "lattice"],
  resin: ["amber", "sap", "varnish", "hardened", "viscous", "lacquer", "inclusion"],
  ceramic: ["clay", "earthenware", "terracotta", "kiln", "matte", "fired", "unglazed"],
  sacred: ["reverence", "hallowed", "sanctity", "benediction", "consecrated", "devotional", "awe"],
  liminal: ["threshold", "inbetween", "transitional", "borderline", "ambiguous", "unresolved", "passage"],
  melancholy: ["sorrow", "longing", "wistful", "mourning", "quietude", "regret", "tenderness"],
  uncanny: ["eerie", "disquiet", "estranged", "familiarity", "unease", "peculiar", "displacement"],
  transcendence: ["ascension", "awakening", "sublime", "radiance", "elevation", "clarity", "release"],
  decay: ["entropy", "fading", "erosion", "dissolution", "withering", "decline", "impermanence"],
  metamorphosis: ["transformation", "emergence", "becoming", "mutation", "unfolding", "evolution", "rebirth"],
  nostalgia: ["memory", "recollection", "yearning", "afterimage", "remembrance", "faded", "echo"],
  duality: ["contrast", "opposition", "mirrorlike", "binary", "tension", "balance", "polarity"],
  cyberspace: ["cyberspace", "virtual", "network", "interface", "data", "grid", "digital"],
  megastructure: ["megastructure", "superstructure", "arcology", "towering", "monumental", "vast", "engineered"],
  datacenter: ["server", "rack", "cable", "cooling", "terminal", "machine room", "datacenter"],
  virtual_void: ["void", "wireframe", "black space", "digital emptiness", "simulation", "abstract grid"],
  utopian_city: ["clean city", "bright skyline", "garden tower", "solar", "harmonious", "elevated transit"],
  dystopian_city: ["dystopian", "smog", "surveillance", "crowded street", "neon alley", "concrete tower"],
  alien_biosphere: ["alien", "biome", "xenoflora", "spores", "strange ecology", "extraterrestrial"],
  deep_ocean: ["abyss", "deep sea", "pressure", "bioluminescent", "submersible", "trench"],
  sky_city: ["floating city", "airship", "cloud city", "sky bridge", "suspended", "aerial"],
  laboratory: ["laboratory", "glass chamber", "specimen", "sterile", "experiment", "containment"],
  industrial_zone: ["factory", "warehouse", "pipe", "smokestack", "assembly", "machinery"],
  dreamscape: ["dream", "impossible space", "soft horizon", "surreal landscape", "floating form"],
  mirror_world: ["mirror", "reflection", "inversion", "symmetry", "duplicate", "refracted"],
  battlefield: ["battlefield", "trench", "ruined armor", "smoke", "banner", "wreckage"],
  haunted_mansion: ["mansion", "corridor", "old wallpaper", "candlelight", "staircase", "haunted"],
  cyberpunk: ["cyberpunk", "neon", "augment", "street tech", "rainy alley", "chrome", "hacker"],
  corporate: ["corporate", "executive", "office tower", "suit", "boardroom", "brand", "security"],
  hacker: ["hacker", "terminal", "code", "interface", "encrypted", "underground network"],
  posthuman: ["posthuman", "cyborg", "synthetic body", "augmentation", "transhuman", "machine flesh"],
  technocratic: ["technocratic", "bureaucratic machine", "system control", "official", "algorithmic"],
  cultist: ["cult", "hooded", "symbol", "ritual", "circle", "devotion"],
  survivalist: ["survivalist", "makeshift", "shelter", "ration", "worn gear", "post-collapse"],
  underground: ["underground", "subculture", "basement", "hidden club", "graffiti", "secret venue"],
  ritualistic: ["ritual", "ceremony", "altar", "symbol", "chanting figure", "procession"],
  imperial: ["imperial", "empire", "banner", "palace", "regalia", "command"],
  rebel: ["rebel", "insurgent", "resistance", "patched gear", "uprising", "underground cell"],
  scientific: ["scientific", "researcher", "instrument", "specimen", "diagram", "analysis"],
  occult: ["occult", "sigil", "esoteric", "arcane", "forbidden symbol", "ritual text"],
  punk: ["punk", "patched jacket", "DIY", "graffiti", "anti-establishment", "raw"],
  mythic: ["mythic", "legend", "heroic", "ancient tale", "divine beast", "epic"],
  neon: ["neon", "glow", "electric color", "signage", "luminous tube", "saturated light"],
  hologram: ["hologram", "projection", "transparent display", "light screen", "floating interface"],
  circuitry: ["circuit", "motherboard", "trace line", "chip", "wiring", "microelectronics"],
  chrome: ["chrome", "mirror metal", "polished surface", "reflective", "silver sheen"],
  liquid_metal: ["liquid metal", "mercury", "molten alloy", "fluid chrome", "reflective flow"],
  synthetic_polymer: ["polymer", "plastic", "synthetic", "matte composite", "manufactured surface"],
  carbon_fiber: ["carbon fiber", "woven composite", "black weave", "lightweight shell"],
  biomass: ["biomass", "organic mass", "fibrous tissue", "growth", "living material"],
  organic_flesh: ["flesh", "skin", "muscle", "vein", "organic tissue", "anatomical"],
  data_stream: ["data stream", "binary", "code rain", "packet", "signal", "flowing information"],
  plasma: ["plasma", "ionized light", "electric arc", "glowing energy", "charged field"],
  smoke: ["smoke", "mist", "vapor", "haze", "diffusion", "soft opacity"],
  ice: ["ice", "frost", "frozen", "crystalline cold", "snow crust", "glacier surface"],
  rust: ["rust", "oxidation", "corrosion", "weathered metal", "orange patina"],
  ink: ["ink", "brushstroke", "black fluid", "wash", "bleeding pigment"],
  simulation: ["simulation", "virtual", "rendered reality", "artificial world", "constructed space"],
  surveillance: ["surveillance", "camera", "watching", "monitor", "tracking", "security system"],
  identity_loss: ["identity loss", "faceless", "mask", "erased features", "anonymous", "fragmented self"],
  hyperreality: ["hyperreality", "synthetic realism", "advertisement glow", "too perfect", "artificial clarity"],
  digital_decay: ["digital decay", "glitch", "compression artifact", "corrupted data", "pixel smear"],
  control: ["control", "constraint", "system", "authority", "containment", "regulated"],
  augmentation: ["augmentation", "implant", "prosthetic", "cybernetic", "enhanced body"],
  isolation: ["isolation", "alone", "empty space", "distant figure", "separation"],
  memory_erasure: ["memory erasure", "blank record", "missing face", "faded photograph", "forgotten archive"],
  forbidden_knowledge: ["forbidden knowledge", "sealed book", "hidden diagram", "classified", "arcane secret"],
  entropy: ["entropy", "disorder", "collapse", "fragmentation", "breakdown"],
  awakening: ["awakening", "activation", "first light", "emergence", "consciousness"],
  invasion: ["invasion", "intrusion", "breach", "arrival", "foreign presence"],
  containment: ["containment", "sealed chamber", "glass wall", "quarantine", "locked specimen"],
  rebellion: ["rebellion", "uprising", "defiance", "broken chain", "resistance"],
};

const HIDDEN_WIDGETS = [
  "randomize",
  "separator",
  "CHAOS_LEVEL",
  "RANDOM_CHAOS_LEVEL",
  "STRUCTURED_MODE",
  "TONE_PRESET",
  "TONE_MIX",
  "RANDOM_TONE",
  "LOCK_TONE",
  "CONSISTENCY_MODE",
  "CONSISTENCY_THEME",
  "CONSISTENCY_STRENGTH",
  "RANDOM_CONSISTENCY_STRENGTH",
  ...THEME_STACK_WEIGHT_NAMES,
  ...THEME_STACK_WEIGHT_RANDOM_NAMES,
  "OLLAMA_ENABLE",
  "OLLAMA_MODEL",
  "OLLAMA_TEMPERATURE",
  "OLLAMA_STATUS",
  "OLLAMA_SYSTEM_PROMPT",
  "OLLAMA_URL",
  "OLLAMA_TIMEOUT",
  "USER_PROMPT",
  ...COMBO_WIDGETS,
  ...LOCK_WIDGETS,
];

function report(error) {
  console.error("[PromptDeckComposer]", error);
}

function guard(fn, fallback = undefined) {
  try {
    return fn();
  } catch (error) {
    report(error);
    return fallback;
  }
}

function readCollapsedSections() {
  return guard(() => {
    const parsed = JSON.parse(localStorage.getItem(COLLAPSED_SECTIONS_KEY) || "{}");
    return { ...DEFAULT_COLLAPSED_SECTIONS, ...(parsed && typeof parsed === "object" ? parsed : {}) };
  }, { ...DEFAULT_COLLAPSED_SECTIONS });
}

async function fetchJson(path, options) {
  const response = await api.fetchApi(path, options);
  if (!response.ok) {
    throw new Error(`${path} failed with ${response.status}`);
  }
  return await response.json();
}

function normalizeRecentResult(result) {
  if (!result || typeof result !== "object") return null;
  const themeStack = result.theme_stack || result.themeStack || {};
  const image = normalizeImageInfo(result.image);
  return {
    ...result,
    themeStack,
    theme_stack: themeStack,
    insight_description: result.insight_description || result.insight || "",
    insight: result.insight || result.insight_description || "",
    chaos_level: result.chaos_level ?? result.chaos ?? 0.5,
    chaos: result.chaos ?? result.chaos_level ?? 0.5,
    image,
  };
}

function normalizeImageInfo(image) {
  if (!image || typeof image !== "object") {
    return { status: "settings_only", filename: "", subfolder: "", type: "composer_thumbnail", source: null };
  }
  return {
    status: image.status || "settings_only",
    filename: image.filename || "",
    subfolder: image.subfolder || "",
    type: image.type || "composer_thumbnail",
    source: image.source || null,
  };
}

function thumbnailStatusLabel(image) {
  const status = normalizeImageInfo(image).status;
  if (status === "output_copied") return "Output thumb";
  if (status === "preview_copied") return "Preview thumb";
  if (status === "missing") return "Thumb missing";
  return "Settings only";
}

function thumbnailUrl(image) {
  const info = normalizeImageInfo(image);
  if (!info.filename || info.type !== "composer_thumbnail") return "";
  if (info.status !== "output_copied" && info.status !== "preview_copied") return "";
  const path = `/prompt_deck_composer/thumbnail?filename=${encodeURIComponent(info.filename)}`;
  return api.apiURL ? api.apiURL(path) : path;
}

function thumbnailImageFor(node, result) {
  const url = thumbnailUrl(result?.image);
  if (!url) return null;
  node.promptDeckComposerThumbnailCache ||= {};
  const cached = node.promptDeckComposerThumbnailCache[url];
  if (cached) return cached.loaded ? cached.image : null;
  const image = new Image();
  const entry = { image, loaded: false, error: false };
  node.promptDeckComposerThumbnailCache[url] = entry;
  image.onload = () => {
    entry.loaded = true;
    node.setDirtyCanvas?.(true, true);
  };
  image.onerror = () => {
    entry.error = true;
    node.setDirtyCanvas?.(true, true);
  };
  image.src = url;
  return null;
}

function thumbnailLoadFailed(node, result) {
  const url = thumbnailUrl(result?.image);
  return Boolean(url && node?.promptDeckComposerThumbnailCache?.[url]?.error);
}

const EXPLORE_VARIANT_ITEMS = [
  ["soft", "Refine", "near variation"],
  ["style", "Restyle", "same idea, new look"],
  ["wild", "Reimagine", "same theme, new scene"],
];

function pointInRect(pos, rect) {
  return Boolean(
    rect &&
    pos[0] >= rect.x &&
    pos[0] <= rect.x + rect.width &&
    pos[1] >= rect.y &&
    pos[1] <= rect.y + rect.height
  );
}

function openExploreMenu(node, rect) {
  const width = 168;
  const itemHeight = 34;
  node.promptDeckComposerExploreMenu = {
    open: true,
    resultId: rect.id,
    x: rect.x,
    y: Math.max(4, rect.y - EXPLORE_VARIANT_ITEMS.length * itemHeight - 6),
    width,
    itemHeight,
  };
  node.setDirtyCanvas?.(true, true);
}

function closeExploreMenu(node) {
  if (!node?.promptDeckComposerExploreMenu?.open) return;
  node.promptDeckComposerExploreMenu.open = false;
  node.setDirtyCanvas?.(true, true);
}

function drawExploreMenu(ctx, node, custom) {
  const menu = node.promptDeckComposerExploreMenu;
  if (!menu?.open) return;
  custom.promptDeckComposerExploreMenuRects = [];
  const height = EXPLORE_VARIANT_ITEMS.length * menu.itemHeight;
  ctx.save();
  drawRoundRect(ctx, menu.x, menu.y, menu.width, height, 6);
  ctx.fillStyle = "rgba(20, 25, 33, 0.98)";
  ctx.fill();
  ctx.strokeStyle = "#7c88ad";
  ctx.stroke();
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  EXPLORE_VARIANT_ITEMS.forEach(([mode, label, description], index) => {
    const y = menu.y + index * menu.itemHeight;
    custom.promptDeckComposerExploreMenuRects.push({ mode, resultId: menu.resultId, x: menu.x, y, width: menu.width, height: menu.itemHeight });
    if (index > 0) {
      ctx.strokeStyle = "rgba(124,136,173,0.28)";
      ctx.beginPath();
      ctx.moveTo(menu.x + 6, y);
      ctx.lineTo(menu.x + menu.width - 6, y);
      ctx.stroke();
    }
    ctx.font = "bold 10.5px sans-serif";
    ctx.fillStyle = "#edf2f7";
    ctx.fillText(label, menu.x + 10, y + 6);
    ctx.font = "9px sans-serif";
    ctx.fillStyle = "rgba(190,203,218,0.68)";
    ctx.fillText(description, menu.x + 10, y + 20);
  });
  ctx.restore();
}

function setRecentResults(node, results) {
  node.promptDeckComposerRecentResults = (Array.isArray(results) ? results : [])
    .map(normalizeRecentResult)
    .filter(Boolean)
    .slice(0, 20);
}

function recentResultsForNode(node) {
  return node?.promptDeckComposerRecentResults || [];
}

async function fetchRecentResultsFromServer(node) {
  try {
    const data = await fetchJson("/prompt_deck_composer/recent_results");
    if (!data?.ok) throw new Error(data?.error || "recent results request failed");
    setRecentResults(node, data.results || []);
    await migrateLocalRecentResultsIfNeeded(node);
  } catch (error) {
    console.warn("[PromptDeckComposer] Recent Results unavailable", error);
    setRecentResults(node, []);
  }
  resizeNodeToContent(node);
  node?.setDirtyCanvas?.(true, true);
  return recentResultsForNode(node);
}

async function postRecentResultsToServer(node, body) {
  const data = await fetchJson("/prompt_deck_composer/recent_results", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  if (!data?.ok) throw new Error(data?.error || "recent results update failed");
  setRecentResults(node, data.results || []);
  resizeNodeToContent(node);
  node?.setDirtyCanvas?.(true, true);
  return recentResultsForNode(node);
}

async function saveRecentResultToServer(node, result) {
  return await postRecentResultsToServer(node, { action: "save", result });
}

async function deleteRecentResultFromServer(node, id) {
  return await postRecentResultsToServer(node, { action: "delete", id });
}

async function replaceRecentResultsOnServer(node, results) {
  return await postRecentResultsToServer(node, { action: "replace", results });
}

async function migrateLocalRecentResultsIfNeeded(node) {
  if (recentResultsForNode(node).length) return;
  if (localStorage.getItem(`${RECENT_RESULTS_KEY}.migrated`) === "true") return;
  const raw = localStorage.getItem(RECENT_RESULTS_KEY);
  if (!raw) return;
  const parsed = guard(() => JSON.parse(raw), []);
  if (!Array.isArray(parsed) || !parsed.length) return;
  await replaceRecentResultsOnServer(node, parsed);
  localStorage.setItem(`${RECENT_RESULTS_KEY}.migrated`, "true");
  localStorage.removeItem(RECENT_RESULTS_KEY);
}

function writeCollapsedSections(state) {
  guard(() => localStorage.setItem(COLLAPSED_SECTIONS_KEY, JSON.stringify(state || {})));
}

function isSectionCollapsed(title) {
  return readCollapsedSections()[title] === true;
}

function setSectionCollapsed(title, collapsed) {
  const state = readCollapsedSections();
  state[title] = collapsed === true;
  writeCollapsedSections(state);
}

function setManySectionsCollapsed(titles, collapsed) {
  const state = readCollapsedSections();
  for (const title of titles) {
    state[title] = collapsed === true;
  }
  writeCollapsedSections(state);
}

function expandAllSections() {
  const state = readCollapsedSections();
  for (const title of Object.keys(DEFAULT_COLLAPSED_SECTIONS)) {
    state[title] = false;
  }
  writeCollapsedSections(state);
}

function resizeNodeToContent(node) {
  guard(() => {
    if (!node?.size) return;
    const width = node.size[0] || DEFAULT_NODE_WIDTH;
    const computed = node.computeSize?.();
    const height = computed?.[1] || node.size?.[1];
    if (!height) return;
    node.setSize?.([width, height]);
    node.setDirtyCanvas?.(true, true);
  });
}

function applyCollapsedState(node, options = {}) {
  const collapsed = readCollapsedSections();
  for (const widget of node.widgets || []) {
    if (!widget.promptDeckComposerSection || widget.promptDeckComposerIsSectionHeader) continue;
    const hidden = collapsed[widget.promptDeckComposerSection] === true;
    widget.promptDeckComposerCollapsed = hidden;
    widget.hidden = hidden;
    widget.computedHeight = hidden ? 0 : null;
    if (hidden) {
      widget.last_y = -100000;
    }
  }
  if (options.resize !== false) {
    resizeNodeToContent(node);
  }
}

function syncAutoComposeCollapse(node, options = {}) {
  guard(() => {
    const enabled = randomizeWidget(node)?.value === true;
    const previous = node.promptDeckComposerLastAutoCompose;
    const isInitial = previous === undefined;
    node.promptDeckComposerLastAutoCompose = enabled;

    if (enabled && (previous === false || (isInitial && options.applyInitial === true))) {
      setManySectionsCollapsed(AUTO_COLLAPSE_SECTIONS, true);
      applyCollapsedState(node);
      return;
    }
    if (!enabled && previous === true) {
      expandAllSections();
      applyCollapsedState(node);
    }
  });
}

function attachSection(widget, title, isHeader = false) {
  if (!widget || widget.promptDeckComposerSectionAttached) return widget;
  widget.promptDeckComposerSection = title;
  widget.promptDeckComposerIsSectionHeader = isHeader;
  widget.promptDeckComposerSectionAttached = true;
  if (!isHeader) {
    const originalComputeSize = widget.computeSize;
    const originalDraw = widget.draw;
    const originalMouse = widget.mouse;
    widget.computeSize = function (width) {
      if (widget.promptDeckComposerCollapsed) return [width, 0];
      return originalComputeSize?.call(this, width) || [width, ROW_HEIGHT];
    };
    widget.draw = function () {
      if (widget.promptDeckComposerCollapsed) return;
      return originalDraw?.apply(this, arguments);
    };
    widget.mouse = function () {
      if (widget.promptDeckComposerCollapsed) return false;
      return originalMouse?.apply(this, arguments) || false;
    };
  }
  return widget;
}

function moveWidgetToEnd(node, widget) {
  if (!node?.widgets || !widget) return;
  const index = node.widgets.indexOf(widget);
  if (index < 0) return;
  node.widgets.splice(index, 1);
  node.widgets.push(widget);
}

function ensureFinalPreviewLast(node) {
  const previewSectionType = "prompt_deck_composer_section_Final Prompt Preview";
  const previewHeader = node.widgets?.find((widget) => widget.type === previewSectionType);
  const previewWidget = node.widgets?.find((widget) => widget.type === "prompt_deck_composer_preview");
  moveWidgetToEnd(node, previewHeader);
  moveWidgetToEnd(node, previewWidget);
}

function getWidget(node, name) {
  return node.widgets?.find((widget) => widget.name === name);
}

function randomizeWidget(node) {
  return getWidget(node, "randomize");
}

function markComposerRunStarted(node, timestamp = Date.now() / 1000) {
  if (!node || node.comfyClass !== "PromptDeckComposer") return;
  node.promptDeckComposerRunStartedAt = timestamp;
}

function markAllComposerRunsStarted(timestamp = Date.now() / 1000) {
  const nodes = app.graph?._nodes || app.graph?.nodes || [];
  for (const node of nodes) {
    markComposerRunStarted(node, timestamp);
  }
}

function notifyWidget(node, widget) {
  guard(() => widget?.callback?.(widget.value));
  guard(() => node?.onWidgetChanged?.(widget.name, widget.value, widget, node));
}

function setWidgetValue(node, widget, value, notify = true) {
  if (!widget) {
    return;
  }
  if (COMBO_WIDGETS.includes(widget.name) && typeof value !== "string") {
    return;
  }
  if ((LOCK_WIDGETS.includes(widget.name) || ["randomize", "STRUCTURED_MODE", "RANDOM_TONE", "LOCK_TONE", "CONSISTENCY_MODE", "RANDOM_CHAOS_LEVEL", "RANDOM_CONSISTENCY_STRENGTH", "OLLAMA_ENABLE", ...THEME_STACK_WEIGHT_RANDOM_NAMES].includes(widget.name)) && typeof value !== "boolean") {
    return;
  }
  widget.value = value;
  if (notify) {
    notifyWidget(node, widget);
  }
}

function valueText(value) {
  const text = String(value || "").trim();
  return text === NONE_VALUE || text.toLowerCase() === "none" ? "" : text;
}

function currentValues(node) {
  const values = {};
  for (const name of [...COMBO_WIDGETS, "USER_PROMPT"]) {
    values[name] = getWidget(node, name)?.value ?? "";
  }
  return values;
}

function allWidgetValues(node) {
  const values = {};
  for (const name of stateWidgetNames()) {
    const widget = getWidget(node, name);
    if (widget) values[name] = widget.value;
  }
  return values;
}

function stateWidgetNames() {
  return [
    "USER_PROMPT",
    "separator",
    "CHAOS_LEVEL",
    "RANDOM_CHAOS_LEVEL",
    "STRUCTURED_MODE",
    "TONE_PRESET",
    "TONE_MIX",
    "RANDOM_TONE",
    "LOCK_TONE",
    "CONSISTENCY_MODE",
    "CONSISTENCY_THEME",
    "CONSISTENCY_WORLD_THEME",
    "CONSISTENCY_CULTURE_THEME",
    "CONSISTENCY_MATERIAL_THEME",
    "CONSISTENCY_CONCEPT_THEME",
    ...THEME_STACK_WEIGHT_NAMES,
    ...THEME_STACK_WEIGHT_RANDOM_NAMES,
    "CONSISTENCY_STRENGTH",
    "RANDOM_CONSISTENCY_STRENGTH",
    "OLLAMA_ENABLE",
    "OLLAMA_MODEL",
    "OLLAMA_TEMPERATURE",
    "OLLAMA_STATUS",
    "OLLAMA_SYSTEM_PROMPT",
    "OLLAMA_URL",
    "OLLAMA_TIMEOUT",
    "randomize",
    "seed",
    ...COMBO_WIDGETS,
    ...LOCK_WIDGETS,
  ];
}

function joinList(items) {
  const clean = items.filter(Boolean);
  if (!clean.length) return "";
  if (clean.length === 1) return clean[0];
  return `${clean.slice(0, -1).join(", ")} and ${clean[clean.length - 1]}`;
}

function naturalJoin(items) {
  const clean = items.filter(Boolean);
  if (!clean.length) return "";
  if (clean.length === 1) return clean[0];
  if (clean.length === 2) return `${clean[0]} and ${clean[1]}`;
  return `${clean.slice(0, -1).join(", ")}, and ${clean[clean.length - 1]}`;
}

function cleanSentencePart(value) {
  return String(value || "").trim().replace(/^[\s,.;]+|[\s,.;]+$/g, "").replace(/\s+/g, " ");
}

function sentenceCase(value) {
  const text = String(value || "").trim().replace(/\s+/g, " ");
  return text ? text[0].toUpperCase() + text.slice(1) : "";
}

function stripPrefix(value, prefixes) {
  const text = cleanSentencePart(value);
  const lower = text.toLowerCase();
  const prefix = prefixes.find((item) => lower.startsWith(item));
  return prefix ? text.slice(prefix.length).trim() : text;
}

function clampMix(value) {
  const raw = Number(value);
  return Number.isFinite(raw) ? Math.min(1, Math.max(0, raw)) : 0;
}

function resolveTone(primary, secondary = "none", mix = 0) {
  const tones = ["neutral", "concise", "cinematic", "poetic", "technical"];
  const primaryTone = tones.includes(primary) ? primary : "neutral";
  const secondaryTone = tones.includes(secondary) ? secondary : "none";
  const amount = clampMix(mix);
  if (secondaryTone === "none" || amount <= 0) {
    return { tone: primaryTone, influenceTone: "none", mix: 0 };
  }
  return amount >= 0.65
    ? { tone: secondaryTone, influenceTone: primaryTone, mix: amount }
    : { tone: primaryTone, influenceTone: secondaryTone, mix: amount };
}

function toneInfluenceSentence(tone, mix) {
  if (mix <= 0) return "";
  if (tone === "concise") return "The language stays direct and restrained.";
  if (tone === "cinematic") return "The composition keeps a cinematic sense of depth, contrast, and atmosphere.";
  if (tone === "poetic") return "The image carries a more symbolic, emotionally suspended quality.";
  if (tone === "technical") return "Precise surface detail, lighting gradients, and depth cues guide the description.";
  if (tone === "neutral") return "The description stays balanced and plainly readable.";
  return "";
}

function finishSentence(value) {
  const text = sentenceCase(cleanSentencePart(value));
  return text ? `${text.replace(/[.!?]+$/g, "")}.` : "";
}

function structuredStyleSentence(values) {
  const styleRender = valueText(values.STYLE_RENDER);
  const styleLighting = valueText(values.STYLE_LIGHTING);
  const styleColor = valueText(values.STYLE_COLOR);
  const styleTexture = valueText(values.STYLE_TEXTURE);
  const styleMood = valueText(values.STYLE_MOOD);
  const clauses = [
    styleRender ? `the visual treatment uses ${styleRender}` : "",
    styleLighting ? `light reveals ${stripPrefix(styleLighting, ["with ", "under "])}` : "",
    styleColor ? `the scene uses a ${stripPrefix(styleColor, ["with ", "in "])} palette` : "",
    styleTexture ? `its surface shows ${stripPrefix(styleTexture, ["with "])}` : "",
    styleMood ? `the atmosphere leans toward ${styleMood}` : "",
  ].filter(Boolean);
  return clauses.length ? finishSentence(clauses.join("; ")) : "";
}

function structuredBlocksAndArtistsSentences(values, chaos) {
  let blocks = [
    "STYLE_BLOCK_LIGHTING",
    "STYLE_BLOCK_TEXTURE",
    "STYLE_BLOCK_ATMOSPHERE",
    "STYLE_BLOCK_CAMERA",
    "STYLE_BLOCK_CONCEPT",
  ]
    .map((name) => finishSentence(valueText(values[name])))
    .filter(Boolean);
  if (chaos < 0.25) blocks = blocks.slice(0, 1);
  else if (chaos < 0.65) blocks = blocks.slice(0, 2);
  const artists = ["ARTIST_1", "ARTIST_2", "ARTIST_3"]
    .map((name) => valueText(values[name]))
    .filter((artist, index, array) => artist && array.indexOf(artist) === index);
  const artistSentence = artists.length ? finishSentence(`The piece is influenced by ${naturalJoin(artists)}`) : "";
  if (chaos < 0.65 && artistSentence && blocks.length) {
    return [finishSentence(`${blocks[0].replace(/\.$/, "")}; the piece is influenced by ${naturalJoin(artists)}`)];
  }
  return [...blocks, artistSentence].filter(Boolean);
}

function composerDeckPrompt(values, separator) {
  const primary = valueText(values.PRIMARY_SUBJECT);
  const modifier = valueText(values.SUBJECT_MODIFIER);
  const primaryPhrase = modifier ? `${primary} ${modifier}` : primary;
  const secondary = [valueText(values.SECONDARY_SUBJECT_1), valueText(values.SECONDARY_SUBJECT_2)].filter(Boolean);
  const relationship = valueText(values.RELATIONSHIP) || "with";
  const environment = valueText(values.ENVIRONMENT);
  const sceneCore = secondary.length ? `${primaryPhrase} ${relationship} ${joinList(secondary)}` : primaryPhrase;
  const scene = environment ? `${sceneCore} in ${environment}` : sceneCore;
  const styleLayers = ["STYLE_LIGHTING", "STYLE_COLOR", "STYLE_TEXTURE", "STYLE_MOOD", "STYLE_RENDER"]
    .map((name) => valueText(values[name]))
    .filter(Boolean);
  const artists = ["ARTIST_1", "ARTIST_2", "ARTIST_3"]
    .map((name) => valueText(values[name]))
    .filter((artist, index, array) => artist && array.indexOf(artist) === index);
  const artistMix = artists.length ? `inspired by ${artists.join(" and ")}` : "";
  const blocks = [
    "STYLE_BLOCK_LIGHTING",
    "STYLE_BLOCK_TEXTURE",
    "STYLE_BLOCK_ATMOSPHERE",
    "STYLE_BLOCK_CAMERA",
    "STYLE_BLOCK_CONCEPT",
  ]
    .map((name) => valueText(values[name]))
    .filter(Boolean);
  const firstSentence = [scene, ...styleLayers, artistMix].filter(Boolean).join(separator);
  return [firstSentence, ...blocks].filter(Boolean).map((part) => `${part.replace(/\.+$/, "")}.`).join(" ");
}

function buildStructuredPrompt(values, chaos = 0.5) {
  const primaryTone = valueText(values.TONE_PRESET_PRIMARY) || valueText(values.TONE_PRESET) || "neutral";
  const { tone, influenceTone, mix } = resolveTone(primaryTone, valueText(values.TONE_PRESET_SECONDARY) || "none", values.TONE_MIX);
  const userPrompt = cleanSentencePart(values.USER_PROMPT);
  const primary = valueText(values.PRIMARY_SUBJECT);
  const modifier = valueText(values.SUBJECT_MODIFIER);
  const secondary = [valueText(values.SECONDARY_SUBJECT_1), valueText(values.SECONDARY_SUBJECT_2)].filter(Boolean);
  const relationship = valueText(values.RELATIONSHIP);
  const environment = valueText(values.ENVIRONMENT);
  const subject = [primary, modifier].filter(Boolean).join(" ");
  const subjectArticle = subject ? `a ${subject}` : "";
  const secondaryText = naturalJoin(secondary);
  const scenePlain = [
    subject ? `A ${subject}` : "",
    secondaryText ? `${relationship || "interacting with"} ${secondaryText}` : "",
    environment ? `set in ${environment}` : "",
  ].filter(Boolean).join(", ");
  const styleRender = valueText(values.STYLE_RENDER);
  const lighting = stripPrefix(valueText(values.STYLE_LIGHTING), ["with ", "under "]);
  const color = stripPrefix(valueText(values.STYLE_COLOR), ["with ", "in "]);
  const texture = stripPrefix(valueText(values.STYLE_TEXTURE), ["with "]);
  const mood = valueText(values.STYLE_MOOD);
  let blocks = [
    "STYLE_BLOCK_LIGHTING",
    "STYLE_BLOCK_TEXTURE",
    "STYLE_BLOCK_ATMOSPHERE",
    "STYLE_BLOCK_CAMERA",
    "STYLE_BLOCK_CONCEPT",
  ].map((name) => finishSentence(valueText(values[name]))).filter(Boolean);
  if (chaos < 0.25) blocks = blocks.slice(0, 1);
  else if (chaos < 0.65) blocks = blocks.slice(0, 2);
  const artists = ["ARTIST_1", "ARTIST_2", "ARTIST_3"]
    .map((name) => valueText(values[name]))
    .filter((artist, index, array) => artist && array.indexOf(artist) === index);
  const artistSentence = (prefix) => artists.length ? finishSentence(`${prefix} ${naturalJoin(artists)}`) : "";
  const sentences = [];
  if (userPrompt) sentences.push(finishSentence(userPrompt));

  if (tone === "concise") {
    const styleBits = [styleRender, lighting, color, texture].filter(Boolean);
    if (scenePlain) sentences.push(finishSentence(scenePlain));
    if (styleBits.length && chaos >= 0.25) sentences.push(finishSentence(`Rendered with ${naturalJoin(styleBits)}`));
    if (chaos >= 0.65 && artists.length) sentences.push(artistSentence("Inspired by"));
  } else if (tone === "cinematic") {
    let frame = subject ? `The frame captures ${subjectArticle}` : "The frame captures the scene";
    if (secondaryText) frame += ` ${relationship || "alongside"} ${secondaryText}`;
    if (environment) frame += ` in ${environment}`;
    sentences.push(finishSentence(frame));
    const cinematicBits = [
      lighting ? `light cuts through ${lighting}` : "",
      color ? `the scene holds a ${color} palette` : "",
      mood ? `shadows lean into ${mood}` : "",
      texture ? `surface detail catches ${texture}` : "",
      styleRender ? `the image plays as ${styleRender}` : "",
    ].filter(Boolean);
    if (cinematicBits.length && chaos >= 0.25) sentences.push(finishSentence(cinematicBits.join("; ")));
    if (chaos >= 0.65) sentences.push(...blocks);
    if (artists.length) sentences.push(artistSentence("Visually influenced by"));
  } else if (tone === "poetic") {
    let presence = subject ? `A presence emerges as ${subjectArticle}` : "A presence emerges";
    if (secondaryText) presence += `, ${relationship || "drifting with"} ${secondaryText}`;
    if (environment) presence += `, inside ${environment}`;
    sentences.push(finishSentence(presence));
    const poeticBits = [
      lighting ? `light breathes across ${lighting}` : "",
      color ? `${color} color moves through the image` : "",
      texture ? `forms dissolve into ${texture}` : "",
      mood ? `the image feels ${mood}` : "",
      styleRender ? `its shape remembers ${styleRender}` : "",
    ].filter(Boolean);
    if (poeticBits.length && chaos >= 0.25) sentences.push(finishSentence(poeticBits.join("; ")));
    if (chaos >= 0.65) sentences.push(...blocks.slice(0, 2));
    if (artists.length) sentences.push(artistSentence("Echoing the language of"));
  } else if (tone === "technical") {
    if (scenePlain || subject) sentences.push(finishSentence(scenePlain || subject));
    const technicalBits = [
      styleRender ? `rendering style: ${styleRender}` : "",
      lighting ? `lighting: ${lighting}` : "",
      color ? `color palette: ${color}` : "",
      texture ? `surface detail: ${texture}` : "",
      mood ? `mood target: ${mood}` : "",
    ].filter(Boolean);
    if (technicalBits.length && chaos >= 0.25) sentences.push(finishSentence(`Technical direction includes ${naturalJoin(technicalBits)}`));
    if (blocks.length && chaos >= 0.65) sentences.push(finishSentence(`The image includes these features: ${naturalJoin(blocks.map((block) => block.replace(/\.$/, "")))}`));
    if (artists.length) sentences.push(artistSentence("Influenced by"));
  } else {
    const sceneParts = [
      subject ? `A ${subject}` : "",
    secondary.length ? `${relationship || "interacting with"} ${naturalJoin(secondary)}` : "",
    environment ? `set in ${environment}` : "",
  ].filter(Boolean);
    const sceneSentence = finishSentence(sceneParts.join(", "));
    if (sceneSentence) sentences.push(sceneSentence);
    const styleSentence = structuredStyleSentence(values);
    if (styleSentence && (chaos >= 0.25 || sentences.length <= 1)) sentences.push(styleSentence);
    const tail = structuredBlocksAndArtistsSentences(values, chaos);
    if (chaos >= 0.65) sentences.push(...tail);
    else if (chaos >= 0.25 && tail.length) sentences.push(tail[0]);
    else if (!sceneSentence && tail.length) sentences.push(tail[0]);
  }
  const influenceSentence = toneInfluenceSentence(influenceTone, mix);
  if (influenceSentence && chaos >= 0.25) {
    if (mix < 0.5 && sentences.length > 1) {
      sentences[1] = finishSentence(`${sentences[1].replace(/\.$/, "")}; ${influenceSentence[0].toLowerCase() + influenceSentence.slice(1).replace(/\.$/, "")}`);
    } else {
      sentences.splice(Math.min(sentences.length, 3), 0, influenceSentence);
    }
  }
  return sentences.filter(Boolean).join(" ").replace(/\s+/g, " ").replace(/\.\.+/g, ".").trim();
}

function finalPrompt(node) {
  const separator = getWidget(node, "separator")?.value ?? ", ";
  const values = currentValues(node);
  const userPrompt = String(values.USER_PROMPT || "").trim();
  values.TONE_PRESET = getWidget(node, "TONE_PRESET")?.value ?? "";
  values.TONE_MIX = getWidget(node, "TONE_MIX")?.value ?? 0;
  if (getWidget(node, "STRUCTURED_MODE")?.value !== false) {
    return buildStructuredPrompt(values, chaosValue(node));
  }
  const deckPrompt = composerDeckPrompt(values, separator);
  return [userPrompt, deckPrompt].filter(Boolean).join(separator);
}

function chaosValue(node) {
  if (node?.promptDeckComposerRuntimeChaos !== undefined) {
    return node.promptDeckComposerRuntimeChaos;
  }
  const raw = Number(getWidget(node, "CHAOS_LEVEL")?.value);
  if (!Number.isFinite(raw)) return 0.5;
  return Math.min(1, Math.max(0, raw));
}

function chaosLabel(value) {
  if (value < 0.25) return "CALM";
  if (value < 0.65) return "BALANCED";
  return "WILD";
}

function secondaryCountForChaos(value) {
  if (value < 0.25) return randomFromArray([0, 0, 1]);
  if (value < 0.65) return randomFromArray([0, 1, 1, 2]);
  return randomFromArray([1, 1, 2, 2]);
}

function artistCountForChaos(value) {
  if (value < 0.25) return randomFromArray([0, 1]);
  if (value < 0.65) return randomFromArray([1, 1, 2]);
  return randomFromArray([2, 2, 3]);
}

function blockCountForChaos(value) {
  if (value < 0.25) return randomFromArray([0, 0, 1]);
  if (value < 0.65) return randomFromArray([1, 1, 2]);
  if (value < 0.90) return randomFromArray([2, 2, 3, 4]);
  return randomFromArray([3, 4, 5]);
}

function blockLimitForChaos(value) {
  if (value < 0.25) return 1;
  if (value < 0.65) return 2;
  if (value < 0.90) return 4;
  return 5;
}

function randomFromArray(values) {
  return values[Math.floor(Math.random() * values.length)];
}

function resolveConsistencyTheme(node, widgetName) {
  const theme = String(getWidget(node, widgetName)?.value || "any");
  if (theme === "any" || theme === "random") {
    const values = (getWidget(node, widgetName)?.options?.values || []).filter((item) => item !== "any" && item !== "random" && THEME_KEYWORDS[item]);
    return randomFromArray(values.length ? values : Object.keys(THEME_KEYWORDS));
  }
  return THEME_KEYWORDS[theme] ? theme : null;
}

function themeStackValues(node) {
  return THEME_STACK_WIDGETS.map((name) => String(getWidget(node, name)?.value || "any"));
}

function resolvedThemeForWidget(node, widgetName) {
  const key = THEME_STACK_KEYS[widgetName];
  const resolved = key ? node?.promptDeckComposerResolvedTheme?.[key] : null;
  if (resolved) return resolved;
  const selected = String(getWidget(node, widgetName)?.value || "any");
  if (selected && selected !== "any" && selected !== "random" && THEME_KEYWORDS[selected]) return selected;
  return "";
}

function themeStackResolvedValues(node) {
  return THEME_STACK_WIDGETS.map((name) => resolvedThemeForWidget(node, name));
}

function syncResolvedThemeAfterSelection(node, widgetName) {
  const key = THEME_STACK_KEYS[widgetName];
  if (!key) return;
  node.promptDeckComposerResolvedTheme = node.promptDeckComposerResolvedTheme || {};
  const selected = String(getWidget(node, widgetName)?.value || "any");
  if (selected !== "any" && selected !== "random" && THEME_KEYWORDS[selected]) {
    node.promptDeckComposerResolvedTheme[key] = selected;
  } else {
    delete node.promptDeckComposerResolvedTheme[key];
  }
}

function consistencyContext(node) {
  if (getWidget(node, "CONSISTENCY_MODE")?.value !== true) return null;
  let resolvedTheme = node.promptDeckComposerRuntimeResolvedTheme;
  if (!resolvedTheme) {
    resolvedTheme = {};
    for (const name of THEME_STACK_WIDGETS) {
      const key = THEME_STACK_KEYS[name];
      if (key) resolvedTheme[key] = resolveConsistencyTheme(node, name);
    }
    node.promptDeckComposerRuntimeResolvedTheme = resolvedTheme;
  }
  node.promptDeckComposerResolvedTheme = resolvedTheme;
  let themes = Object.values(resolvedTheme).filter(Boolean);
  const themeWeights = {};
  for (const [themeWidgetName, category] of Object.entries(THEME_STACK_KEYS)) {
    const theme = resolvedTheme[category];
    if (!theme) continue;
    const weightWidgetName = THEME_STACK_WEIGHT_WIDGETS[themeWidgetName];
    const weight = clampMix(getWidget(node, weightWidgetName)?.value ?? 0.5);
    themeWeights[theme] = Math.max(themeWeights[theme] ?? 0, weight);
  }
  if (!themes.length) {
    const legacy = resolveConsistencyTheme(node, "CONSISTENCY_THEME");
    themes = legacy ? [legacy] : [];
  }
  if (!themes.length) return null;
  node.promptDeckComposerLastConsistencyThemes = themes;
  const strength = node?.promptDeckComposerRuntimeConsistencyStrength !== undefined
    ? node.promptDeckComposerRuntimeConsistencyStrength
    : clampMix(getWidget(node, "CONSISTENCY_STRENGTH")?.value ?? 0.65);
  return { themes, theme: themes[0], strength, themeWeights };
}

function themeMatches(options, consistencyOrTheme) {
  const themes = Array.isArray(consistencyOrTheme?.themes)
    ? consistencyOrTheme.themes
    : [typeof consistencyOrTheme === "string" ? consistencyOrTheme : consistencyOrTheme?.theme].filter(Boolean);
  const themeWeights = consistencyOrTheme?.themeWeights || {};
  const weighted = [];
  for (const theme of themes) {
    const keywords = THEME_KEYWORDS[theme] || [];
    const weight = clampMix(themeWeights[theme] ?? 0.5);
    const multiplier = Math.round(weight * 8);
    if (multiplier <= 0) continue;
    const matches = options.filter((option) => {
      const text = String(option).toLowerCase();
      return option !== NONE_VALUE && keywords.some((keyword) => text.includes(keyword));
    });
    for (let index = 0; index < multiplier; index += 1) {
      weighted.push(...matches);
    }
  }
  return weighted;
}

function optionValues(widget, allowNone = true) {
  const values = Array.isArray(widget?.options?.values) ? widget.options.values : [];
  return values
    .map((value) => String(value))
    .filter((value) => value && (allowNone || value !== NONE_VALUE));
}

function pickFromWidgetOptions(widget, allowNone = false, consistency = null) {
  const values = optionValues(widget, allowNone);
  if (!allowNone && consistency) {
    const biased = themeMatches(values, consistency);
    if (biased.length && Math.random() < consistency.strength) return randomFromArray(biased);
  }
  return values.length ? randomFromArray(values) : NONE_VALUE;
}

function uniqueChoicesFromWidgetOptions(widget, count, excluded = [], consistency = null) {
  const excludedSet = new Set(excluded.filter((value) => value && value !== NONE_VALUE));
  const values = optionValues(widget, false).filter((value) => !excludedSet.has(value));
  const result = [];
  if (consistency) {
    const biased = themeMatches(values, consistency);
    if (biased.length && Math.random() < consistency.strength) {
      while (biased.length && result.length < count) {
        const index = Math.floor(Math.random() * biased.length);
        const next = biased.splice(index, 1)[0];
        if (result.includes(next)) continue;
        result.push(next);
        for (let removeIndex = biased.length - 1; removeIndex >= 0; removeIndex -= 1) {
          if (biased[removeIndex] === next) biased.splice(removeIndex, 1);
        }
      }
    }
  }
  const remaining = values.filter((value) => !result.includes(value));
  while (remaining.length && result.length < count) {
    const index = Math.floor(Math.random() * remaining.length);
    result.push(remaining.splice(index, 1)[0]);
  }
  return result;
}

function isFieldLocked(node, widgetName) {
  return getWidget(node, FIELD_LOCK_BY_WIDGET[widgetName])?.value === true;
}

function isGroupLocked(node, groupName) {
  const names = {
    scene: "LOCK_SCENE_STRUCTURE",
    style: "LOCK_STYLE_LAYERS",
    artists: "LOCK_ARTIST_MIX",
    blocks: "LOCK_STYLE_BLOCKS",
  };
  return getWidget(node, names[groupName])?.value === true;
}

function setWidgetValueByName(node, name, value) {
  const widget = getWidget(node, name);
  if (widget) {
    setWidgetValue(node, widget, value, false);
  }
}

function deactivateAutoCompose(node, options = {}) {
  const widget = randomizeWidget(node);
  if (widget) {
    setWidgetValue(node, widget, false, false);
    if (options.preserveCollapse !== true) {
      syncAutoComposeCollapse(node);
    } else {
      node.promptDeckComposerLastAutoCompose = false;
      node.setDirtyCanvas?.(true, true);
    }
  }
}

function chancePick(node, widgetName, chance, consistency = null) {
  return Math.random() < chance ? pickFromWidgetOptions(getWidget(node, widgetName), false, consistency) : NONE_VALUE;
}

function randomizeToneWidgets(node) {
  if (getWidget(node, "RANDOM_TONE")?.value !== true) {
    return;
  }
  const tones = ["neutral", "concise", "cinematic", "poetic", "technical"];
  const primary = randomFromArray(tones);
  setWidgetValueByName(node, "TONE_PRESET_PRIMARY", primary);
  if (Math.random() < 0.5) {
    setWidgetValueByName(node, "TONE_PRESET_SECONDARY", "none");
    setWidgetValueByName(node, "TONE_MIX", 0);
    return;
  }
  setWidgetValueByName(node, "TONE_PRESET_SECONDARY", randomFromArray(tones.filter((tone) => tone !== primary)));
  setWidgetValueByName(node, "TONE_MIX", randomFromArray([0.25, 0.35, 0.5, 0.65]));
}

function chaosLayout(width, includeRandom = false) {
  const layout = rowLayout(width, { minInput: 156, maxLabel: 140 });
  const boxHeight = 22;
  const trackInset = 12;
  const randomButtonX = layout.inputX + layout.inputWidth - RANDOM_TOGGLE_WIDTH;
  const sliderWidth = includeRandom ? Math.max(64, layout.inputWidth - RANDOM_TOGGLE_WIDTH - RANDOM_TOGGLE_GAP) : layout.inputWidth;
  return {
    ...layout,
    boxHeight,
    trackInset,
    trackX: layout.inputX + trackInset,
    trackWidth: Math.max(1, sliderWidth - trackInset * 2),
    sliderWidth,
    randomButtonX,
    randomButtonWidth: RANDOM_TOGGLE_WIDTH,
  };
}

function setChaosFromPointer(node, row, pos) {
  const widget = getWidget(node, row.name);
  if (!widget) return false;
  const width = node.size?.[0] || DEFAULT_NODE_WIDTH;
  const layout = chaosLayout(width, true);
  const raw = (pos[0] - layout.trackX) / layout.trackWidth;
  const next = Math.round(Math.min(1, Math.max(0, raw)) * 100) / 100;
  setWidgetValue(node, widget, Number(next.toFixed(2)));
  node.setDirtyCanvas?.(true, true);
  return true;
}

function randomToggleForRow(rowName) {
  if (rowName === "CHAOS_LEVEL") return "RANDOM_CHAOS_LEVEL";
  if (rowName === "CONSISTENCY_STRENGTH") return "RANDOM_CONSISTENCY_STRENGTH";
  if (rowName === "TONE_MIX") return "RANDOM_TONE";
  return null;
}

function drawRandomToggle(ctx, node, widgetName, x, y, width, height) {
  const widget = getWidget(node, widgetName);
  const enabled = widget?.value === true;
  drawRoundRect(ctx, x, y, width, height, 6);
  ctx.fillStyle = enabled ? "#1f5f43" : "#2d333d";
  ctx.fill();
  ctx.strokeStyle = enabled ? "#5ee0a0" : "#555f70";
  ctx.stroke();
  ctx.fillStyle = enabled ? "#d8ffe9" : "#dbe3ee";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("R", x + width / 2, y + height / 2);
}

function toggleRandomForRow(node, widgetName) {
  const widget = getWidget(node, widgetName);
  if (!widget) return false;
  setWidgetValue(node, widget, widget.value !== true);
  node.setDirtyCanvas?.(true, true);
  return true;
}

function updatePreview(node, prompt = finalPrompt(node), expandedPrompt = "") {
  const hadExpanded = Boolean(node.promptDeckComposerExpandedPreview);
  node.promptDeckComposerBasePreview = String(prompt || "");
  node.promptDeckComposerExpandedPreview = String(expandedPrompt || "");
  const insightHeightChanged = updateResultInsightLayout(node, { resize: false });
  const hasExpanded = Boolean(node.promptDeckComposerExpandedPreview);
  node.promptDeckComposerPreview = formatPromptPreview(
    node.promptDeckComposerBasePreview,
    node.promptDeckComposerExpandedPreview,
    hasExpanded
  );
  const previewWidget = getWidget(node, "Final Prompt Preview");
  if (previewWidget) {
    previewWidget.promptDeckComposerNode = node;
  }
  const insightWidget = getWidget(node, "Result Insight");
  if (insightWidget) {
    insightWidget.promptDeckComposerNode = node;
  }
  if (hadExpanded !== hasExpanded || insightHeightChanged) {
    resizeNodeToContent(node);
  }
  node.setDirtyCanvas?.(true, true);
  return node.promptDeckComposerPreview;
}

function formatPromptPreview(basePrompt, expandedPrompt = "", showExpanded = false) {
  const base = String(basePrompt || "").trim();
  const expanded = String(expandedPrompt || "").trim();
  if (!showExpanded || !expanded || expanded === base) {
    return base;
  }
  return `--- BASE PROMPT ---\n${base}\n\n--- EXPANDED PROMPT ---\n${expanded}`;
}

function copyTextToClipboard(text) {
  const value = String(text || "");
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(value)
      .then(() => true)
      .catch((error) => {
        report(error);
        return false;
      });
  }
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  document.body.appendChild(textarea);
  textarea.select();
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    report(error);
  }
  textarea.remove();
  return Promise.resolve(copied);
}

function cleanupPreviewDom(node) {
  guard(() => node?.promptDeckComposerPreviewDom?.root?.remove?.());
  if (node) {
    node.promptDeckComposerPreviewDom = null;
  }
}

function openPromptDialog(title, text) {
  const root = document.createElement("div");
  root.style.position = "fixed";
  root.style.inset = "0";
  root.style.zIndex = "10000";
  root.style.background = "rgba(8, 10, 14, 0.62)";
  root.style.display = "flex";
  root.style.alignItems = "center";
  root.style.justifyContent = "center";
  root.style.padding = "24px";
  root.style.boxSizing = "border-box";

  const panel = document.createElement("div");
  panel.style.width = "min(860px, 96vw)";
  panel.style.maxHeight = "86vh";
  panel.style.background = "#1b2027";
  panel.style.border = "1px solid #4d5664";
  panel.style.borderRadius = "8px";
  panel.style.padding = "12px";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";
  panel.style.gap = "8px";
  panel.style.boxShadow = "0 18px 60px rgba(0,0,0,0.45)";

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.gap = "8px";

  const label = document.createElement("div");
  label.textContent = title;
  label.style.color = "#edf2f7";
  label.style.font = "bold 13px sans-serif";

  const close = document.createElement("button");
  close.textContent = "Close";
  close.type = "button";
  close.style.border = "1px solid #5f7fa4";
  close.style.borderRadius = "5px";
  close.style.background = "#26323f";
  close.style.color = "#edf2f7";
  close.style.padding = "4px 10px";
  close.style.cursor = "pointer";

  const textarea = document.createElement("textarea");
  textarea.readOnly = true;
  textarea.value = String(text || "");
  textarea.style.width = "100%";
  textarea.style.height = "min(62vh, 520px)";
  textarea.style.resize = "vertical";
  textarea.style.overflowY = "auto";
  textarea.style.boxSizing = "border-box";
  textarea.style.border = "1px solid #4d5664";
  textarea.style.borderRadius = "6px";
  textarea.style.background = "#20252d";
  textarea.style.color = "#edf2f7";
  textarea.style.padding = "10px";
  textarea.style.font = "12px sans-serif";
  textarea.style.lineHeight = "16px";

  const remove = () => root.remove();
  close.addEventListener("click", remove);
  root.addEventListener("click", (event) => {
    if (event.target === root) remove();
  });
  root.addEventListener("keydown", (event) => {
    if (event.key === "Escape") remove();
  });
  header.append(label, close);
  panel.append(header, textarea);
  root.append(panel);
  document.body.appendChild(root);
  textarea.focus();
  textarea.select();
}

function openImageDialog(title, imageUrl) {
  if (!imageUrl) return;
  const root = document.createElement("div");
  root.style.position = "fixed";
  root.style.inset = "0";
  root.style.zIndex = "10001";
  root.style.background = "rgba(4, 6, 10, 0.78)";
  root.style.display = "flex";
  root.style.alignItems = "center";
  root.style.justifyContent = "center";
  root.style.padding = "28px";
  root.style.boxSizing = "border-box";

  const panel = document.createElement("div");
  panel.style.maxWidth = "94vw";
  panel.style.maxHeight = "92vh";
  panel.style.background = "#141922";
  panel.style.border = "1px solid #5d6d82";
  panel.style.borderRadius = "10px";
  panel.style.padding = "12px";
  panel.style.display = "flex";
  panel.style.flexDirection = "column";
  panel.style.gap = "10px";
  panel.style.boxShadow = "0 22px 80px rgba(0,0,0,0.58)";

  const header = document.createElement("div");
  header.style.display = "flex";
  header.style.justifyContent = "space-between";
  header.style.alignItems = "center";
  header.style.gap = "12px";

  const label = document.createElement("div");
  label.textContent = title || "Result thumbnail";
  label.style.color = "#edf2f7";
  label.style.font = "bold 13px sans-serif";
  label.style.maxWidth = "72vw";
  label.style.overflow = "hidden";
  label.style.textOverflow = "ellipsis";
  label.style.whiteSpace = "nowrap";

  const close = document.createElement("button");
  close.textContent = "Close";
  close.type = "button";
  close.style.border = "1px solid #7f96b4";
  close.style.borderRadius = "6px";
  close.style.background = "#26323f";
  close.style.color = "#edf2f7";
  close.style.padding = "5px 12px";
  close.style.cursor = "pointer";

  const image = document.createElement("img");
  image.src = imageUrl;
  image.alt = title || "Result thumbnail";
  image.style.maxWidth = "90vw";
  image.style.maxHeight = "82vh";
  image.style.objectFit = "contain";
  image.style.borderRadius = "7px";
  image.style.background = "#0e131a";
  image.style.alignSelf = "center";

  const remove = () => {
    document.removeEventListener("keydown", onKeyDown);
    root.remove();
  };
  const onKeyDown = (event) => {
    if (event.key === "Escape") remove();
  };
  close.addEventListener("click", remove);
  root.addEventListener("click", (event) => {
    if (event.target === root) remove();
  });
  document.addEventListener("keydown", onKeyDown);
  header.append(label, close);
  panel.append(header, image);
  root.append(panel);
  document.body.appendChild(root);
  close.focus();
}

function findPreviewButton(custom, pos, requireEnabled = false) {
  return custom.promptDeckComposerPreviewButtonRects?.find((item) =>
    (!requireEnabled || item.enabled) &&
    pos[0] >= item.x &&
    pos[0] <= item.x + item.width &&
    pos[1] >= item.y &&
    pos[1] <= item.y + item.height
  );
}

function showPreviewCopyFeedback(node, key) {
  node.promptDeckComposerCopyFeedback = {
    key,
    until: performance.now() + 1000,
  };
  node.setDirtyCanvas?.(true, true);
  setTimeout(() => node.setDirtyCanvas?.(true, true), 1000);
}

function weightRole(value) {
  const weight = clampMix(value);
  if (weight < 0.25) return "minor";
  if (weight < 0.5) return "supporting";
  if (weight < 0.75) return "strong";
  return "dominant";
}

function prettyCategory(category) {
  return String(category || "").toUpperCase();
}

function themeStackWeightValues(node) {
  return {
    world: clampMix(getWidget(node, "CONSISTENCY_WORLD_WEIGHT")?.value ?? 0.5),
    culture: clampMix(getWidget(node, "CONSISTENCY_CULTURE_WEIGHT")?.value ?? 0.5),
    material: clampMix(getWidget(node, "CONSISTENCY_MATERIAL_WEIGHT")?.value ?? 0.5),
    concept: clampMix(getWidget(node, "CONSISTENCY_CONCEPT_WEIGHT")?.value ?? 0.5),
  };
}

function currentToneState(node) {
  return {
    primary: String(getWidget(node, "TONE_PRESET_PRIMARY")?.value || getWidget(node, "TONE_PRESET")?.value || "neutral"),
    secondary: String(getWidget(node, "TONE_PRESET_SECONDARY")?.value || "none"),
    mix: clampMix(getWidget(node, "TONE_MIX")?.value ?? 0),
  };
}

function resultInsightInfluence(weights) {
  const entries = Object.entries(weights)
    .map(([category, weight]) => ({ category, weight, role: weightRole(weight) }))
    .sort((a, b) => b.weight - a.weight);
  let dominant = entries.filter((item) => item.weight >= 0.75).slice(0, 2).map((item) => item.category);
  if (!dominant.length && entries[0]) {
    dominant = [entries[0].category];
  }
  const dominantSet = new Set(dominant);
  const supporting = entries
    .filter((item) => !dominantSet.has(item.category) && item.weight >= 0.25)
    .map((item) => item.category);
  const minor = entries
    .filter((item) => !dominantSet.has(item.category) && item.weight < 0.25)
    .map((item) => item.category);
  return { dominant, supporting, minor, entries };
}

function insightToneChoice(tones) {
  const primary = tones.primary || "neutral";
  const secondary = tones.secondary && tones.secondary !== "none" ? tones.secondary : null;
  if (!secondary || tones.mix <= 0) return { main: primary, accent: null, mix: tones.mix };
  if (tones.mix >= 0.65) return { main: secondary, accent: primary, mix: tones.mix };
  return { main: primary, accent: secondary, mix: tones.mix };
}

function naturalizeRole(category, value, role) {
  const phrases = {
    dominant: {
      world: `${value} world`,
      culture: `${value} order`,
      material: `${value} dominance`,
      concept: `${value} dominance`,
    },
    strong: {
      world: `strong ${value} setting`,
      culture: `${value} structure`,
      material: `${value} textures`,
      concept: `${value} emphasis`,
    },
    supporting: {
      world: `${value} presence`,
      culture: `${value} influence`,
      material: `${value} surface detail`,
      concept: `${value} undertone`,
    },
    minor: {
      world: `faint ${value} trace`,
      culture: `subtle ${value} trace`,
      material: `subtle ${value} detail`,
      concept: `faint ${value} echo`,
    },
  };
  return phrases[role]?.[category] || `${value} ${category}`;
}

function materialTerm(value, role) {
  if (role === "minor") return `subtle ${value} detail`;
  if (role === "supporting") return `${value} surface detail`;
  return `${value} textures`;
}

function cultureTerm(value, role) {
  if (role === "minor") return `${value} traces`;
  if (role === "supporting") return `${value} influence`;
  return `${value} structure`;
}

function conceptTerm(value, role) {
  if (role === "minor") return `faint ${value} echo`;
  if (role === "supporting") return `${value} undertone`;
  if (role === "strong") return `${value} dominance`;
  return `${value} dominance`;
}

function accentClause(tone, accent) {
  if (!accent || tone.mix <= 0.3) return "";
  if (accent === "cinematic") return ", forming a quiet cinematic frame";
  if (accent === "poetic") return ", carrying a quiet symbolic trace";
  if (accent === "neutral") return ", keeping the structure balanced";
  return "";
}

function withCount(text) {
  return String(text || "").split(" with ").length - 1;
}

function addTechnicalAccent(text, tone, mode, connector = "with") {
  if (tone.accent !== "technical" || tone.mix <= 0.3) return text;
  if (mode === "concise") return text;
  if (mode !== "neutral" && mode !== "cinematic") return text;
  if (text.length >= 120 || withCount(text) >= 2) return text;
  if (mode === "cinematic") {
    return `${text}, forming a clearly layered composition`;
  }
  return `${text}, forming a clearly layered structure ${connector}`;
}

function buildNeutralInsight(themes, weights, tone) {
  const relation = `${cultureTerm(themes.culture, weightRole(weights.culture))} and ${conceptTerm(themes.concept, weightRole(weights.concept))}`;
  const base = `A ${themes.world} world shaped by ${materialTerm(themes.material, weightRole(weights.material))}`;
  if (tone.accent === "technical" && tone.mix > 0.3) {
    const technical = addTechnicalAccent(base, tone, "neutral", `with ${relation}`);
    if (technical !== base) return `${technical}.`;
  }
  return `${base}, with ${relation}${accentClause(tone, tone.accent)}.`;
}

function buildConciseInsight(themes, weights, tone) {
  return `${themes.world} world, ${materialTerm(themes.material, weightRole(weights.material))}, ${conceptTerm(themes.concept, weightRole(weights.concept))}, ${cultureTerm(themes.culture, weightRole(weights.culture))}.`;
}

function buildCinematicInsight(themes, weights, tone) {
  const atmosphere = tone.accent === "poetic" ? "quiet" : "dramatic";
  const base = `A ${atmosphere} ${themes.world} scene shaped by ${materialTerm(themes.material, weightRole(weights.material))}`;
  const technical = addTechnicalAccent(base, tone, "cinematic");
  const relation = `${conceptTerm(themes.concept, weightRole(weights.concept))} and ${cultureTerm(themes.culture, weightRole(weights.culture))} beneath the surface`;
  return `${technical}, with ${relation}.`;
}

function buildPoeticInsight(themes, weights, accent) {
  const world = themes.world;
  const culture = themes.culture;
  const material = themes.material;
  const concept = themes.concept;
  const conceptTrace = weightRole(weights.concept) === "minor" ? `a faint ${concept} echo` : `${concept} echoes`;
  const cultureTrace = weightRole(weights.culture) === "minor" ? `${culture} traces` : `${culture} memory`;
  if (accent === "cinematic") {
    return `The ${world} breath settles into ${material}, carrying ${conceptTrace} and ${cultureTrace} beneath the frame.`;
  }
  return `The ${world} breath settles into ${material}, carrying ${conceptTrace} and ${cultureTrace}.`;
}

function buildTechnicalInsight(themes, weights, influence) {
  const roleOrder = { dominant: 0, strong: 1, supporting: 2, minor: 3 };
  const categoryOrder = { world: 0, material: 1, concept: 2, culture: 3 };
  const sorted = [...influence.entries].sort((a, b) =>
    roleOrder[a.role] - roleOrder[b.role] || categoryOrder[a.category] - categoryOrder[b.category]
  );
  const entryPhrase = (entry) => {
    const role = entry.role === "strong" ? "strong" : entry.role;
    return `${role} ${prettyCategory(entry.category)} (${themes[entry.category]})`;
  };
  return `${sorted.map(entryPhrase).join(", ")}.`;
}

function fixArticle(text) {
  if (!text) return text;
  const vowelSound = (word) => {
    const lower = String(word || "").toLowerCase();
    if (/^(uni([^nmd]|$)|university|unicorn|use|user|usual|ubiquit|ukulele|euro|eul|one|once)/.test(lower)) {
      return false;
    }
    if (/^(honest|honor|hour|heir|herb)/.test(lower)) {
      return true;
    }
    return /^[aeiou]/.test(lower);
  };
  return String(text).replace(/\b([Aa])n?\s+([A-Za-z][A-Za-z-]*)/g, (match, article, word) => {
    const needsAn = vowelSound(word);
    const next = article === "A" ? (needsAn ? "An" : "A") : (needsAn ? "an" : "a");
    return `${next} ${word}`;
  });
}

function reduceRepeatedInsightWords(text) {
  if (!text) return text;
  const replacements = {
    structure: ["order", "formation", "presence"],
  };
  return String(text).replace(/\b(structure)\b/gi, (match, word, offset, source) => {
    const before = source.slice(0, offset).toLowerCase();
    const countBefore = (before.match(new RegExp(`\\b${word.toLowerCase()}\\b`, "g")) || []).length;
    if (countBefore === 0) return match;
    const options = replacements[word.toLowerCase()] || [];
    return options[(countBefore - 1) % options.length] || match;
  });
}

function cleanInsightDescription(text) {
  return fixArticle(reduceRepeatedInsightWords(text));
}

function buildInsightDescription(themes, weights, influence, tones) {
  const world = themes.world;
  const culture = themes.culture;
  const material = themes.material;
  const concept = themes.concept;
  const tone = insightToneChoice(tones);
  if (tone.main === "technical") {
    tone.main = tone.accent === "concise" ? "concise" : "neutral";
    tone.accent = "technical";
  }
  const builders = {
    neutral: () => buildNeutralInsight(themes, weights, tone),
    concise: () => buildConciseInsight(themes, weights, tone),
    cinematic: () => buildCinematicInsight(themes, weights, tone),
    poetic: () => buildPoeticInsight(themes, weights, tone.accent),
    technical: () => buildTechnicalInsight(themes, weights, influence, tone.accent),
  };
  const fallback = {
    neutral: `A ${world} world shaped by ${material} textures, with ${culture} influence and ${concept} undertones.`,
    concise: `${world} world, ${material} textures, ${concept} undertone, ${culture} influence.`,
    cinematic: `A ${world} scene shaped by ${material} textures, with ${concept} and ${culture} beneath the surface.`,
    poetic: `${material} holds the ${world} quiet, carrying ${culture} traces toward ${concept}.`,
    technical: `${prettyCategory(influence.entries[0]?.category || "world")} (${themes[influence.entries[0]?.category] || world}) leads; ${prettyCategory(influence.entries[1]?.category || "material")} and ${prettyCategory(influence.entries[2]?.category || "concept")} support.`,
  };
  const limit = tone.main === "poetic" ? 180 : 160;
  const result = (builders[tone.main] || builders.neutral)();
  if (result.length <= limit) {
    return cleanInsightDescription(result);
  }
  return cleanInsightDescription(fallback[tone.main] || fallback.neutral);
}

function buildResultInsight(node) {
  const themeStack = {
    world: resolvedThemeForWidget(node, "CONSISTENCY_WORLD_THEME"),
    culture: resolvedThemeForWidget(node, "CONSISTENCY_CULTURE_THEME"),
    material: resolvedThemeForWidget(node, "CONSISTENCY_MATERIAL_THEME"),
    concept: resolvedThemeForWidget(node, "CONSISTENCY_CONCEPT_THEME"),
  };
  const weights = themeStackWeightValues(node);
  const tones = currentToneState(node);
  const influence = resultInsightInfluence(weights);
  const ready = Object.values(themeStack).every(Boolean);
  if (!ready) {
    return {
      themeStack,
      weights,
      tones,
      influence,
      ready: false,
      description: "",
      status: "Generating insight...",
    };
  }
  const description = buildInsightDescription(themeStack, weights, influence, tones);
  return { themeStack, weights, tones, influence, ready: true, description, status: "" };
}

function resultInsightHeightFor(node, width) {
  if (!node) return RESULT_INSIGHT_HEIGHT;
  const insight = node?.promptDeckComposerResultInsight || buildResultInsight(node);
  const textWidth = Math.max(180, width - 44);
  const charsPerLine = Math.max(28, Math.floor(textWidth / 6.4));
  const descriptionLength = insight.ready ? String(insight.description || "").length + 2 : String(insight.status || "").length;
  const descriptionLines = Math.max(1, Math.ceil(descriptionLength / charsPerLine));
  return 88 + descriptionLines * 16 + 34;
}

function updateResultInsightLayout(node, options = {}) {
  if (!node) return false;
  const previousHeight = node.promptDeckComposerResultInsightHeight;
  node.promptDeckComposerResultInsight = buildResultInsight(node);
  node.promptDeckComposerResultInsightHeight = resultInsightHeightFor(node, node.size?.[0] || DEFAULT_NODE_WIDTH);
  const insightWidget = getWidget(node, "Result Insight");
  if (insightWidget) {
    insightWidget.promptDeckComposerNode = node;
  }
  const changed = previousHeight !== node.promptDeckComposerResultInsightHeight;
  if (options.resize !== false && changed) {
    resizeNodeToContent(node);
  }
  if (options.dirty !== false) {
    node.setDirtyCanvas?.(true, true);
  }
  return changed;
}

function recentResultTitle(insight) {
  const stack = insight?.themeStack || {};
  return ["world", "culture", "material", "concept"].map((key) => stack[key]).filter(Boolean).join(" / ") || "untitled result";
}

function toneMeta(tones) {
  if (!tones) return "Tone: neutral";
  const secondary = tones.secondary && tones.secondary !== "none" ? ` + ${tones.secondary} ${Number(tones.mix || 0).toFixed(2)}` : "";
  return `Tone: ${tones.primary || "neutral"}${secondary}`;
}

function weightMeta(weights) {
  const value = (key) => Number(weights?.[key] ?? 0.5).toFixed(2);
  return `Weight: W ${value("world")} / C ${value("culture")} / M ${value("material")} / P ${value("concept")}`;
}

function makeRecentResult(node) {
  const insight = node.promptDeckComposerResultInsight || buildResultInsight(node);
  const basePrompt = node.promptDeckComposerBasePreview ?? finalPrompt(node);
  const expandedPrompt = node.promptDeckComposerExpandedPreview || "";
  const themeStack = insight.themeStack || {};
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    created_at: new Date().toISOString(),
    title: recentResultTitle(insight),
    base_prompt: String(basePrompt || ""),
    expanded_prompt: String(expandedPrompt || ""),
    insight: String(insight.description || ""),
    insight_description: String(insight.description || ""),
    theme_stack: themeStack,
    themeStack,
    weights: insight.weights || themeStackWeightValues(node),
    tones: insight.tones || currentToneState(node),
    chaos: clampMix(getWidget(node, "CHAOS_LEVEL")?.value ?? 0.5),
    chaos_level: clampMix(getWidget(node, "CHAOS_LEVEL")?.value ?? 0.5),
    consistency_strength: clampMix(getWidget(node, "CONSISTENCY_STRENGTH")?.value ?? 0.65),
    seed: getWidget(node, "seed")?.value ?? 0,
    run_started_at: node.promptDeckComposerRunStartedAt || null,
    values: allWidgetValues(node),
    final_prompt: expandedPrompt || basePrompt,
    image: { status: "settings_only", filename: "", subfolder: "", type: "composer_thumbnail", source: null },
  };
}

async function saveRecentResult(node) {
  const result = makeRecentResult(node);
  try {
    const results = await saveRecentResultToServer(node, result);
    const saved = results?.[0] || result;
    const status = normalizeImageInfo(saved.image).status;
    node.promptDeckComposerSaveResultStatus =
      status === "output_copied" ? "Saved with output thumbnail" :
      status === "preview_copied" ? "Saved with preview thumbnail" :
      status === "missing" ? "Saved, thumbnail missing" :
      "Saved settings only";
    showPreviewCopyFeedback(node, "save_result");
    node.showAllResults = false;
    resizeNodeToContent(node);
    return result;
  } catch (error) {
    console.warn("[PromptDeckComposer] Save Result failed", error);
    node.promptDeckComposerSaveResultStatus = "Save failed";
    showPreviewCopyFeedback(node, "save_result");
    return null;
  }
}

function restoreRecentResult(node, result) {
  loadRecentResult(node, result, { preserveCollapse: true, disableRandom: true });
}

function disableRandomToggles(node) {
  deactivateAutoCompose(node, { preserveCollapse: true });
  for (const name of [
    "RANDOM_CHAOS_LEVEL",
    "RANDOM_CONSISTENCY_STRENGTH",
    "RANDOM_TONE",
    ...THEME_STACK_WEIGHT_RANDOM_NAMES,
  ]) {
    setWidgetValueByName(node, name, false);
  }
}

function applyResolvedThemeAsExplicit(node, result, fallbackValues = {}) {
  const themeStack = result?.theme_stack || result?.themeStack || {};
  const pairs = [
    ["CONSISTENCY_WORLD_THEME", "world"],
    ["CONSISTENCY_CULTURE_THEME", "culture"],
    ["CONSISTENCY_MATERIAL_THEME", "material"],
    ["CONSISTENCY_CONCEPT_THEME", "concept"],
  ];
  node.promptDeckComposerResolvedTheme = node.promptDeckComposerResolvedTheme || {};
  for (const [widgetName, key] of pairs) {
    const value = String(themeStack[key] || "");
    const widget = getWidget(node, widgetName);
    if (value && THEME_KEYWORDS[value] && widget?.options?.values?.includes(value)) {
      setWidgetValue(node, widget, value, false);
      node.promptDeckComposerResolvedTheme[key] = value;
    } else {
      const fallback = String(fallbackValues[widgetName] || "");
      if (fallback && fallback !== "any" && fallback !== "random" && THEME_KEYWORDS[fallback] && widget?.options?.values?.includes(fallback)) {
        setWidgetValue(node, widget, fallback, false);
        node.promptDeckComposerResolvedTheme[key] = fallback;
      } else {
        const current = String(widget?.value || "");
        if (current === "any" || current === "random" || !THEME_KEYWORDS[current]) {
          const firstExplicit = widget?.options?.values?.find((item) => item !== "any" && item !== "random" && THEME_KEYWORDS[item]);
          if (firstExplicit) {
            setWidgetValue(node, widget, firstExplicit, false);
            node.promptDeckComposerResolvedTheme[key] = firstExplicit;
          }
        }
      }
    }
  }
}

function loadRecentResult(node, result, options = {}) {
  if (!result) return;
  const previousThemeValues = Object.fromEntries(THEME_STACK_WIDGETS.map((name) => [name, String(getWidget(node, name)?.value || "")]));
  for (const [name, value] of Object.entries(result.values || {})) {
    const widget = getWidget(node, name);
    if (widget) setWidgetValue(node, widget, value, false);
  }
  if (options.resolvedThemeAsExplicit) {
    applyResolvedThemeAsExplicit(node, result, previousThemeValues);
    setWidgetValueByName(node, "CONSISTENCY_MODE", true);
  } else {
    node.promptDeckComposerResolvedTheme = { ...(result.themeStack || result.theme_stack || {}) };
  }
  if (options.disableRandom !== false) {
    disableRandomToggles(node);
  }
  node.promptDeckComposerBasePreview = result.base_prompt || "";
  node.promptDeckComposerExpandedPreview = result.expanded_prompt || "";
  node.promptDeckComposerResultInsight = {
    themeStack: result.themeStack || result.theme_stack || {},
    weights: result.weights || themeStackWeightValues(node),
    tones: result.tones || currentToneState(node),
    influence: resultInsightInfluence(result.weights || themeStackWeightValues(node)),
    ready: true,
    description: result.insight_description || "",
    status: "",
  };
  node.promptDeckComposerResultInsightHeight = resultInsightHeightFor(node, node.size?.[0] || DEFAULT_NODE_WIDTH);
  updatePreview(node, result.base_prompt || "", result.expanded_prompt || "");
}

function newSeed() {
  return Math.floor(Math.random() * 4294967295);
}

function setVariantSeed(node) {
  setWidgetValueByName(node, "seed", newSeed());
}

function clampRange(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}

function restoreVariantBase(node, result) {
  loadRecentResult(node, result, {
    preserveCollapse: true,
    disableRandom: true,
    resolvedThemeAsExplicit: true,
  });
  setVariantSeed(node);
}

function exploreConsistency(node) {
  node.promptDeckComposerRuntimeResolvedTheme = undefined;
  return consistencyContext(node);
}

function explorePick(node, key, consistency = null, allowNone = false) {
  return pickFromWidgetOptions(getWidget(node, key), allowNone, consistency);
}

function exploreChancePick(node, key, chance, consistency = null) {
  return Math.random() < chance ? explorePick(node, key, consistency, false) : NONE_VALUE;
}

function rerollScenePartial(node, keys, consistency = exploreConsistency(node)) {
  for (const key of keys) {
    if (key === "RELATIONSHIP") {
      setWidgetValueByName(node, key, explorePick(node, key, consistency));
      continue;
    }
    const other = ["SECONDARY_SUBJECT_1", "SECONDARY_SUBJECT_2"]
      .filter((name) => name !== key)
      .map((name) => valueText(getWidget(node, name)?.value))
      .filter(Boolean);
    const choice = Math.random() < 0.35 ? NONE_VALUE : explorePick(node, key, consistency);
    setWidgetValueByName(node, key, other.includes(choice) ? NONE_VALUE : choice);
  }
}

function exploreRerollSceneAll(node, consistency = exploreConsistency(node)) {
  const chaos = chaosValue(node);
  setWidgetValueByName(node, "PRIMARY_SUBJECT", explorePick(node, "PRIMARY_SUBJECT", consistency));
  setWidgetValueByName(node, "SUBJECT_MODIFIER", exploreChancePick(node, "SUBJECT_MODIFIER", 0.15 + chaos * 0.75, consistency));
  const secondaryKeys = ["SECONDARY_SUBJECT_1", "SECONDARY_SUBJECT_2"];
  const choices = uniqueChoicesFromWidgetOptions(
    getWidget(node, "SECONDARY_SUBJECT_1"),
    Math.min(secondaryCountForChaos(chaos), secondaryKeys.length),
    [],
    consistency
  );
  secondaryKeys.forEach((key, index) => setWidgetValueByName(node, key, choices[index] || NONE_VALUE));
  setWidgetValueByName(node, "RELATIONSHIP", explorePick(node, "RELATIONSHIP", consistency));
  setWidgetValueByName(node, "ENVIRONMENT", exploreChancePick(node, "ENVIRONMENT", 0.35 + chaos * 0.55, consistency));
}

function exploreRerollStyleLayers(node, consistency = exploreConsistency(node)) {
  for (const key of STYLE_REROLL_KEYS) {
    setWidgetValueByName(node, key, explorePick(node, key, consistency));
  }
}

function exploreRerollArtists(node, consistency = exploreConsistency(node)) {
  const count = artistCountForChaos(chaosValue(node));
  setWidgetValueByName(node, "ARTIST_COUNT", String(count));
  const artists = uniqueChoicesFromWidgetOptions(getWidget(node, "ARTIST_1"), count, [], consistency);
  ARTIST_REROLL_KEYS.forEach((key, index) => setWidgetValueByName(node, key, artists[index] || NONE_VALUE));
}

function exploreRerollBlocks(node, consistency = exploreConsistency(node)) {
  const chaos = chaosValue(node);
  const desired = Math.min(blockCountForChaos(chaos), blockLimitForChaos(chaos), STYLE_BLOCK_REROLL_KEYS.length);
  const activeKeys = new Set(uniqueChoicesFromWidgetOptions({ options: { values: STYLE_BLOCK_REROLL_KEYS } }, desired, []));
  for (const key of STYLE_BLOCK_REROLL_KEYS) {
    setWidgetValueByName(node, key, activeKeys.has(key) ? explorePick(node, key, consistency) : NONE_VALUE);
  }
}

function exploreRerollTone(node) {
  const tones = ["neutral", "concise", "cinematic", "poetic", "technical"];
  const primary = randomFromArray(tones);
  setWidgetValueByName(node, "TONE_PRESET_PRIMARY", primary);
  if (Math.random() < 0.5) {
    setWidgetValueByName(node, "TONE_PRESET_SECONDARY", "none");
    setWidgetValueByName(node, "TONE_MIX", 0);
  } else {
    setWidgetValueByName(node, "TONE_PRESET_SECONDARY", randomFromArray(tones.filter((tone) => tone !== primary)));
    setWidgetValueByName(node, "TONE_MIX", randomFromArray([0.25, 0.35, 0.5, 0.65]));
  }
}

function applyExploreVariant(node, result, mode) {
  guard(() => {
    restoreVariantBase(node, result);
    node.promptDeckComposerRuntimeResolvedTheme = undefined;
    const savedChaos = clampMix(result.chaos ?? result.chaos_level ?? getWidget(node, "CHAOS_LEVEL")?.value ?? 0.5);
    const savedStrength = clampMix(result.consistency_strength ?? getWidget(node, "CONSISTENCY_STRENGTH")?.value ?? 0.65);
    try {
      if (mode === "soft") {
        setWidgetValueByName(node, "CHAOS_LEVEL", Number(Math.min(savedChaos, 0.35).toFixed(2)));
        setWidgetValueByName(node, "CONSISTENCY_STRENGTH", Number(Math.max(savedStrength, 0.75).toFixed(2)));
        const consistency = exploreConsistency(node);
        const candidates = ["SECONDARY_SUBJECT_1", "SECONDARY_SUBJECT_2", "RELATIONSHIP"];
        rerollScenePartial(node, uniqueChoicesFromWidgetOptions({ options: { values: candidates } }, randomFromArray([1, 2]), []), consistency);
      } else if (mode === "style") {
        setWidgetValueByName(node, "CHAOS_LEVEL", Number(clampRange(savedChaos, 0.45, 0.65).toFixed(2)));
        setWidgetValueByName(node, "CONSISTENCY_STRENGTH", Number(Math.max(savedStrength, 0.65).toFixed(2)));
        const consistency = exploreConsistency(node);
        exploreRerollStyleLayers(node, consistency);
        exploreRerollArtists(node, consistency);
        exploreRerollBlocks(node, consistency);
      } else if (mode === "wild") {
        setWidgetValueByName(node, "CHAOS_LEVEL", Number(Math.max(savedChaos, 0.85).toFixed(2)));
        setWidgetValueByName(node, "CONSISTENCY_STRENGTH", Number(Math.max(savedStrength, 0.65).toFixed(2)));
        if (Math.random() < 0.5) {
          exploreRerollTone(node);
        }
        setWidgetValueByName(node, "RANDOM_TONE", false);
        const consistency = exploreConsistency(node);
        exploreRerollSceneAll(node, consistency);
        exploreRerollStyleLayers(node, consistency);
        exploreRerollArtists(node, consistency);
        exploreRerollBlocks(node, consistency);
      }
    } finally {
      node.promptDeckComposerRuntimeResolvedTheme = undefined;
    }
    updatePreview(node);
    node.promptDeckComposerExploreFeedbackLabel =
      mode === "soft" ? "Refine loaded" :
      mode === "style" ? "Restyle loaded" :
      "Reimagine loaded";
    showPreviewCopyFeedback(node, `recent_explore_${result.id}`);
    node.setDirtyCanvas?.(true, true);
  });
}

function hideBackendWidget(widget) {
  if (!widget || widget.promptDeckComposerHidden) {
    return;
  }
  widget.promptDeckComposerHidden = true;
  widget.serialize = true;
  widget.hidden = true;
  widget.computedHeight = 0;
  widget.last_y = -100000;
  widget.computeSize = () => [0, 0];
  widget.draw = () => {};
}

function applyInitialSize(node) {
  if (node.promptDeckComposerInitialSizeApplied) {
    node.setDirtyCanvas?.(true, true);
    return;
  }
  const size = node.computeSize?.();
  const currentWidth = node.size?.[0] || 0;
  const currentHeight = node.size?.[1] || 0;
  const nextWidth = currentWidth < MIN_READABLE_WIDTH ? DEFAULT_NODE_WIDTH : currentWidth;
  const nextHeight = Math.max(currentHeight, size?.[1] || 0);
  node.setSize?.([nextWidth, nextHeight]);
  node.promptDeckComposerInitialSizeApplied = true;
  node.setDirtyCanvas?.(true, true);
}

function rowLayout(width, options = {}) {
  const margin = 12;
  const minInput = options.minInput ?? 92;
  const labelWidth = Math.min(options.maxLabel ?? 150, Math.max(options.minLabel ?? 82, Math.floor(width * 0.34)));
  let inputX = margin + labelWidth + GAP;
  let inputWidth = width - inputX - margin;
  if (inputWidth < minInput) {
    inputWidth = Math.max(48, width - margin * 2);
    inputX = margin;
  }
  return { margin, labelWidth, inputX, inputWidth };
}

function comboRowLayout(width) {
  const layout = rowLayout(width, { minInput: 150, maxLabel: 132 });
  const idealLockWidth = 64;
  const buttonWidth = layout.inputWidth < 122 ? Math.max(36, Math.floor(layout.inputWidth * 0.36)) : idealLockWidth;
  const valueWidth = Math.max(24, layout.inputWidth - buttonWidth - GAP);
  return {
    ...layout,
    valueX: layout.inputX,
    valueWidth,
    lockX: layout.inputX + valueWidth + GAP,
    lockWidth: buttonWidth,
  };
}

function drawRoundRect(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function editTextWidgetWithPrompt(node, widget, title) {
  if (!widget) return false;
  const next = window.prompt(title, String(widget.value || ""));
  if (next !== null) {
    setWidgetValue(node, widget, next);
    updatePreview(node);
  }
  return true;
}

function ollamaUrl(node) {
  return String(getWidget(node, "OLLAMA_URL")?.value || "http://127.0.0.1:11434").trim().replace(/\/+$/, "");
}

function setOllamaStatus(node, status) {
  setWidgetValue(node, getWidget(node, "OLLAMA_STATUS"), status, false);
  node?.setDirtyCanvas?.(true, true);
}

function setOllamaModelOptions(node, models) {
  const widget = getWidget(node, "OLLAMA_MODEL");
  if (!widget) return;
  const clean = [...new Set((models || []).map((name) => String(name || "").trim()).filter(Boolean))];
  node.promptDeckComposerOllamaModels = clean;
  node.promptDeckComposerOllamaModelUrl = ollamaUrl(node);
  widget.options = { ...(widget.options || {}), values: clean };
  if (clean.length) {
    const current = String(widget.value || "").trim();
    if (!clean.includes(current)) {
      setWidgetValue(node, widget, clean[0], false);
    }
  }
}

async function refreshOllamaModels(node) {
  if (!node || node.promptDeckComposerOllamaFetching) return false;
  const modelWidget = getWidget(node, "OLLAMA_MODEL");
  if (!modelWidget) return false;
  const url = ollamaUrl(node);
  if (!url) return false;
  node.promptDeckComposerOllamaFetching = true;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${url}/api/tags`, { method: "GET", signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    const models = Array.isArray(data?.models) ? data.models.map((model) => model?.name) : [];
    setOllamaModelOptions(node, models);
    if (models.length) {
      setOllamaStatus(node, getWidget(node, "OLLAMA_ENABLE")?.value === true ? "Ollama: Connected" : "Ollama: OFF");
    }
    updatePreview(node);
    return models.length > 0;
  } catch (error) {
    node.promptDeckComposerOllamaModels = [];
    modelWidget.options = { ...(modelWidget.options || {}), values: [] };
    if (getWidget(node, "OLLAMA_ENABLE")?.value === true) {
      setOllamaStatus(node, error?.name === "AbortError" ? "Ollama: Timeout -> fallback used" : "Ollama: Not reachable");
    } else {
      setOllamaStatus(node, "Ollama: OFF");
    }
    return false;
  } finally {
    clearTimeout(timeoutId);
    node.promptDeckComposerOllamaFetching = false;
    node.setDirtyCanvas?.(true, true);
  }
}

function rerollScene(node) {
  if (isGroupLocked(node, "scene")) return;
  const chaos = chaosValue(node);
  const consistency = consistencyContext(node);
  const secondaryCount = secondaryCountForChaos(chaos);
  const secondaryKeys = ["SECONDARY_SUBJECT_1", "SECONDARY_SUBJECT_2"];
  const lockedSecondaries = secondaryKeys
    .filter((key) => isFieldLocked(node, key))
    .map((key) => valueText(getWidget(node, key)?.value))
    .filter(Boolean);
  const freeSecondaryKeys = secondaryKeys.filter((key) => !isFieldLocked(node, key));
  const secondaryChoices = uniqueChoicesFromWidgetOptions(
    getWidget(node, "SECONDARY_SUBJECT_1"),
    Math.min(Math.max(0, secondaryCount - lockedSecondaries.length), freeSecondaryKeys.length),
    lockedSecondaries,
    consistency
  );

  if (!isFieldLocked(node, "PRIMARY_SUBJECT")) {
    setWidgetValueByName(node, "PRIMARY_SUBJECT", pickFromWidgetOptions(getWidget(node, "PRIMARY_SUBJECT"), false, consistency));
  }
  if (!isFieldLocked(node, "SUBJECT_MODIFIER")) {
    setWidgetValueByName(node, "SUBJECT_MODIFIER", chancePick(node, "SUBJECT_MODIFIER", 0.15 + chaos * 0.75, consistency));
  }
  freeSecondaryKeys.forEach((key, index) => {
    setWidgetValueByName(node, key, secondaryChoices[index] || NONE_VALUE);
  });
  if (!isFieldLocked(node, "RELATIONSHIP")) {
    setWidgetValueByName(node, "RELATIONSHIP", pickFromWidgetOptions(getWidget(node, "RELATIONSHIP"), false, consistency));
  }
  if (!isFieldLocked(node, "ENVIRONMENT")) {
    setWidgetValueByName(node, "ENVIRONMENT", chancePick(node, "ENVIRONMENT", 0.35 + chaos * 0.55, consistency));
  }
}

function rerollStyle(node) {
  if (isGroupLocked(node, "style")) return;
  const chaos = chaosValue(node);
  const consistency = consistencyContext(node);
  for (const key of STYLE_REROLL_KEYS) {
    if (isFieldLocked(node, key)) continue;
    const chance = key === "STYLE_RENDER" ? 0.65 + chaos * 0.3 : 0.45 + chaos * 0.45;
    setWidgetValueByName(node, key, chancePick(node, key, chance, consistency));
  }
}

function rerollArtists(node) {
  if (isGroupLocked(node, "artists")) return;
  const chaos = chaosValue(node);
  const consistency = consistencyContext(node);
  const artistCount = isFieldLocked(node, "ARTIST_COUNT")
    ? Math.max(0, Math.min(3, Number.parseInt(getWidget(node, "ARTIST_COUNT")?.value || "0", 10) || 0))
    : artistCountForChaos(chaos);
  if (!isFieldLocked(node, "ARTIST_COUNT")) {
    setWidgetValueByName(node, "ARTIST_COUNT", String(artistCount));
  }
  const lockedArtists = ARTIST_REROLL_KEYS
    .filter((key) => isFieldLocked(node, key))
    .map((key) => valueText(getWidget(node, key)?.value))
    .filter(Boolean);
  const freeArtistKeys = ARTIST_REROLL_KEYS.filter((key) => !isFieldLocked(node, key));
  const artists = uniqueChoicesFromWidgetOptions(
    getWidget(node, "ARTIST_1"),
    Math.min(Math.max(0, artistCount - lockedArtists.length), freeArtistKeys.length),
    lockedArtists,
    consistency
  );
  freeArtistKeys.forEach((key, index) => {
    setWidgetValueByName(node, key, artists[index] || NONE_VALUE);
  });
}

function rerollBlocks(node) {
  if (isGroupLocked(node, "blocks")) return;
  const chaos = chaosValue(node);
  const consistency = consistencyContext(node);
  const blockCount = blockCountForChaos(chaos);
  const blockLimit = Math.min(blockLimitForChaos(chaos), STYLE_BLOCK_REROLL_KEYS.length);
  const lockedActive = STYLE_BLOCK_REROLL_KEYS.filter((key) => isFieldLocked(node, key) && valueText(getWidget(node, key)?.value));
  const freeBlockKeys = STYLE_BLOCK_REROLL_KEYS.filter((key) => !isFieldLocked(node, key));
  const desiredTotal = Math.min(blockCount, blockLimit);
  const openSlots = Math.max(0, desiredTotal - lockedActive.length);
  const activeKeys = new Set(uniqueChoicesFromWidgetOptions({ options: { values: freeBlockKeys } }, openSlots, []));
  for (const key of freeBlockKeys) {
    setWidgetValueByName(node, key, activeKeys.has(key) ? pickFromWidgetOptions(getWidget(node, key), false, consistency) : NONE_VALUE);
  }
}

function manualReroll(node, section) {
  guard(() => {
    deactivateAutoCompose(node);
    node.promptDeckComposerRuntimeChaos = getWidget(node, "RANDOM_CHAOS_LEVEL")?.value === true ? Math.random() : undefined;
    node.promptDeckComposerRuntimeConsistencyStrength = getWidget(node, "RANDOM_CONSISTENCY_STRENGTH")?.value === true ? Math.random() : undefined;
    if (node.promptDeckComposerRuntimeChaos !== undefined) {
      setWidgetValueByName(node, "CHAOS_LEVEL", Number(node.promptDeckComposerRuntimeChaos.toFixed(2)));
      node.promptDeckComposerRuntimeChaos = Number(getWidget(node, "CHAOS_LEVEL")?.value ?? node.promptDeckComposerRuntimeChaos);
    }
    if (node.promptDeckComposerRuntimeConsistencyStrength !== undefined) {
      setWidgetValueByName(node, "CONSISTENCY_STRENGTH", Number(node.promptDeckComposerRuntimeConsistencyStrength.toFixed(2)));
      node.promptDeckComposerRuntimeConsistencyStrength = Number(getWidget(node, "CONSISTENCY_STRENGTH")?.value ?? node.promptDeckComposerRuntimeConsistencyStrength);
    }
    try {
      if (section === "scene" || section === "all") rerollScene(node);
      if (section === "style" || section === "all") rerollStyle(node);
      if (section === "artists" || section === "all") rerollArtists(node);
      if (section === "blocks" || section === "all") rerollBlocks(node);
      if (section === "all") randomizeToneWidgets(node);
      updatePreview(node);
      node.setDirtyCanvas?.(true, true);
    } finally {
      node.promptDeckComposerRuntimeChaos = undefined;
      node.promptDeckComposerRuntimeConsistencyStrength = undefined;
      node.promptDeckComposerRuntimeResolvedTheme = undefined;
    }
  });
}

function fitText(ctx, text, maxWidth) {
  const source = String(text ?? "");
  if (ctx.measureText(source).width <= maxWidth) return source;
  let result = source;
  while (result.length > 4 && ctx.measureText(`${result.slice(0, -1)}...`).width > maxWidth) {
    result = result.slice(0, -1);
  }
  return `${result.slice(0, Math.max(1, result.length - 1))}...`;
}

function wrapPrompt(ctx, text, maxWidth) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= maxWidth) {
      line = next;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function labelFor(name) {
  return name.replaceAll("_", " ");
}

function menuItemsFor(widget) {
  const values = widget?.options?.values || [];
  return values.map((value) => ({
    content: value === NONE_VALUE ? "&lt;none&gt;" : String(value),
    value,
  }));
}

function menuValue(item) {
  if (item && typeof item === "object" && "value" in item) {
    return item.value;
  }
  return item?.content === "&lt;none&gt;" ? NONE_VALUE : item?.content ?? item;
}

function openComboMenu(event, node, widget) {
  guard(() => {
    const items = menuItemsFor(widget);
    if (!items.length || !window.LiteGraph?.ContextMenu) {
      return;
    }
    new window.LiteGraph.ContextMenu(items, {
      event,
      callback: (item) => {
        const next = menuValue(item);
        if (typeof next !== "string") return;
        setWidgetValue(node, widget, next);
        syncResolvedThemeAfterSelection(node, widget.name);
        updatePreview(node);
      },
    });
  });
}

function openOllamaModelMenu(event, node, widget) {
  guard(() => {
    const models = Array.isArray(widget?.options?.values) ? widget.options.values : [];
    if (!models.length || !window.LiteGraph?.ContextMenu) {
      editTextWidgetWithPrompt(node, widget, "Edit Ollama MODEL name");
      return;
    }
    const items = [
      ...models.map((value) => ({ content: String(value), value })),
      { content: "Type model manually...", value: "__manual_model__" },
    ];
    new window.LiteGraph.ContextMenu(items, {
      event,
      callback: (item) => {
        const next = menuValue(item);
        if (next === "__manual_model__") {
          editTextWidgetWithPrompt(node, widget, "Edit Ollama MODEL name");
          return;
        }
        if (typeof next !== "string") return;
        setWidgetValue(node, widget, next);
        updatePreview(node);
      },
    });
  });
}

function makeSectionHeader(title) {
  return {
    name: `PromptDeckComposer ${title}`,
    type: "prompt_deck_composer_section",
    serialize: false,
    computeSize: (width) => [width, isSectionCollapsed(title) ? COLLAPSED_SECTION_HEIGHT : EXPANDED_SECTION_HEIGHT],
    draw(ctx, node, width, y, height) {
      guard(() => {
        const collapsed = isSectionCollapsed(title);
        const headerHeight = height || (collapsed ? COLLAPSED_SECTION_HEIGHT : EXPANDED_SECTION_HEIGHT);
        const centerY = y + headerHeight / 2;
        const lineY = y + headerHeight - 2;
        ctx.save();
        ctx.font = "bold 12px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#9fb8d0";
        ctx.fillText(fitText(ctx, `${collapsed ? ">" : "v"} ${title}`, width - 24), 12, centerY);
        ctx.strokeStyle = "rgba(159,184,208,0.28)";
        ctx.beginPath();
        ctx.moveTo(12, lineY);
        ctx.lineTo(width - 12, lineY);
        ctx.stroke();
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        if (event.type !== "pointerdown" && event.type !== "mousedown") return false;
        setSectionCollapsed(title, !isSectionCollapsed(title));
        applyCollapsedState(node);
        return true;
      }, false);
    },
  };
}

function makeModeRow() {
  return {
    name: "PromptDeckComposer Auto Compose",
    type: "prompt_deck_composer_mode",
    serialize: false,
    computeSize: (width) => [width, MODE_ROW_HEIGHT],
    draw(ctx, node, width, y, height) {
      guard(() => {
        const widget = randomizeWidget(node);
        const enabled = widget?.value === true;
        const margin = 12;
        const rowY = y + 4;
        const rowHeight = Math.max(24, height - 8);
        const layout = rowLayout(width, { minInput: 128, maxLabel: 140 });
        ctx.save();
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#b9c0ca";
        ctx.fillText(fitText(ctx, "Compose Mode", layout.labelWidth - 4), margin, rowY + rowHeight / 2);
        const x = layout.inputX;
        const w = layout.inputWidth;
        drawRoundRect(ctx, x, rowY, w, rowHeight, 7);
        ctx.fillStyle = enabled ? "#1f5f43" : "#44272b";
        ctx.fill();
        ctx.strokeStyle = enabled ? "#5ee0a0" : "#b45a64";
        ctx.stroke();
        ctx.fillStyle = enabled ? "#d8ffe9" : "#ffd5d8";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(enabled ? "AUTO COMPOSE ON" : "AUTO COMPOSE OFF", x + w / 2, rowY + rowHeight / 2);
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        if (event.type !== "pointerdown" && event.type !== "mousedown") return false;
        const widget = randomizeWidget(node);
        setWidgetValue(node, widget, widget?.value !== true);
        syncAutoComposeCollapse(node);
        updatePreview(node);
        return true;
      }, false);
    },
  };
}

function makeStructuredModeRow() {
  return {
    name: "PromptDeckComposer Structured Mode",
    type: "prompt_deck_composer_structured_mode",
    serialize: false,
    computeSize: (width) => [width, MODE_ROW_HEIGHT],
    draw(ctx, node, width, y, height) {
      guard(() => {
        const widget = getWidget(node, "STRUCTURED_MODE");
        const enabled = widget?.value !== false;
        const margin = 12;
        const rowY = y + 4;
        const rowHeight = Math.max(24, height - 8);
        const layout = rowLayout(width, { minInput: 128, maxLabel: 140 });
        ctx.save();
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#b9c0ca";
        ctx.fillText(fitText(ctx, "Prompt Format", layout.labelWidth - 4), margin, rowY + rowHeight / 2);
        const x = layout.inputX;
        const w = layout.inputWidth;
        drawRoundRect(ctx, x, rowY, w, rowHeight, 7);
        ctx.fillStyle = enabled ? "#263f34" : "#2d333d";
        ctx.fill();
        ctx.strokeStyle = enabled ? "#5aa37d" : "#555f70";
        ctx.stroke();
        ctx.fillStyle = enabled ? "#d8ffe9" : "#dbe3ee";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(enabled ? "STRUCTURED MODE" : "KEYWORD MODE", x + w / 2, rowY + rowHeight / 2);
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        if (event.type !== "pointerdown" && event.type !== "mousedown") return false;
        const widget = getWidget(node, "STRUCTURED_MODE");
        setWidgetValue(node, widget, widget?.value === false);
        updatePreview(node);
        return true;
      }, false);
    },
  };
}

function makeToneBooleanRow(row) {
  return {
    name: `PromptDeckComposer ${row.name}`,
    type: "prompt_deck_composer_tone_boolean",
    serialize: false,
    computeSize: (width) => [width, ROW_HEIGHT],
    draw(ctx, node, width, y, height) {
      guard(() => {
        const widget = getWidget(node, row.name);
        const enabled = widget?.value === true;
        const layout = rowLayout(width, { minInput: 120, maxLabel: 140 });
        const rowY = y + 3;
        const boxHeight = Math.max(22, height - 6);
        ctx.save();
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = enabled ? "#d8ffe9" : "#b9c0ca";
        ctx.fillText(fitText(ctx, row.label || labelFor(row.name), layout.labelWidth - 4), layout.margin, rowY + boxHeight / 2);
        drawRoundRect(ctx, layout.inputX, rowY, layout.inputWidth, boxHeight, 6);
        ctx.fillStyle = enabled ? "#1f5f43" : "#2d333d";
        ctx.fill();
        ctx.strokeStyle = enabled ? "#5ee0a0" : "#555f70";
        ctx.stroke();
        ctx.fillStyle = enabled ? "#d8ffe9" : "#dbe3ee";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(enabled ? "ON" : "OFF", layout.inputX + layout.inputWidth / 2, rowY + boxHeight / 2);
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        if (event.type !== "pointerdown" && event.type !== "mousedown") return false;
        const widget = getWidget(node, row.name);
        setWidgetValue(node, widget, widget?.value !== true);
        if (row.name === "OLLAMA_ENABLE" && widget?.value !== true) {
          setWidgetValue(node, getWidget(node, "OLLAMA_STATUS"), "Ollama: OFF", false);
        }
        updatePreview(node);
        return true;
      }, false);
    },
  };
}

function makeToneMixRow(row) {
  return {
    name: `PromptDeckComposer ${row.name}`,
    type: "prompt_deck_composer_tone_mix",
    serialize: false,
    computeSize: (width) => [width, ROW_HEIGHT],
    draw(ctx, node, width, y, height) {
      guard(() => {
        const widget = getWidget(node, row.name);
        const value = clampMix(widget?.value);
        const includeRandom = row.name === "CONSISTENCY_STRENGTH" || row.name === "TONE_MIX";
        const layout = chaosLayout(width, includeRandom);
        const rowY = y + 3;
        const boxHeight = Math.max(layout.boxHeight, height - 6);
        const trackY = rowY + Math.floor(boxHeight / 2) - 3;
        const fillWidth = Math.max(0, layout.trackWidth * value);
        const handleX = layout.trackX + fillWidth;
        ctx.save();
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#b9c0ca";
        ctx.fillText(fitText(ctx, row.label || labelFor(row.name), layout.labelWidth - 4), layout.margin, rowY + boxHeight / 2);
        drawRoundRect(ctx, layout.inputX, rowY, layout.sliderWidth, boxHeight, 6);
        ctx.fillStyle = "#252b34";
        ctx.fill();
        ctx.strokeStyle = "#556171";
        ctx.stroke();
        drawRoundRect(ctx, layout.trackX, trackY, layout.trackWidth, 6, 3);
        ctx.fillStyle = "#141922";
        ctx.fill();
        drawRoundRect(ctx, layout.trackX, trackY, fillWidth, 6, 3);
        ctx.fillStyle = "#6a4d7c";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(handleX, rowY + boxHeight / 2, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#edf2f7";
        ctx.fill();
        ctx.strokeStyle = "#b78ce0";
        ctx.stroke();
        ctx.fillStyle = "#edf2f7";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(value.toFixed(2), layout.inputX + layout.sliderWidth / 2, rowY + boxHeight / 2);
        const randomWidgetName = randomToggleForRow(row.name);
        if (randomWidgetName) {
          drawRandomToggle(ctx, node, randomWidgetName, layout.randomButtonX, rowY, layout.randomButtonWidth, boxHeight);
        }
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        const type = event.type;
        const isDown = type === "pointerdown" || type === "mousedown";
        const isMove = type === "pointermove" || type === "mousemove" || type === "drag" || type === "pointerdrag";
        const isUp = type === "pointerup" || type === "mouseup" || type === "pointercancel" || type === "mouseleave";
        const setFromPointer = () => {
          const widget = getWidget(node, row.name);
          const includeRandom = row.name === "CONSISTENCY_STRENGTH" || row.name === "TONE_MIX";
          const layout = chaosLayout(node.size?.[0] || DEFAULT_NODE_WIDTH, includeRandom);
          const raw = (pos[0] - layout.trackX) / layout.trackWidth;
          const next = Math.round(Math.min(1, Math.max(0, raw)) * 100) / 100;
          setWidgetValue(node, widget, Number(next.toFixed(2)));
          updatePreview(node);
          return true;
        };
        if (isDown) {
          const randomWidgetName = randomToggleForRow(row.name);
          const layout = chaosLayout(node.size?.[0] || DEFAULT_NODE_WIDTH, true);
          if (randomWidgetName && pos[0] >= layout.randomButtonX && pos[0] <= layout.randomButtonX + layout.randomButtonWidth) {
            return toggleRandomForRow(node, randomWidgetName);
          }
          node.promptDeckComposerToneMixDragging = true;
          return setFromPointer();
        }
        if (isMove && node.promptDeckComposerToneMixDragging) return setFromPointer();
        if (isUp && node.promptDeckComposerToneMixDragging) {
          node.promptDeckComposerToneMixDragging = false;
          return setFromPointer();
        }
        return false;
      }, false);
    },
  };
}

function makeTextRow(row) {
  const custom = {
    name: `PromptDeckComposer ${row.name}`,
    type: "prompt_deck_composer_text",
    serialize: false,
    computeSize: (width) => [width, TEXT_ROW_HEIGHT],
    draw(ctx, node, width, y, height) {
      guard(() => {
        const widget = getWidget(node, row.name);
        const layout = rowLayout(width, { minInput: 120, maxLabel: 140 });
        const margin = layout.margin;
        const boxX = layout.inputX;
        const rowY = y + 4;
        const boxHeight = Math.max(24, height - 8);
        const boxWidth = layout.inputWidth;
        custom.promptDeckComposerTextRect = { x: boxX, y: rowY, width: boxWidth, height: boxHeight };
        ctx.save();
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#b9c0ca";
        ctx.fillText(fitText(ctx, row.label || labelFor(row.name), layout.labelWidth - 4), margin, rowY + boxHeight / 2);
        drawRoundRect(ctx, boxX, rowY, boxWidth, boxHeight, 6);
        ctx.fillStyle = "#20252d";
        ctx.fill();
        ctx.strokeStyle = "#4d5664";
        ctx.stroke();
        ctx.fillStyle = "#edf2f7";
        ctx.fillText(fitText(ctx, widget?.value || "", boxWidth - 16), boxX + 8, rowY + boxHeight / 2);
        if (row.name === "USER_PROMPT" && !widget?.value) {
          ctx.fillStyle = "#8390a0";
          ctx.fillText(fitText(ctx, "click to edit anchor text", boxWidth - 16), boxX + 8, rowY + boxHeight / 2);
        }
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        if (event.type !== "pointerdown" && event.type !== "mousedown") return false;
        const widget = getWidget(node, row.name);
        if (!widget) return false;
        if (row.name === "USER_PROMPT") {
          return editTextWidgetWithPrompt(node, widget, "Edit USER_PROMPT anchor text");
        }
        return editTextWidgetWithPrompt(node, widget, `Edit ${row.label || labelFor(row.name)}`);
      }, false);
    },
  };
  return custom;
}

function makeOllamaModelRow(row) {
  const custom = {
    name: `PromptDeckComposer ${row.name}`,
    type: "prompt_deck_composer_ollama_model",
    serialize: false,
    computeSize: (width) => [width, TEXT_ROW_HEIGHT],
    draw(ctx, node, width, y, height) {
      guard(() => {
        const widget = getWidget(node, row.name);
        const models = Array.isArray(widget?.options?.values) ? widget.options.values : [];
        const layout = rowLayout(width, { minInput: 120, maxLabel: 140 });
        const rowY = y + 4;
        const boxHeight = Math.max(24, height - 8);
        const isFetching = node.promptDeckComposerOllamaFetching === true;
        ctx.save();
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#b9c0ca";
        ctx.fillText(fitText(ctx, row.label || labelFor(row.name), layout.labelWidth - 4), layout.margin, rowY + boxHeight / 2);
        drawRoundRect(ctx, layout.inputX, rowY, layout.inputWidth, boxHeight, 6);
        ctx.fillStyle = "#20252d";
        ctx.fill();
        ctx.strokeStyle = models.length ? "#668dc4" : "#4d5664";
        ctx.stroke();
        ctx.fillStyle = widget?.value ? "#edf2f7" : "#8390a0";
        const display = widget?.value || (isFetching ? "loading models..." : "click to load or type model");
        ctx.fillText(fitText(ctx, display, layout.inputWidth - 34), layout.inputX + 8, rowY + boxHeight / 2);
        ctx.fillStyle = models.length ? "#9fb8d0" : "#8390a0";
        ctx.textAlign = "center";
        ctx.fillText(models.length ? "v" : "+", layout.inputX + layout.inputWidth - 16, rowY + boxHeight / 2);
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        if (event.type !== "pointerdown" && event.type !== "mousedown") return false;
        const widget = getWidget(node, row.name);
        if (!widget) return false;
        const models = Array.isArray(widget.options?.values) ? widget.options.values : [];
        if (models.length) {
          openOllamaModelMenu(event, node, widget);
          return true;
        }
        refreshOllamaModels(node).then((loaded) => {
          if (loaded && Array.isArray(widget.options?.values) && widget.options.values.length && window.LiteGraph?.ContextMenu) {
            openOllamaModelMenu(event, node, widget);
            return;
          }
          editTextWidgetWithPrompt(node, widget, "Edit Ollama MODEL name");
        });
        return true;
      }, false);
    },
  };
  return custom;
}

function makeStatusRow(row) {
  return {
    name: `PromptDeckComposer ${row.name}`,
    type: "prompt_deck_composer_status",
    serialize: false,
    computeSize: (width) => [width, TEXT_ROW_HEIGHT],
    draw(ctx, node, width, y, height) {
      guard(() => {
        const widget = getWidget(node, row.name);
        const layout = rowLayout(width, { minInput: 120, maxLabel: 140 });
        const rowY = y + 4;
        const boxHeight = Math.max(24, height - 8);
        ctx.save();
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#b9c0ca";
        ctx.fillText(fitText(ctx, row.label || labelFor(row.name), layout.labelWidth - 4), layout.margin, rowY + boxHeight / 2);
        drawRoundRect(ctx, layout.inputX, rowY, layout.inputWidth, boxHeight, 6);
        ctx.fillStyle = "#20252d";
        ctx.fill();
        ctx.strokeStyle = "#4d5664";
        ctx.stroke();
        const text = String(widget?.value || "Ollama: OFF");
        ctx.fillStyle = text.includes("Connected") ? "#a7f3c5" : text.includes("OFF") ? "#dbe3ee" : "#ffd0d0";
        ctx.fillText(fitText(ctx, text, layout.inputWidth - 16), layout.inputX + 8, rowY + boxHeight / 2);
        ctx.restore();
      });
    },
    mouse() {
      return false;
    },
  };
}

function makeFloatRow(row) {
  return {
    name: `PromptDeckComposer ${row.name}`,
    type: "prompt_deck_composer_float",
    serialize: false,
    computeSize: (width) => [width, ROW_HEIGHT],
    draw(ctx, node, width, y, height) {
      guard(() => {
        const widget = getWidget(node, row.name);
        const min = row.min ?? 0;
        const max = row.max ?? 1;
        const raw = Number(widget?.value);
        const value = Number.isFinite(raw) ? Math.min(max, Math.max(min, raw)) : min;
        const ratio = max > min ? (value - min) / (max - min) : 0;
        const layout = chaosLayout(width);
        const rowY = y + 3;
        const boxHeight = Math.max(layout.boxHeight, height - 6);
        const trackY = rowY + Math.floor(boxHeight / 2) - 3;
        const fillWidth = Math.max(0, layout.trackWidth * ratio);
        const handleX = layout.trackX + fillWidth;
        ctx.save();
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#b9c0ca";
        ctx.fillText(fitText(ctx, row.label || labelFor(row.name), layout.labelWidth - 4), layout.margin, rowY + boxHeight / 2);
        drawRoundRect(ctx, layout.inputX, rowY, layout.inputWidth, boxHeight, 6);
        ctx.fillStyle = "#252b34";
        ctx.fill();
        ctx.strokeStyle = "#556171";
        ctx.stroke();
        drawRoundRect(ctx, layout.trackX, trackY, layout.trackWidth, 6, 3);
        ctx.fillStyle = "#141922";
        ctx.fill();
        drawRoundRect(ctx, layout.trackX, trackY, fillWidth, 6, 3);
        ctx.fillStyle = "#6d5a39";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(handleX, rowY + boxHeight / 2, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#edf2f7";
        ctx.fill();
        ctx.strokeStyle = "#d2ac52";
        ctx.stroke();
        ctx.fillStyle = "#edf2f7";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(value.toFixed(2), layout.inputX + layout.inputWidth / 2, rowY + boxHeight / 2);
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        const type = event.type;
        const isDown = type === "pointerdown" || type === "mousedown";
        const isMove = type === "pointermove" || type === "mousemove" || type === "drag" || type === "pointerdrag";
        const isUp = type === "pointerup" || type === "mouseup" || type === "pointercancel" || type === "mouseleave";
        const dragKey = `promptDeckComposerDragging_${row.name}`;
        const setFromPointer = () => {
          const widget = getWidget(node, row.name);
          const min = row.min ?? 0;
          const max = row.max ?? 1;
          const layout = chaosLayout(node.size?.[0] || DEFAULT_NODE_WIDTH);
          const raw = (pos[0] - layout.trackX) / layout.trackWidth;
          const ratio = Math.min(1, Math.max(0, raw));
          const next = Math.round((min + ratio * (max - min)) * 100) / 100;
          setWidgetValue(node, widget, Number(next.toFixed(2)));
          updatePreview(node);
          return true;
        };
        if (isDown) {
          node[dragKey] = true;
          return setFromPointer();
        }
        if (isMove && node[dragKey]) return setFromPointer();
        if (isUp && node[dragKey]) {
          node[dragKey] = false;
          return setFromPointer();
        }
        return false;
      }, false);
    },
  };
}

function makeRerollButtonsRow() {
  const buttons = [
    { key: "scene", label: "REROLL SCENE" },
    { key: "style", label: "REROLL STYLE" },
    { key: "artists", label: "REROLL ARTISTS" },
    { key: "blocks", label: "REROLL BLOCKS" },
    { key: "all", label: "REROLL ALL" },
  ];
  const custom = {
    name: "PromptDeckComposer Manual Reroll",
    type: "prompt_deck_composer_reroll_buttons",
    serialize: false,
    computeSize: (width) => [width, REROLL_ROW_HEIGHT],
    draw(ctx, node, width, y, height) {
      guard(() => {
        const margin = 12;
        const rowHeight = 24;
        const rowGap = REROLL_BUTTON_GAP;
        const halfWidth = Math.floor((width - margin * 2 - GAP) / 2);
        const allWidth = width - margin * 2;
        const rows = [
          [buttons[0], buttons[1]],
          [buttons[2], buttons[3]],
          [buttons[4]],
        ];
        custom.promptDeckComposerRerollButtonRects = [];
        ctx.save();
        ctx.font = "10px sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        rows.forEach((rowButtons, rowIndex) => {
          const rowY = y + REROLL_BUTTON_TOP + rowIndex * (rowHeight + rowGap);
          rowButtons.forEach((button, index) => {
            const isSingle = rowButtons.length === 1;
            const buttonWidth = isSingle ? allWidth : halfWidth;
            const x = margin + index * (halfWidth + GAP);
            const rect = { key: button.key, x, y: rowY, width: buttonWidth, height: rowHeight };
            custom.promptDeckComposerRerollButtonRects.push(rect);
            drawRoundRect(ctx, x, rowY, buttonWidth, rowHeight, 6);
            ctx.fillStyle = button.key === "all" ? "#473442" : "#26323f";
            ctx.fill();
            ctx.strokeStyle = button.key === "all" ? "#a57198" : "#5f7fa4";
            ctx.stroke();
            ctx.fillStyle = "#edf2f7";
            ctx.fillText(fitText(ctx, button.label, buttonWidth - 10), x + buttonWidth / 2, rowY + rowHeight / 2);
          });
        });
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        if (event.type !== "pointerdown" && event.type !== "mousedown") return false;
        const rect = custom.promptDeckComposerRerollButtonRects?.find((item) =>
          pos[0] >= item.x &&
          pos[0] <= item.x + item.width &&
          pos[1] >= item.y &&
          pos[1] <= item.y + item.height
        );
        if (!rect) return false;
        manualReroll(node, rect.key);
        return true;
      }, false);
    },
  };
  return custom;
}

function makeThemeStackGridRow() {
  const fields = [
    { name: "CONSISTENCY_WORLD_THEME", label: "WORLD" },
    { name: "CONSISTENCY_CULTURE_THEME", label: "CULTURE" },
    { name: "CONSISTENCY_MATERIAL_THEME", label: "MATERIAL" },
    { name: "CONSISTENCY_CONCEPT_THEME", label: "CONCEPT" },
  ];
  const custom = {
    name: "PromptDeckComposer Theme Stack",
    type: "prompt_deck_composer_theme_grid",
    serialize: false,
    computeSize: (width) => [width, 124],
    draw(ctx, node, width, y) {
      guard(() => {
        const margin = 12;
        const top = y + 5;
        const rowHeight = 24;
        const rowGap = 6;
        const labelWidth = 58;
        const controlGap = 6;
        const available = Math.max(96, width - margin * 2 - labelWidth);
        const randomWidth = available < 210 ? 20 : 24;
        let sliderWidth = Math.min(96, Math.max(46, Math.floor(available * 0.25)));
        let resolvedWidth = Math.min(92, Math.max(58, Math.floor(available * 0.24)));
        let dropdownWidth = available - resolvedWidth - sliderWidth - randomWidth - controlGap * 3;
        if (dropdownWidth < 52) {
          const remaining = Math.max(0, available - randomWidth - controlGap * 3 - 52);
          sliderWidth = Math.max(32, Math.floor(remaining * 0.58));
          resolvedWidth = Math.max(0, remaining - sliderWidth);
          dropdownWidth = available - resolvedWidth - sliderWidth - randomWidth - controlGap * 3;
        }
        custom.promptDeckComposerThemeRects = [];
        custom.promptDeckComposerThemeWeightRects = [];
        custom.promptDeckComposerThemeRandomRects = [];
        ctx.save();
        ctx.font = "10px sans-serif";
        ctx.textBaseline = "middle";
        fields.forEach((field, index) => {
          const x = margin;
          const rowY = top + index * (rowHeight + rowGap);
          const valueX = x + labelWidth;
          const resolvedX = valueX + dropdownWidth + controlGap;
          const sliderX = resolvedX + resolvedWidth + controlGap;
          const randomX = sliderX + sliderWidth + controlGap;
          const widget = getWidget(node, field.name);
          const weightWidgetName = THEME_STACK_WEIGHT_WIDGETS[field.name];
          const weightWidget = getWidget(node, weightWidgetName);
          const randomWidgetName = THEME_STACK_WEIGHT_RANDOM_WIDGETS[weightWidgetName];
          const randomEnabled = getWidget(node, randomWidgetName)?.value === true;
          const weightValue = clampMix(weightWidget?.value ?? 0.5);
          const selected = String(widget?.value || "any");
          const resolved = resolvedThemeForWidget(node, field.name);
          const trackInset = 8;
          const trackX = sliderX + trackInset;
          const trackWidth = Math.max(1, sliderWidth - trackInset * 2);
          const fillWidth = trackWidth * weightValue;
          custom.promptDeckComposerThemeRects.push({ name: field.name, x: valueX, y: rowY, width: dropdownWidth, height: rowHeight });
          custom.promptDeckComposerThemeWeightRects.push({
            name: weightWidgetName,
            x: sliderX,
            y: rowY,
            width: sliderWidth,
            height: rowHeight,
            trackX,
            trackWidth,
          });
          custom.promptDeckComposerThemeRandomRects.push({ name: randomWidgetName, x: randomX, y: rowY, width: randomWidth, height: rowHeight });
          ctx.fillStyle = "#b9c0ca";
          ctx.textAlign = "left";
          ctx.fillText(field.label, x, rowY + rowHeight / 2);

          drawRoundRect(ctx, valueX, rowY, dropdownWidth, rowHeight, 6);
          ctx.fillStyle = "#2d333d";
          ctx.fill();
          ctx.strokeStyle = "#555f70";
          ctx.stroke();
          ctx.fillStyle = "#eef2f7";
          ctx.font = "10px sans-serif";
          ctx.fillText(fitText(ctx, selected, dropdownWidth - 24), valueX + 8, rowY + rowHeight / 2);
          ctx.fillStyle = "#9aa5b4";
          ctx.textAlign = "center";
          ctx.fillText("v", valueX + dropdownWidth - 14, rowY + rowHeight / 2);

          if (resolvedWidth >= 24) {
            ctx.textAlign = "left";
            ctx.font = "8.5px sans-serif";
            drawRoundRect(ctx, resolvedX, rowY + 3, resolvedWidth, rowHeight - 6, 5);
            ctx.fillStyle = "rgba(159,184,208,0.10)";
            ctx.fill();
            ctx.fillStyle = "rgba(205,215,228,0.66)";
            ctx.fillText(fitText(ctx, resolved, resolvedWidth - 10), resolvedX + 5, rowY + rowHeight / 2);
          }

          drawRoundRect(ctx, sliderX, rowY, sliderWidth, rowHeight, 6);
          ctx.fillStyle = "#252b34";
          ctx.fill();
          ctx.strokeStyle = "#556171";
          ctx.stroke();
          drawRoundRect(ctx, trackX, rowY + rowHeight / 2 - 3, trackWidth, 6, 3);
          ctx.fillStyle = "#141922";
          ctx.fill();
          drawRoundRect(ctx, trackX, rowY + rowHeight / 2 - 3, fillWidth, 6, 3);
          ctx.fillStyle = "#557a60";
          ctx.fill();
          ctx.beginPath();
          ctx.arc(trackX + fillWidth, rowY + rowHeight / 2, 5, 0, Math.PI * 2);
          ctx.fillStyle = "#edf2f7";
          ctx.fill();
          ctx.strokeStyle = "#8ed7a0";
          ctx.stroke();
          ctx.fillStyle = "rgba(237,242,247,0.74)";
          ctx.font = "8.5px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(weightValue.toFixed(2), sliderX + sliderWidth / 2, rowY + rowHeight / 2);

          drawRoundRect(ctx, randomX, rowY, randomWidth, rowHeight, 6);
          ctx.fillStyle = randomEnabled ? "#1f5f43" : "#2d333d";
          ctx.fill();
          ctx.strokeStyle = randomEnabled ? "#5ee0a0" : "#5f7fa4";
          ctx.stroke();
          ctx.fillStyle = randomEnabled ? "#d8ffe9" : "#dbe3ee";
          ctx.font = "10px sans-serif";
          ctx.fillText("R", randomX + randomWidth / 2, rowY + rowHeight / 2);
        });
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        const setWeightFromRect = (rect) => {
          if (!rect) return false;
          const raw = (pos[0] - rect.trackX) / rect.trackWidth;
          const next = Math.round(Math.min(1, Math.max(0, raw)) * 100) / 100;
          setWidgetValueByName(node, rect.name, Number(next.toFixed(2)));
          const randomName = THEME_STACK_WEIGHT_RANDOM_WIDGETS[rect.name];
          if (randomName) setWidgetValueByName(node, randomName, false);
          updatePreview(node);
          return true;
        };
        const type = event.type;
        const isDown = type === "pointerdown" || type === "mousedown";
        const isMove = type === "pointermove" || type === "mousemove" || type === "drag" || type === "pointerdrag";
        const isUp = type === "pointerup" || type === "mouseup" || type === "pointercancel" || type === "mouseleave";
        if (isMove && custom.promptDeckComposerThemeDraggingWeight) {
          const rect = custom.promptDeckComposerThemeWeightRects?.find((item) => item.name === custom.promptDeckComposerThemeDraggingWeight);
          return setWeightFromRect(rect);
        }
        if (isUp && custom.promptDeckComposerThemeDraggingWeight) {
          const rect = custom.promptDeckComposerThemeWeightRects?.find((item) => item.name === custom.promptDeckComposerThemeDraggingWeight);
          custom.promptDeckComposerThemeDraggingWeight = null;
          return setWeightFromRect(rect);
        }
        if (!isDown) return false;
        const randomRect = custom.promptDeckComposerThemeRandomRects?.find((item) =>
          pos[0] >= item.x &&
          pos[0] <= item.x + item.width &&
          pos[1] >= item.y &&
          pos[1] <= item.y + item.height
        );
        if (randomRect) {
          const widget = getWidget(node, randomRect.name);
          setWidgetValueByName(node, randomRect.name, widget?.value !== true);
          node.setDirtyCanvas?.(true, true);
          return true;
        }
        const weightRect = custom.promptDeckComposerThemeWeightRects?.find((item) =>
          pos[0] >= item.x &&
          pos[0] <= item.x + item.width &&
          pos[1] >= item.y &&
          pos[1] <= item.y + item.height
        );
        if (weightRect) {
          custom.promptDeckComposerThemeDraggingWeight = weightRect.name;
          return setWeightFromRect(weightRect);
        }
        const dropdownRect = custom.promptDeckComposerThemeRects?.find((item) =>
          pos[0] >= item.x &&
          pos[0] <= item.x + item.width &&
          pos[1] >= item.y &&
          pos[1] <= item.y + item.height
        );
        if (!dropdownRect) return false;
        openComboMenu(event, node, getWidget(node, dropdownRect.name));
        return true;
      }, false);
    },
  };
  return custom;
}

function makeChaosRow(row) {
  return {
    name: `PromptDeckComposer ${row.name}`,
    type: "prompt_deck_composer_chaos",
    serialize: false,
    computeSize: (width) => [width, ROW_HEIGHT],
    draw(ctx, node, width, y, height) {
      guard(() => {
        const value = chaosValue(node);
        const layout = chaosLayout(width, true);
        const margin = layout.margin;
        const boxX = layout.inputX;
        const rowY = y + 3;
        const boxHeight = Math.max(layout.boxHeight, height - 6);
        const boxWidth = layout.sliderWidth;
        const trackY = rowY + Math.floor(boxHeight / 2) - 3;
        const fillWidth = Math.max(0, layout.trackWidth * value);
        const handleX = layout.trackX + fillWidth;
        ctx.save();
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = "#b9c0ca";
        ctx.fillText(fitText(ctx, row.label || labelFor(row.name), layout.labelWidth - 4), margin, rowY + boxHeight / 2);

        drawRoundRect(ctx, boxX, rowY, boxWidth, boxHeight, 6);
        ctx.fillStyle = "#252b34";
        ctx.fill();
        ctx.strokeStyle = "#556171";
        ctx.stroke();

        drawRoundRect(ctx, layout.trackX, trackY, layout.trackWidth, 6, 3);
        ctx.fillStyle = "#141922";
        ctx.fill();

        drawRoundRect(ctx, layout.trackX, trackY, fillWidth, 6, 3);
        ctx.fillStyle = value < 0.25 ? "#3b5264" : value < 0.65 ? "#5a5132" : "#6a3343";
        ctx.fill();

        ctx.beginPath();
        ctx.arc(handleX, rowY + boxHeight / 2, 7, 0, Math.PI * 2);
        ctx.fillStyle = "#edf2f7";
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = value < 0.25 ? "#6fa3bd" : value < 0.65 ? "#d2ac52" : "#e06a86";
        ctx.stroke();

        ctx.fillStyle = "#edf2f7";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(`${chaosLabel(value)} ${value.toFixed(2)}`, boxX + boxWidth / 2, rowY + boxHeight / 2);
        drawRandomToggle(ctx, node, "RANDOM_CHAOS_LEVEL", layout.randomButtonX, rowY, layout.randomButtonWidth, boxHeight);
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        const type = event.type;
        const isDown = type === "pointerdown" || type === "mousedown";
        const isMove = type === "pointermove" || type === "mousemove" || type === "drag" || type === "pointerdrag";
        const isUp = type === "pointerup" || type === "mouseup" || type === "pointercancel" || type === "mouseleave";

        if (isDown) {
          const layout = chaosLayout(node.size?.[0] || DEFAULT_NODE_WIDTH, true);
          if (pos[0] >= layout.randomButtonX && pos[0] <= layout.randomButtonX + layout.randomButtonWidth) {
            return toggleRandomForRow(node, "RANDOM_CHAOS_LEVEL");
          }
          node.promptDeckComposerChaosDragging = true;
          return setChaosFromPointer(node, row, pos);
        }
        if (isMove && node.promptDeckComposerChaosDragging) {
          return setChaosFromPointer(node, row, pos);
        }
        if (isUp && node.promptDeckComposerChaosDragging) {
          node.promptDeckComposerChaosDragging = false;
          setChaosFromPointer(node, row, pos);
          return true;
        }
        return false;
      }, false);
    },
  };
}

function makeComboRow(row) {
  return {
    name: `PromptDeckComposer ${row.name}`,
    type: "prompt_deck_composer_combo",
    serialize: false,
    computeSize: (width) => [width, ROW_HEIGHT],
    draw(ctx, node, width, y, height) {
      guard(() => {
        const widget = getWidget(node, row.name);
        const lockWidget = getWidget(node, FIELD_LOCK_BY_WIDGET[row.name]);
        const locked = lockWidget?.value === true;
        const layout = lockWidget ? comboRowLayout(width) : rowLayout(width);
        const margin = layout.margin;
        const boxX = layout.valueX ?? layout.inputX;
        const rowY = y + 3;
        const boxHeight = Math.max(22, height - 6);
        const boxWidth = layout.valueWidth ?? layout.inputWidth;
        ctx.save();
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = locked ? "#ffd5a6" : "#b9c0ca";
        ctx.fillText(fitText(ctx, labelFor(row.name), layout.labelWidth - 4), margin, rowY + boxHeight / 2);
        drawRoundRect(ctx, boxX, rowY, boxWidth, boxHeight, 6);
        ctx.fillStyle = "#2d333d";
        ctx.fill();
        ctx.strokeStyle = "#555f70";
        ctx.stroke();
        ctx.fillStyle = "#eef2f7";
        ctx.fillText(fitText(ctx, widget?.value || "", boxWidth - 30), boxX + 8, rowY + boxHeight / 2);
        ctx.fillStyle = "#9aa5b4";
        ctx.fillText("v", boxX + boxWidth - 18, rowY + boxHeight / 2);
        if (lockWidget) {
          drawRoundRect(ctx, layout.lockX, rowY, layout.lockWidth, boxHeight, 6);
          ctx.fillStyle = locked ? "#68422a" : "#202a31";
          ctx.fill();
          ctx.strokeStyle = locked ? "#d59254" : "#536170";
          ctx.stroke();
          ctx.fillStyle = locked ? "#ffd5a6" : "#b8c4d0";
          ctx.font = "10px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(locked ? "LOCK" : "FREE", layout.lockX + layout.lockWidth / 2, rowY + boxHeight / 2);
        }
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        if (event.type !== "pointerdown" && event.type !== "mousedown") return false;
        const lockWidget = getWidget(node, FIELD_LOCK_BY_WIDGET[row.name]);
        const layout = lockWidget ? comboRowLayout(node.size?.[0] || DEFAULT_NODE_WIDTH) : rowLayout(node.size?.[0] || DEFAULT_NODE_WIDTH);
        if (lockWidget && pos[0] >= layout.lockX && pos[0] <= layout.lockX + layout.lockWidth) {
          setWidgetValue(node, lockWidget, lockWidget.value !== true);
          updatePreview(node);
          return true;
        }
        openComboMenu(event, node, getWidget(node, row.name));
        return true;
      }, false);
    },
  };
}

function makeLockRow(row) {
  return {
    name: `PromptDeckComposer ${row.name}`,
    type: "prompt_deck_composer_lock",
    serialize: false,
    computeSize: (width) => [width, ROW_HEIGHT],
    draw(ctx, node, width, y, height) {
      guard(() => {
        const widget = getWidget(node, row.name);
        const locked = widget?.value === true;
        const layout = rowLayout(width, { minInput: 118, maxLabel: 160 });
        const margin = layout.margin;
        const boxX = layout.inputX;
        const rowY = y + 3;
        const boxHeight = Math.max(22, height - 6);
        const boxWidth = layout.inputWidth;
        ctx.save();
        ctx.font = "12px sans-serif";
        ctx.textBaseline = "middle";
        ctx.fillStyle = locked ? "#d9b98f" : "#8f9aa8";
        ctx.fillText(fitText(ctx, row.label || labelFor(row.name), layout.labelWidth - 4), margin, rowY + boxHeight / 2);
        drawRoundRect(ctx, boxX, rowY, boxWidth, boxHeight, 6);
        ctx.fillStyle = locked ? "#4d3526" : "#1b2229";
        ctx.fill();
        ctx.strokeStyle = locked ? "#9f7147" : "#3e4a57";
        ctx.stroke();
        ctx.fillStyle = locked ? "#e6caa6" : "#9ca8b5";
        ctx.font = "11px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(locked ? "GROUP LOCKED" : "GROUP FREE", boxX + boxWidth / 2, rowY + boxHeight / 2);
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        if (event.type !== "pointerdown" && event.type !== "mousedown") return false;
        const widget = getWidget(node, row.name);
        setWidgetValue(node, widget, widget?.value !== true);
        updatePreview(node);
        return true;
      }, false);
    },
  };
}

function makePreviewWidget() {
  const custom = {
    name: "Final Prompt Preview",
    type: "prompt_deck_composer_preview",
    serialize: false,
    computeSize: (width) => [width, PREVIEW_HEIGHT],
    draw(ctx, node, width, y, height) {
      guard(() => {
        const margin = 12;
        const boxY = y + 4;
        const textBoxHeight = PREVIEW_TEXT_HEIGHT;
        const buttonY = boxY + textBoxHeight + PREVIEW_BUTTON_GAP;
        const baseText = node.promptDeckComposerBasePreview ?? finalPrompt(node);
        const expandedText = node.promptDeckComposerExpandedPreview || "";
        const hasExpanded = Boolean(expandedText);
        const label = hasExpanded ? "BASE + EXPANDED READY" : "BASE PROMPT";
        const baseLength = String(baseText || "").length;
        const expandedLength = String(expandedText || "").length;
        const summary = hasExpanded
          ? `Base: ${baseLength} chars / Expanded: ${expandedLength} chars`
          : `Base: ${baseLength} chars`;
        const rowY = boxY + 8;
        const groupGap = 10;
        const smallGap = 5;
        const totalButtonWidth = width - margin * 2;
        const buttonWidth = Math.max(52, Math.floor((totalButtonWidth - groupGap - smallGap * 2) / 4));
        const buttonXs = [
          margin,
          margin + buttonWidth + smallGap,
          margin + buttonWidth * 2 + smallGap + groupGap,
          margin + buttonWidth * 3 + smallGap * 2 + groupGap,
        ];
        const buttons = [
          { key: "copy_base", label: "Copy BASE", enabled: Boolean(baseText) },
          { key: "view_base", label: "View BASE", enabled: Boolean(baseText) },
          { key: "copy_expanded", label: "Copy EXP", enabled: hasExpanded },
          { key: "view_expanded", label: "View EXP", enabled: hasExpanded },
        ];
        const feedback = node.promptDeckComposerCopyFeedback;
        const feedbackActive = feedback && performance.now() < feedback.until;
        custom.promptDeckComposerPreviewButtonRects = [];
        ctx.save();
        drawRoundRect(ctx, margin, boxY, width - margin * 2, textBoxHeight, 6);
        ctx.fillStyle = "#1b2027";
        ctx.fill();
        ctx.strokeStyle = "#4d5664";
        ctx.stroke();

        ctx.font = "bold 11px sans-serif";
        ctx.textBaseline = "top";
        ctx.fillStyle = hasExpanded ? "#a7f3c5" : "#9fb8d0";
        ctx.fillText(label, margin + 10, rowY);

        ctx.font = "12px sans-serif";
        ctx.fillStyle = "#edf2f7";
        ctx.fillText(fitText(ctx, summary, width - margin * 2 - 22), margin + 10, rowY + 24);

        ctx.font = "10px sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "center";
        buttons.forEach((button, index) => {
          const x = buttonXs[index];
          const rect = { ...button, x, y: buttonY, width: buttonWidth, height: PREVIEW_BUTTON_HEIGHT };
          custom.promptDeckComposerPreviewButtonRects.push(rect);
          const copied = feedbackActive && feedback.key === button.key;
          const hovered = node.promptDeckComposerHoveredPreviewButton === button.key;
          const pressed = node.promptDeckComposerPressedPreviewButton === button.key;
          const labelText = copied ? "Copied!" : button.label;
          drawRoundRect(ctx, x, buttonY, buttonWidth, PREVIEW_BUTTON_HEIGHT, 5);
          ctx.fillStyle =
            copied ? "#214432" :
            !button.enabled ? "#22272f" :
            pressed ? "#1f2a36" :
            hovered ? "#2f4052" :
            "#26323f";
          ctx.fill();
          ctx.strokeStyle =
            copied ? "#70d89b" :
            !button.enabled ? "#3e4652" :
            pressed ? "#a9cffc" :
            hovered ? "#8fb6e8" :
            "#5f7fa4";
          ctx.stroke();
          ctx.fillStyle = copied ? "#d9ffe8" : button.enabled ? "#edf2f7" : "#697482";
          ctx.fillText(fitText(ctx, labelText, buttonWidth - 8), x + buttonWidth / 2, buttonY + PREVIEW_BUTTON_HEIGHT / 2);
        });
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        const type = event.type;
        const isMove = type === "pointermove" || type === "mousemove" || type === "drag" || type === "pointerdrag";
        const isDown = type === "pointerdown" || type === "mousedown";
        const isUp = type === "pointerup" || type === "mouseup" || type === "pointercancel" || type === "mouseleave";
        const hoverRect = findPreviewButton(custom, pos, false);
        if (isMove) {
          const nextHover = hoverRect?.enabled ? hoverRect.key : null;
          if (node.promptDeckComposerHoveredPreviewButton !== nextHover) {
            node.promptDeckComposerHoveredPreviewButton = nextHover;
            node.setDirtyCanvas?.(true, true);
          }
          return Boolean(hoverRect);
        }
        if (isDown) {
          const rect = findPreviewButton(custom, pos, true);
          if (!rect) return false;
          node.promptDeckComposerPressedPreviewButton = rect.key;
          node.setDirtyCanvas?.(true, true);
          setTimeout(() => {
            if (node.promptDeckComposerPressedPreviewButton === rect.key) {
              node.promptDeckComposerPressedPreviewButton = null;
              node.setDirtyCanvas?.(true, true);
            }
          }, 140);
          const baseText = node.promptDeckComposerBasePreview ?? finalPrompt(node);
          const expandedText = node.promptDeckComposerExpandedPreview || "";
          if (rect.key === "copy_base") {
            copyTextToClipboard(baseText).then((copied) => {
              if (copied) showPreviewCopyFeedback(node, rect.key);
            });
          }
          if (rect.key === "view_base") openPromptDialog("BASE PROMPT", baseText);
          if (rect.key === "copy_expanded") {
            copyTextToClipboard(expandedText).then((copied) => {
              if (copied) showPreviewCopyFeedback(node, rect.key);
            });
          }
          if (rect.key === "view_expanded") openPromptDialog("EXPANDED PROMPT", expandedText);
          return true;
        }
        if (isUp) {
          if (node.promptDeckComposerPressedPreviewButton || node.promptDeckComposerHoveredPreviewButton) {
            node.promptDeckComposerPressedPreviewButton = null;
            if (type === "mouseleave") node.promptDeckComposerHoveredPreviewButton = null;
            node.setDirtyCanvas?.(true, true);
            return true;
          }
          return false;
        }
        return false;
      }, false);
    },
  };
  return custom;
}

function makeResultInsightWidget() {
  const custom = {
    name: "Result Insight",
    type: "prompt_deck_composer_result_insight",
    serialize: false,
    computeSize: (width) => [width, custom.promptDeckComposerNode?.promptDeckComposerResultInsightHeight || RESULT_INSIGHT_HEIGHT],
    draw(ctx, node, width, y) {
      guard(() => {
        const insight = node.promptDeckComposerResultInsight || {
          themeStack: {},
          weights: themeStackWeightValues(node),
          tones: currentToneState(node),
          influence: resultInsightInfluence(themeStackWeightValues(node)),
          ready: false,
          description: "",
          status: "Generating insight...",
        };
        custom.promptDeckComposerNode = node;
        const margin = 12;
        const boxY = y + 4;
        const totalHeight = node.promptDeckComposerResultInsightHeight || RESULT_INSIGHT_HEIGHT;
        const boxHeight = totalHeight - 34;
        const buttonY = boxY + boxHeight + 6;
        const buttonGap = 6;
        const buttonWidth = Math.min(116, Math.max(82, Math.floor((width - margin * 2 - buttonGap) / 2)));
        const buttonHeight = 22;
        custom.promptDeckComposerInsightButtonRects = [
          { key: "copy_insight", x: margin, y: buttonY, width: buttonWidth, height: buttonHeight, enabled: Boolean(insight.description) },
          { key: "save_result", x: margin + buttonWidth + buttonGap, y: buttonY, width: buttonWidth, height: buttonHeight, enabled: Boolean(node.promptDeckComposerBasePreview || finalPrompt(node)) },
        ];
        const themeValues = ["world", "culture", "material", "concept"].map((key) => insight.themeStack[key]).filter(Boolean);
        const themeLine = insight.ready ? `Theme: ${themeValues.join(" / ")}` : "Theme: resolving...";
        const dominantLine = `Dominant: ${insight.influence.dominant.map(prettyCategory).join(" / ") || "NONE"}`;
        const supportingLine = `Supporting: ${insight.influence.supporting.map(prettyCategory).join(" / ") || "NONE"}`;
        const minorLine = `Minor: ${insight.influence.minor.map(prettyCategory).join(" / ") || "NONE"}`;
        const descriptionText = insight.ready ? `"${insight.description}"` : (insight.status || "Generating insight...");
        const feedback = node.promptDeckComposerCopyFeedback;
        const copied = feedback?.key === "copy_insight" && performance.now() < feedback.until;

        ctx.save();
        drawRoundRect(ctx, margin, boxY, width - margin * 2, boxHeight, 6);
        ctx.fillStyle = "#171d24";
        ctx.fill();
        ctx.strokeStyle = "#465160";
        ctx.stroke();

        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.font = "bold 10.5px sans-serif";
        ctx.fillStyle = "#a7f3c5";
        ctx.fillText(fitText(ctx, themeLine, width - margin * 2 - 18), margin + 10, boxY + 8);
        ctx.font = "10px sans-serif";
        ctx.fillStyle = "rgba(220,229,240,0.82)";
        ctx.fillText(fitText(ctx, dominantLine, width - margin * 2 - 18), margin + 10, boxY + 27);
        ctx.fillStyle = "rgba(190,203,218,0.72)";
        ctx.fillText(fitText(ctx, supportingLine, width - margin * 2 - 18), margin + 10, boxY + 44);
        ctx.fillStyle = "rgba(170,184,202,0.66)";
        ctx.fillText(fitText(ctx, minorLine, width - margin * 2 - 18), margin + 10, boxY + 61);
        ctx.font = "11px sans-serif";
        ctx.fillStyle = insight.ready ? "#edf2f7" : "rgba(190,203,218,0.72)";
        const descLines = wrapPrompt(ctx, descriptionText, width - margin * 2 - 18);
        descLines.forEach((line, index) => {
          ctx.fillText(line, margin + 10, boxY + 79 + index * 15);
        });

        ctx.font = "10px sans-serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (const button of custom.promptDeckComposerInsightButtonRects) {
          const active = feedback?.key === button.key && performance.now() < feedback.until;
          drawRoundRect(ctx, button.x, button.y, button.width, button.height, 5);
          ctx.fillStyle = active ? "#214432" : button.key === "save_result" ? "#263f34" : "#26323f";
          ctx.fill();
          ctx.strokeStyle = active ? "#70d89b" : button.key === "save_result" ? "#5aa37d" : "#5f7fa4";
          ctx.stroke();
          ctx.fillStyle = active ? "#d9ffe8" : "#edf2f7";
          const activeLabel = button.key === "save_result" ? (node.promptDeckComposerSaveResultStatus || "Saved!") : "Copied!";
          ctx.fillText(active ? fitText(ctx, activeLabel, button.width - 8) : (button.key === "save_result" ? "Save Result" : "Copy Insight"), button.x + button.width / 2, button.y + button.height / 2);
        }
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        if (event.type !== "pointerdown" && event.type !== "mousedown") return false;
        const rect = custom.promptDeckComposerInsightButtonRects?.find((item) =>
          item.enabled &&
          pos[0] >= item.x &&
          pos[0] <= item.x + item.width &&
          pos[1] >= item.y &&
          pos[1] <= item.y + item.height
        );
        if (!rect) return false;
        if (rect.key === "save_result") {
          saveRecentResult(node);
          return true;
        }
        const insight = node.promptDeckComposerResultInsight || buildResultInsight(node);
        copyTextToClipboard(insight.description).then((copied) => {
          if (copied) showPreviewCopyFeedback(node, rect.key);
        });
        return true;
      }, false);
    },
  };
  return custom;
}

function recentResultsVisibleCount(node) {
  const results = recentResultsForNode(node);
  return Math.min(node?.showAllResults ? 10 : 3, results.length);
}

function recentResultsHeight(node) {
  const results = recentResultsForNode(node);
  const count = recentResultsVisibleCount(node);
  if (!count) return 44;
  const showToggle = results.length > 3;
  return 10 + count * 128 + (showToggle ? 32 : 0);
}

function makeRecentResultsWidget() {
  const custom = {
    name: "Recent Results",
    type: "prompt_deck_composer_recent_results",
    serialize: false,
    computeSize: (width) => [width, recentResultsHeight(custom.promptDeckComposerNode)],
    draw(ctx, node, width, y) {
      guard(() => {
        custom.promptDeckComposerNode = node;
        const allResults = recentResultsForNode(node);
        const maxVisible = node.showAllResults ? 10 : 3;
        const results = allResults.slice(0, maxVisible);
        const margin = 12;
        const cardHeight = 120;
        const cardGap = 8;
        custom.promptDeckComposerRecentResultRects = [];
        custom.promptDeckComposerThumbnailHitAreas = [];
        ctx.save();
        ctx.textBaseline = "top";
        if (!results.length) {
          ctx.font = "11px sans-serif";
          ctx.fillStyle = "rgba(190,203,218,0.72)";
          ctx.fillText("No saved results yet.", margin, y + 12);
          ctx.restore();
          return;
        }
        results.forEach((result, index) => {
          const cardY = y + 6 + index * (cardHeight + cardGap);
          const cardX = margin;
          const cardW = width - margin * 2;
          drawRoundRect(ctx, cardX, cardY, cardW, cardHeight, 7);
          ctx.fillStyle = "#171d24";
          ctx.fill();
          ctx.strokeStyle = "#44505f";
          ctx.stroke();

          const thumb = thumbnailImageFor(node, result);
          const imageUrl = thumbnailUrl(result.image);
          const hasThumb = Boolean(thumb);
          const thumbSize = 54;
          const thumbX = cardX + 9;
          const thumbY = cardY + 9;
          if (imageUrl) {
            custom.promptDeckComposerThumbnailHitAreas.push({
              resultId: result.id,
              x: thumbX,
              y: thumbY,
              width: thumbSize,
              height: thumbSize,
              imageUrl,
              title: result.title || recentResultTitle({ themeStack: result.themeStack }),
            });
          }
          if (imageUrl) {
            drawRoundRect(ctx, thumbX, thumbY, thumbSize, thumbSize, 5);
            if (hasThumb) {
              ctx.save();
              ctx.clip();
              const scale = Math.max(thumbSize / thumb.width, thumbSize / thumb.height);
              const drawW = thumb.width * scale;
              const drawH = thumb.height * scale;
              ctx.drawImage(thumb, thumbX + (thumbSize - drawW) / 2, thumbY + (thumbSize - drawH) / 2, drawW, drawH);
              ctx.restore();
            } else {
              ctx.fillStyle = "#101720";
              ctx.fill();
              ctx.fillStyle = thumbnailLoadFailed(node, result) ? "#ffb4b4" : "rgba(190,203,218,0.62)";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.font = "9px sans-serif";
              ctx.fillText(thumbnailLoadFailed(node, result) ? "missing" : "loading", thumbX + thumbSize / 2, thumbY + thumbSize / 2);
              ctx.textBaseline = "top";
            }
            drawRoundRect(ctx, thumbX, thumbY, thumbSize, thumbSize, 5);
            ctx.strokeStyle = "#526174";
            ctx.stroke();
          }

          const textX = imageUrl ? thumbX + thumbSize + 9 : cardX + 9;
          const textW = cardW - (textX - cardX) - 9;
          ctx.textAlign = "left";
          ctx.font = "bold 10.5px sans-serif";
          ctx.fillStyle = "#a7f3c5";
          ctx.fillText(fitText(ctx, result.title || recentResultTitle({ themeStack: result.themeStack }), textW), textX, cardY + 8);
          ctx.font = "10px sans-serif";
          ctx.fillStyle = "#edf2f7";
          ctx.fillText(fitText(ctx, result.insight_description || "No insight description.", textW), textX, cardY + 27);
          ctx.fillStyle = "rgba(190,203,218,0.72)";
          ctx.fillText(fitText(ctx, toneMeta(result.tones), textW), textX, cardY + 48);
          ctx.fillText(fitText(ctx, weightMeta(result.weights), textW), textX, cardY + 63);
          const imageStatusText = thumbnailLoadFailed(node, result) ? "Thumb missing" : thumbnailStatusLabel(result.image);
          ctx.fillText(fitText(ctx, imageStatusText, textW), textX, cardY + 78);

          const labels = [
            ["load", "Load"],
            ["explore", "Explore v"],
            ["copy_prompt", "Copy Prompt"],
            ["delete", "Delete"],
          ];
          const buttonGap = 5;
          const buttonY = cardY + cardHeight - 27;
          const buttonW = Math.max(52, Math.floor((cardW - 18 - buttonGap * 3) / 4));
          labels.forEach(([key, label], buttonIndex) => {
            const x = cardX + 9 + buttonIndex * (buttonW + buttonGap);
            const feedback = node.promptDeckComposerCopyFeedback;
            const feedbackKey = `recent_${key}_${result.id}`;
            const exploreFeedbackKey = `recent_explore_${result.id}`;
            const active = feedback?.key === feedbackKey && performance.now() < feedback.until;
            const exploreActive = feedback?.key === exploreFeedbackKey && key === "explore" && performance.now() < feedback.until;
            custom.promptDeckComposerRecentResultRects.push({ key, id: result.id, x, y: buttonY, width: buttonW, height: 20 });
            drawRoundRect(ctx, x, buttonY, buttonW, 20, 5);
            ctx.fillStyle = active || exploreActive ? "#214432" : key === "delete" ? "#3b2d35" : key === "load" ? "#26364d" : key === "explore" ? "#30334a" : "#26323f";
            ctx.fill();
            ctx.strokeStyle = active || exploreActive ? "#70d89b" : key === "delete" ? "#9a6376" : key === "load" ? "#668dc4" : key === "explore" ? "#8f83c8" : "#5f7fa4";
            ctx.stroke();
            ctx.fillStyle = active || exploreActive ? "#d9ffe8" : "#edf2f7";
            ctx.textAlign = "center";
            ctx.font = "9.5px sans-serif";
            ctx.textBaseline = "middle";
            ctx.fillText(active ? "Copied!" : exploreActive ? fitText(ctx, node.promptDeckComposerExploreFeedbackLabel || "Loaded", buttonW - 8) : fitText(ctx, label, buttonW - 8), x + buttonW / 2, buttonY + 10);
            ctx.textBaseline = "top";
          });
        });
        if (allResults.length > 3) {
          const buttonY = y + 6 + results.length * (cardHeight + cardGap);
          const buttonW = Math.min(180, width - margin * 2);
          const label = node.showAllResults ? "Show Less" : `Show More (${allResults.length - 3} more)`;
          custom.promptDeckComposerRecentResultRects.push({ key: "toggle_more", id: "", x: margin, y: buttonY, width: buttonW, height: 22 });
          drawRoundRect(ctx, margin, buttonY, buttonW, 22, 5);
          ctx.fillStyle = "#26323f";
          ctx.fill();
          ctx.strokeStyle = "#5f7fa4";
          ctx.stroke();
          ctx.fillStyle = "#edf2f7";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.font = "10px sans-serif";
          ctx.fillText(label, margin + buttonW / 2, buttonY + 11);
        }
        drawExploreMenu(ctx, node, custom);
        ctx.restore();
      });
    },
    mouse(event, pos, node) {
      return guard(() => {
        if (event.type !== "pointerdown" && event.type !== "mousedown") return false;
        if (node.promptDeckComposerExploreMenu?.open) {
          const menuRect = {
            x: node.promptDeckComposerExploreMenu.x,
            y: node.promptDeckComposerExploreMenu.y,
            width: node.promptDeckComposerExploreMenu.width,
            height: node.promptDeckComposerExploreMenu.itemHeight * EXPLORE_VARIANT_ITEMS.length,
          };
          const item = custom.promptDeckComposerExploreMenuRects?.find((rect) => pointInRect(pos, rect));
          if (item) {
            const result = recentResultsForNode(node).find((candidate) => candidate.id === item.resultId);
            closeExploreMenu(node);
            if (result) applyExploreVariant(node, result, item.mode);
            return true;
          }
          if (!pointInRect(pos, menuRect)) {
            closeExploreMenu(node);
            return true;
          }
          return true;
        }
        const thumbArea = custom.promptDeckComposerThumbnailHitAreas?.find((item) => pointInRect(pos, item));
        if (thumbArea) {
          openImageDialog(thumbArea.title, thumbArea.imageUrl);
          return true;
        }
        const rect = custom.promptDeckComposerRecentResultRects?.find((item) =>
          pos[0] >= item.x &&
          pos[0] <= item.x + item.width &&
          pos[1] >= item.y &&
          pos[1] <= item.y + item.height
        );
        if (!rect) return false;
        if (rect.key === "toggle_more") {
          node.showAllResults = node.showAllResults !== true;
          resizeNodeToContent(node);
          node.setDirtyCanvas?.(true, true);
          return true;
        }
        const result = recentResultsForNode(node).find((item) => item.id === rect.id);
        if (!result && rect.key !== "delete") return false;
        if (rect.key === "load") {
          restoreRecentResult(node, result);
          return true;
        }
        if (rect.key === "explore") {
          openExploreMenu(node, rect);
          return true;
        }
        if (rect.key === "copy_prompt") {
          copyTextToClipboard(result.expanded_prompt || result.base_prompt || "").then((copied) => {
            if (copied) showPreviewCopyFeedback(node, `recent_${rect.key}_${rect.id}`);
          });
          return true;
        }
        if (rect.key === "delete") {
          deleteRecentResultFromServer(node, rect.id).catch((error) => {
            console.warn("[PromptDeckComposer] Delete Result failed", error);
          });
          return true;
        }
        return false;
      }, false);
    },
  };
  return custom;
}

function hookWidget(node, widget, callback) {
  if (!widget || widget.promptDeckComposerHooked) return;
  const original = widget.callback;
  widget.callback = function () {
    guard(() => original?.apply(this, arguments));
    guard(callback);
  };
  widget.promptDeckComposerHooked = true;
}
function installComposerUI(node, allowInitialSize = false) {
  guard(() => {
    if (!node.widgets?.length) return;
    cleanupPreviewDom(node);
    for (const name of HIDDEN_WIDGETS) {
      hideBackendWidget(getWidget(node, name));
    }
    for (const section of SECTION_GROUPS) {
      const sectionType = `prompt_deck_composer_section_${section.title}`;
      const existingHeader = node.widgets.find((widget) => widget.type === sectionType);
      if (existingHeader) {
        attachSection(existingHeader, section.title, true);
      } else {
        const header = makeSectionHeader(section.title);
        header.type = sectionType;
        attachSection(header, section.title, true);
        node.widgets.push(header);
      }
      for (const row of section.rows) {
        const type = row.type === "mode" ? "prompt_deck_composer_mode" : `prompt_deck_composer_${row.type}_${row.name}`;
        const existingWidget = node.widgets.find((widget) => widget.type === type);
        if (existingWidget) {
          attachSection(existingWidget, section.title);
          continue;
        }
        const widget =
          row.type === "mode" ? makeModeRow(row) :
          row.type === "text" ? makeTextRow(row) :
          row.type === "ollama_model" ? makeOllamaModelRow(row) :
          row.type === "status" ? makeStatusRow(row) :
          row.type === "float" ? makeFloatRow(row) :
          row.type === "reroll_buttons" ? makeRerollButtonsRow(row) :
          row.type === "theme_grid" ? makeThemeStackGridRow(row) :
          row.type === "result_insight" ? makeResultInsightWidget(row) :
          row.type === "recent_results" ? makeRecentResultsWidget(row) :
          row.type === "structured_mode" ? makeStructuredModeRow(row) :
          row.type === "tone_mix" ? makeToneMixRow(row) :
          row.type === "tone_boolean" ? makeToneBooleanRow(row) :
          row.type === "chaos" ? makeChaosRow(row) :
          row.type === "combo" ? makeComboRow(row) :
          makeLockRow(row);
        widget.type = type;
        attachSection(widget, section.title);
        node.widgets.push(widget);
      }
    }
    const previewSectionType = "prompt_deck_composer_section_Final Prompt Preview";
    const existingPreviewHeader = node.widgets.find((widget) => widget.type === previewSectionType);
    if (existingPreviewHeader) {
      attachSection(existingPreviewHeader, "Final Prompt Preview", true);
    } else {
      const header = makeSectionHeader("Final Prompt Preview");
      header.type = previewSectionType;
      attachSection(header, "Final Prompt Preview", true);
      node.widgets.push(header);
    }
    const existingPreview = node.widgets.find((widget) => widget.type === "prompt_deck_composer_preview");
    if (existingPreview) {
      attachSection(existingPreview, "Final Prompt Preview");
    } else {
      node.widgets.push(attachSection(makePreviewWidget(), "Final Prompt Preview"));
    }
    ensureFinalPreviewLast(node);
    for (const widget of node.widgets) {
      if (widget.type === "prompt_deck_composer_mode" && !widget.promptDeckComposerSection) {
        attachSection(widget, "Basic");
      }
      if (widget.type === "prompt_deck_composer_preview" && !widget.promptDeckComposerSection) {
        attachSection(widget, "Final Prompt Preview");
      }
    }
    applyCollapsedState(node, { resize: false });
    for (const name of [...HIDDEN_WIDGETS, "seed"]) {
      hookWidget(node, getWidget(node, name), () => {
        if (name === "randomize") {
          syncAutoComposeCollapse(node);
        }
        if (name === "OLLAMA_URL") {
          refreshOllamaModels(node);
        }
        if (name === "OLLAMA_ENABLE" && getWidget(node, "OLLAMA_ENABLE")?.value === true) {
          refreshOllamaModels(node);
        }
        updatePreview(node);
      });
    }
    syncAutoComposeCollapse(node, { applyInitial: true });
    updatePreview(node);
    fetchRecentResultsFromServer(node);
    refreshOllamaModels(node);
    if (allowInitialSize) {
      applyInitialSize(node);
    } else {
      resizeNodeToContent(node);
    }
  });
}

function syncComposerResult(detail) {
  guard(() => {
    const nodes = app.graph?._nodes || app.graph?.nodes || [];
    const node = nodes.find((item) => String(item.id) === String(detail?.node_id) && item.comfyClass === "PromptDeckComposer");
    if (!node) return;
    if (!node.promptDeckComposerRunStartedAt) {
      markComposerRunStarted(node);
    }
    for (const [name, value] of Object.entries(detail.values || {})) {
      const widget = getWidget(node, name);
      if (widget) {
        setWidgetValue(node, widget, value, false);
      }
    }
    if (detail.status) {
      setWidgetValue(node, getWidget(node, "OLLAMA_STATUS"), detail.status, false);
    }
    const resolvedTheme = detail.resolved_theme || detail.values?.resolved_theme;
    if (resolvedTheme && typeof resolvedTheme === "object") {
      node.promptDeckComposerResolvedTheme = resolvedTheme;
    }
    const basePrompt = detail.base_prompt || finalPrompt(node);
    const expandedPrompt = detail.ollama_prompt || detail.prompt || "";
    const showExpanded = getWidget(node, "OLLAMA_ENABLE")?.value === true && detail.status === "Ollama: Connected";
    updatePreview(node, basePrompt, showExpanded ? expandedPrompt : "");
  });
}

guard(() => {
  api.addEventListener?.("execution_start", () => markAllComposerRunsStarted());
  api.addEventListener?.("executing", (event) => {
    const detail = event.detail;
    const nodeId = typeof detail === "object" ? detail?.node : detail;
    const nodes = app.graph?._nodes || app.graph?.nodes || [];
    const node = nodes.find((item) => String(item.id) === String(nodeId) && item.comfyClass === "PromptDeckComposer");
    markComposerRunStarted(node);
  });
  api.addEventListener?.("prompt_deck_composer.composed", (event) => syncComposerResult(event.detail));

  app.registerExtension({
    name: "PromptDeckComposer.CompactUI",
    beforeRegisterNodeDef(nodeType, nodeData) {
      if (nodeData.name !== "PromptDeckComposer") return;

      const originalOnNodeCreated = nodeType.prototype.onNodeCreated;
      nodeType.prototype.onNodeCreated = function () {
        guard(() => originalOnNodeCreated?.apply(this, arguments));
        guard(() => installComposerUI(this, true));
      };

      const originalOnConfigure = nodeType.prototype.onConfigure;
      nodeType.prototype.onConfigure = function () {
        guard(() => originalOnConfigure?.apply(this, arguments));
        guard(() => installComposerUI(this, false));
      };

      const originalOnRemoved = nodeType.prototype.onRemoved;
      nodeType.prototype.onRemoved = function () {
        guard(() => cleanupPreviewDom(this));
        guard(() => originalOnRemoved?.apply(this, arguments));
      };
    },
  });
});
