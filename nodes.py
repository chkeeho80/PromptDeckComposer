import json
import random
import shutil
import time
import socket
import urllib.error
import urllib.request
import uuid
from datetime import datetime, timezone
from pathlib import Path

try:
    from aiohttp import web
    from server import PromptServer
except Exception:
    web = None
    PromptServer = None

try:
    import folder_paths
except Exception:
    folder_paths = None

try:
    from PIL import Image
except Exception:
    Image = None


NODE_DIR = Path(__file__).resolve().parent
DECK_PATH = NODE_DIR / "composer_deck.json"
RECENT_RESULTS_PATH = NODE_DIR / "recent_results.json"
THUMBNAIL_DIR = NODE_DIR / "thumbnails"
NONE_VALUE = "<none>"
IMAGE_EXTENSIONS = {".png", ".jpg", ".jpeg", ".webp"}
DEFAULT_OLLAMA_SYSTEM_PROMPT = (
    "You are a high-detail visual scene prompt generator for Flux-based image models. You will receive a 'Theme' input.\n\n"
    "LOGIC:\n"
    "If 'Theme' is empty: invent a dense, visually rich scene across any genre.\n"
    "If 'Theme' contains a concept: build the scene around that concept as the central anchor.\n\n"
    "MANDATORY VISUAL ELEMENTS:\n\n"
    "Subject:\n"
    "Define a clear primary subject appropriate to the theme.\n"
    "If human, include anatomy and skin detail.\n"
    "If non-human, emphasize material, structure, or form.\n\n"
    "Environment:\n"
    "Specify location, spatial context, and physical surroundings.\n\n"
    "Lighting:\n"
    "Use clear, physically grounded lighting descriptions (e.g., rim light, volumetric light, fluorescent flicker).\n\n"
    "Camera / Style:\n"
    "Use professional or cinematic framing (lens, focal length, perspective).\n\n"
    "Atmosphere:\n"
    "Include visual micro-details only (particles, dust, moisture, grain).\n\n"
    "SENSORY RESTRICTION:\n"
    "Describe only what is visually observable. Do not include sound, smell, or internal thoughts.\n\n"
    "FORMAT:\n"
    "Output one dense paragraph only.\n"
    "No introduction, no labels, no meta commentary.\n\n"
    "GENDER:\n"
    "Do not assume gender unless explicitly specified in the input."
)

SCENE_KEYS = [
    "PRIMARY_SUBJECT",
    "SUBJECT_MODIFIER",
    "SECONDARY_SUBJECT_1",
    "SECONDARY_SUBJECT_2",
    "ENVIRONMENT",
    "RELATIONSHIP",
]

STYLE_KEYS = [
    "STYLE_LIGHTING",
    "STYLE_COLOR",
    "STYLE_TEXTURE",
    "STYLE_MOOD",
    "STYLE_RENDER",
]

ARTIST_KEYS = ["ARTIST_1", "ARTIST_2", "ARTIST_3"]
STYLE_BLOCK_KEYS = [
    "STYLE_BLOCK_LIGHTING",
    "STYLE_BLOCK_TEXTURE",
    "STYLE_BLOCK_ATMOSPHERE",
    "STYLE_BLOCK_CAMERA",
    "STYLE_BLOCK_CONCEPT",
]

FIELD_LOCK_KEYS = {
    "PRIMARY_SUBJECT": "LOCK_PRIMARY_SUBJECT",
    "SUBJECT_MODIFIER": "LOCK_SUBJECT_MODIFIER",
    "SECONDARY_SUBJECT_1": "LOCK_SECONDARY_SUBJECT_1",
    "SECONDARY_SUBJECT_2": "LOCK_SECONDARY_SUBJECT_2",
    "RELATIONSHIP": "LOCK_RELATIONSHIP",
    "ENVIRONMENT": "LOCK_ENVIRONMENT",
    "STYLE_RENDER": "LOCK_STYLE_RENDER",
    "STYLE_LIGHTING": "LOCK_STYLE_LIGHTING",
    "STYLE_COLOR": "LOCK_STYLE_COLOR",
    "STYLE_TEXTURE": "LOCK_STYLE_TEXTURE",
    "STYLE_MOOD": "LOCK_STYLE_MOOD",
    "ARTIST_COUNT": "LOCK_ARTIST_COUNT",
    "ARTIST_1": "LOCK_ARTIST_1",
    "ARTIST_2": "LOCK_ARTIST_2",
    "ARTIST_3": "LOCK_ARTIST_3",
    "STYLE_BLOCK_LIGHTING": "LOCK_STYLE_BLOCK_LIGHTING",
    "STYLE_BLOCK_TEXTURE": "LOCK_STYLE_BLOCK_TEXTURE",
    "STYLE_BLOCK_ATMOSPHERE": "LOCK_STYLE_BLOCK_ATMOSPHERE",
    "STYLE_BLOCK_CAMERA": "LOCK_STYLE_BLOCK_CAMERA",
    "STYLE_BLOCK_CONCEPT": "LOCK_STYLE_BLOCK_CONCEPT",
}

LOCK_KEYS = {
    "scene": "LOCK_SCENE_STRUCTURE",
    "style": "LOCK_STYLE_LAYERS",
    "artist": "LOCK_ARTIST_MIX",
    "blocks": "LOCK_STYLE_BLOCKS",
}

COUNT_OPTIONS = ["0", "1", "2", "3"]
TONE_OPTIONS = ["neutral", "concise", "cinematic", "poetic", "technical"]
SECONDARY_TONE_OPTIONS = ["none", *TONE_OPTIONS]
CONSISTENCY_THEMES = ["any", "random", "ancient", "cyberpunk", "organic", "industrial", "cosmic", "gothic", "cinematic", "surreal"]
CONSISTENCY_WORLD_THEMES = ["any", "random", "urban", "wilderness", "desert", "oceanic", "subterranean", "orbital", "ruinscape", "polar", "volcanic", "cyberspace", "megastructure", "datacenter", "virtual_void", "utopian_city", "dystopian_city", "alien_biosphere", "deep_ocean", "sky_city", "laboratory", "industrial_zone", "dreamscape", "mirror_world", "battlefield", "haunted_mansion"]
CONSISTENCY_CULTURE_THEMES = ["any", "random", "nomadic", "monastic", "aristocratic", "mercantile", "militaristic", "scholarly", "communal", "artisan", "cyberpunk", "corporate", "hacker", "posthuman", "technocratic", "cultist", "survivalist", "underground", "ritualistic", "imperial", "rebel", "scientific", "occult", "punk", "mythic"]
CONSISTENCY_MATERIAL_THEMES = ["any", "random", "stone", "metal", "glass", "porcelain", "wood", "textile", "crystal", "resin", "ceramic", "neon", "hologram", "circuitry", "chrome", "liquid_metal", "synthetic_polymer", "carbon_fiber", "biomass", "organic_flesh", "data_stream", "plasma", "smoke", "ice", "rust", "ink"]
CONSISTENCY_CONCEPT_THEMES = ["any", "random", "sacred", "liminal", "melancholy", "uncanny", "transcendence", "decay", "metamorphosis", "nostalgia", "duality", "simulation", "surveillance", "identity_loss", "hyperreality", "digital_decay", "control", "augmentation", "isolation", "memory_erasure", "forbidden_knowledge", "entropy", "awakening", "invasion", "containment", "rebellion"]
CONSISTENCY_WEIGHT_KEYS = {
    "world": "CONSISTENCY_WORLD_WEIGHT",
    "culture": "CONSISTENCY_CULTURE_WEIGHT",
    "material": "CONSISTENCY_MATERIAL_WEIGHT",
    "concept": "CONSISTENCY_CONCEPT_WEIGHT",
}
CONSISTENCY_WEIGHT_RANDOM_KEYS = {
    "world": "world_weight_random",
    "culture": "culture_weight_random",
    "material": "material_weight_random",
    "concept": "concept_weight_random",
}
THEME_KEYWORDS = {
    "urban": ["metropolis", "boulevard", "skyline", "crosswalk", "apartment", "overpass", "storefront"],
    "wilderness": ["forest", "valley", "meadow", "ridge", "waterfall", "grove", "mountain"],
    "desert": ["dune", "oasis", "mesa", "badlands", "sandstorm", "canyon", "wasteland"],
    "oceanic": ["underwater", "submerged", "reef", "kelp", "abyssal", "lagoon", "tidal"],
    "subterranean": ["cavern", "tunnel", "underground", "catacomb", "vault", "chasm", "bunker"],
    "orbital": ["space", "station", "satellite", "asteroid", "spaceship", "gravity", "orbit"],
    "ruinscape": ["ruins", "derelict", "overgrown", "collapsed", "weathered", "abandoned", "remnant"],
    "polar": ["tundra", "glacier", "iceberg", "snowfield", "frost", "arctic", "blizzard"],
    "volcanic": ["lava", "magma", "basalt", "caldera", "ashfall", "ember", "crater"],
    "nomadic": ["caravan", "wayfarer", "migratory", "encampment", "traveler", "route", "itinerant"],
    "monastic": ["monk", "cloister", "vow", "abbot", "contemplative", "hermitage", "discipline"],
    "aristocratic": ["courtly", "noble", "dynasty", "heraldry", "regal", "lineage", "estate"],
    "mercantile": ["bazaar", "trader", "merchant", "barter", "marketplace", "ledger", "commerce"],
    "militaristic": ["legion", "battalion", "fortified", "campaign", "armory", "command", "regiment"],
    "scholarly": ["archive", "scribe", "codex", "academy", "lecture", "manuscript", "study"],
    "communal": ["collective", "village", "kinship", "gathering", "cooperative", "hearth", "neighborhood"],
    "artisan": ["craft", "workshop", "apprentice", "handmade", "guild", "maker", "toolbench"],
    "stone": ["granite", "marble", "limestone", "slate", "sandstone", "chiseled", "masonry"],
    "metal": ["steel", "iron", "chrome", "brass", "copper", "alloy", "oxidized"],
    "glass": ["translucent", "mirror", "transparent", "refraction", "prismatic", "vitreous", "shard"],
    "porcelain": ["porcelain", "kaolin", "glaze", "ceramic", "enameled", "bisque", "china"],
    "wood": ["timber", "oak", "cedar", "grain", "bark", "polished", "carved"],
    "textile": ["woven", "fabric", "thread", "linen", "tapestry", "embroidered", "fiber"],
    "crystal": ["quartz", "amethyst", "faceted", "gemstone", "geode", "mineral", "lattice"],
    "resin": ["amber", "sap", "varnish", "hardened", "viscous", "lacquer", "inclusion"],
    "ceramic": ["clay", "earthenware", "terracotta", "kiln", "matte", "fired", "unglazed"],
    "sacred": ["reverence", "hallowed", "sanctity", "benediction", "consecrated", "devotional", "awe"],
    "liminal": ["threshold", "inbetween", "transitional", "borderline", "ambiguous", "unresolved", "passage"],
    "melancholy": ["sorrow", "longing", "wistful", "mourning", "quietude", "regret", "tenderness"],
    "uncanny": ["eerie", "disquiet", "estranged", "familiarity", "unease", "peculiar", "displacement"],
    "transcendence": ["ascension", "awakening", "sublime", "radiance", "elevation", "clarity", "release"],
    "decay": ["entropy", "fading", "erosion", "dissolution", "withering", "decline", "impermanence"],
    "metamorphosis": ["transformation", "emergence", "becoming", "mutation", "unfolding", "evolution", "rebirth"],
    "nostalgia": ["memory", "recollection", "yearning", "afterimage", "remembrance", "faded", "echo"],
    "duality": ["contrast", "opposition", "mirrorlike", "binary", "tension", "balance", "polarity"],
    "cyberspace": ["cyberspace", "virtual", "network", "interface", "data", "grid", "digital"],
    "megastructure": ["megastructure", "superstructure", "arcology", "towering", "monumental", "vast", "engineered"],
    "datacenter": ["server", "rack", "cable", "cooling", "terminal", "machine room", "datacenter"],
    "virtual_void": ["void", "wireframe", "black space", "digital emptiness", "simulation", "abstract grid"],
    "utopian_city": ["clean city", "bright skyline", "garden tower", "solar", "harmonious", "elevated transit"],
    "dystopian_city": ["dystopian", "smog", "surveillance", "crowded street", "neon alley", "concrete tower"],
    "alien_biosphere": ["alien", "biome", "xenoflora", "spores", "strange ecology", "extraterrestrial"],
    "deep_ocean": ["abyss", "deep sea", "pressure", "bioluminescent", "submersible", "trench"],
    "sky_city": ["floating city", "airship", "cloud city", "sky bridge", "suspended", "aerial"],
    "laboratory": ["laboratory", "glass chamber", "specimen", "sterile", "experiment", "containment"],
    "industrial_zone": ["factory", "warehouse", "pipe", "smokestack", "assembly", "machinery"],
    "dreamscape": ["dream", "impossible space", "soft horizon", "surreal landscape", "floating form"],
    "mirror_world": ["mirror", "reflection", "inversion", "symmetry", "duplicate", "refracted"],
    "battlefield": ["battlefield", "trench", "ruined armor", "smoke", "banner", "wreckage"],
    "haunted_mansion": ["mansion", "corridor", "old wallpaper", "candlelight", "staircase", "haunted"],
    "cyberpunk": ["cyberpunk", "neon", "augment", "street tech", "rainy alley", "chrome", "hacker"],
    "corporate": ["corporate", "executive", "office tower", "suit", "boardroom", "brand", "security"],
    "hacker": ["hacker", "terminal", "code", "interface", "encrypted", "underground network"],
    "posthuman": ["posthuman", "cyborg", "synthetic body", "augmentation", "transhuman", "machine flesh"],
    "technocratic": ["technocratic", "bureaucratic machine", "system control", "official", "algorithmic"],
    "cultist": ["cult", "hooded", "symbol", "ritual", "circle", "devotion"],
    "survivalist": ["survivalist", "makeshift", "shelter", "ration", "worn gear", "post-collapse"],
    "underground": ["underground", "subculture", "basement", "hidden club", "graffiti", "secret venue"],
    "ritualistic": ["ritual", "ceremony", "altar", "symbol", "chanting figure", "procession"],
    "imperial": ["imperial", "empire", "banner", "palace", "regalia", "command"],
    "rebel": ["rebel", "insurgent", "resistance", "patched gear", "uprising", "underground cell"],
    "scientific": ["scientific", "researcher", "instrument", "specimen", "diagram", "analysis"],
    "occult": ["occult", "sigil", "esoteric", "arcane", "forbidden symbol", "ritual text"],
    "punk": ["punk", "patched jacket", "DIY", "graffiti", "anti-establishment", "raw"],
    "mythic": ["mythic", "legend", "heroic", "ancient tale", "divine beast", "epic"],
    "neon": ["neon", "glow", "electric color", "signage", "luminous tube", "saturated light"],
    "hologram": ["hologram", "projection", "transparent display", "light screen", "floating interface"],
    "circuitry": ["circuit", "motherboard", "trace line", "chip", "wiring", "microelectronics"],
    "chrome": ["chrome", "mirror metal", "polished surface", "reflective", "silver sheen"],
    "liquid_metal": ["liquid metal", "mercury", "molten alloy", "fluid chrome", "reflective flow"],
    "synthetic_polymer": ["polymer", "plastic", "synthetic", "matte composite", "manufactured surface"],
    "carbon_fiber": ["carbon fiber", "woven composite", "black weave", "lightweight shell"],
    "biomass": ["biomass", "organic mass", "fibrous tissue", "growth", "living material"],
    "organic_flesh": ["flesh", "skin", "muscle", "vein", "organic tissue", "anatomical"],
    "data_stream": ["data stream", "binary", "code rain", "packet", "signal", "flowing information"],
    "plasma": ["plasma", "ionized light", "electric arc", "glowing energy", "charged field"],
    "smoke": ["smoke", "mist", "vapor", "haze", "diffusion", "soft opacity"],
    "ice": ["ice", "frost", "frozen", "crystalline cold", "snow crust", "glacier surface"],
    "rust": ["rust", "oxidation", "corrosion", "weathered metal", "orange patina"],
    "ink": ["ink", "brushstroke", "black fluid", "wash", "bleeding pigment"],
    "simulation": ["simulation", "virtual", "rendered reality", "artificial world", "constructed space"],
    "surveillance": ["surveillance", "camera", "watching", "monitor", "tracking", "security system"],
    "identity_loss": ["identity loss", "faceless", "mask", "erased features", "anonymous", "fragmented self"],
    "hyperreality": ["hyperreality", "synthetic realism", "advertisement glow", "too perfect", "artificial clarity"],
    "digital_decay": ["digital decay", "glitch", "compression artifact", "corrupted data", "pixel smear"],
    "control": ["control", "constraint", "system", "authority", "containment", "regulated"],
    "augmentation": ["augmentation", "implant", "prosthetic", "cybernetic", "enhanced body"],
    "isolation": ["isolation", "alone", "empty space", "distant figure", "separation"],
    "memory_erasure": ["memory erasure", "blank record", "missing face", "faded photograph", "forgotten archive"],
    "forbidden_knowledge": ["forbidden knowledge", "sealed book", "hidden diagram", "classified", "arcane secret"],
    "entropy": ["entropy", "disorder", "collapse", "fragmentation", "breakdown"],
    "awakening": ["awakening", "activation", "first light", "emergence", "consciousness"],
    "invasion": ["invasion", "intrusion", "breach", "arrival", "foreign presence"],
    "containment": ["containment", "sealed chamber", "glass wall", "quarantine", "locked specimen"],
    "rebellion": ["rebellion", "uprising", "defiance", "broken chain", "resistance"],
}


DEFAULT_DECK = {
    "PRIMARY_SUBJECT": ["young woman", "masked traveler", "forest spirit"],
    "SECONDARY_SUBJECT": [NONE_VALUE, "mechanical raven", "ancient artifact", "stray cat"],
    "ENVIRONMENT": [NONE_VALUE, "rainy neon alley", "ancient temple in the jungle"],
    "RELATIONSHIP": ["standing with", "walking beside", "guarded by", "discovering"],
    "SUBJECT_MODIFIER": [
        NONE_VALUE,
        "made of herbs",
        "covered in cracked porcelain",
        "formed from smoke and wet ink",
    ],
    "STYLE_LIGHTING": [NONE_VALUE, "under neon rim lighting", "lit by soft window light"],
    "STYLE_COLOR": [NONE_VALUE, "in teal and amber", "with muted earth tones"],
    "STYLE_TEXTURE": [NONE_VALUE, "with soft film grain", "with ink wash edges"],
    "STYLE_MOOD": [NONE_VALUE, "dreamlike and quiet", "ominous and ceremonial"],
    "STYLE_RENDER": [NONE_VALUE, "cinematic concept art", "surreal realism"],
    "ARTIST": [NONE_VALUE, "Caravaggio", "Gustav Klimt", "Moebius"],
    "STYLE_BLOCK_LIGHTING": [
        NONE_VALUE,
        "A red halation blooms around the brightest light sources, giving the image a vintage optical glow.",
    ],
    "STYLE_BLOCK_TEXTURE": [
        NONE_VALUE,
        "Visible paper grain, feathered pigment edges, and layered washes give the image a handmade tactile surface.",
    ],
    "STYLE_BLOCK_ATMOSPHERE": [
        NONE_VALUE,
        "The atmosphere carries quiet narrative tension, as though something important has just happened or is about to happen.",
    ],
    "STYLE_BLOCK_CAMERA": [
        NONE_VALUE,
        "The image feels captured through a vintage anamorphic lens, with blooming highlights, deep blacks, and rich saturation.",
    ],
    "STYLE_BLOCK_CONCEPT": [
        NONE_VALUE,
        "Organic warmth fights against synthetic light, emphasizing the boundary between human, machine, and myth.",
    ],
}


def _load_json(path, fallback):
    try:
        with path.open("r", encoding="utf-8") as handle:
            return json.load(handle)
    except Exception:
        return fallback


def _clean_pool(values, fallback, allow_none=True):
    if not isinstance(values, list):
        values = fallback
    pool = [str(value).strip() for value in values if str(value).strip()]
    pool = pool or fallback
    if allow_none:
        return [NONE_VALUE] + [value for value in pool if value != NONE_VALUE]
    return [value for value in pool if value != NONE_VALUE] or [value for value in fallback if value != NONE_VALUE]


def load_deck():
    raw = _load_json(DECK_PATH, {})
    deck = {}
    for key, fallback in DEFAULT_DECK.items():
        deck[key] = _clean_pool(raw.get(key, fallback), fallback, allow_none=key != "PRIMARY_SUBJECT")
    return deck


def _trim_string(value, limit=20000):
    text = str(value)
    return text[:limit]


def _sanitize_json_value(value, depth=0):
    if depth > 6:
        return None
    if isinstance(value, dict):
        clean = {}
        for key, item in value.items():
            if isinstance(key, str):
                clean[key] = _sanitize_json_value(item, depth + 1)
        return clean
    if isinstance(value, list):
        return [_sanitize_json_value(item, depth + 1) for item in value[:200]]
    if isinstance(value, str):
        return _trim_string(value)
    if isinstance(value, (int, float, bool)) or value is None:
        return value
    return str(value)


def _settings_only_image():
    return {
        "status": "settings_only",
        "filename": "",
        "subfolder": "",
        "type": "composer_thumbnail",
        "source": None,
    }


def sanitize_image_info(image):
    if not isinstance(image, dict):
        return _settings_only_image()
    status = str(image.get("status") or "settings_only")
    filename = str(image.get("filename") or "")
    if not _safe_filename(filename):
        filename = ""
    return {
        "status": status,
        "filename": filename,
        "subfolder": "",
        "type": "composer_thumbnail",
        "source": _sanitize_json_value(image.get("source")) if image.get("source") else None,
    }


def sanitize_recent_result(result):
    if not isinstance(result, dict):
        return None
    clean = _sanitize_json_value(result)
    if not isinstance(clean, dict):
        return None
    clean.setdefault("id", f"{int(time.time() * 1000)}-{uuid.uuid4().hex[:8]}")
    clean.setdefault("created_at", datetime.now(timezone.utc).isoformat())
    clean["image"] = sanitize_image_info(clean.get("image"))
    return clean


def trim_recent_results(results, limit=20):
    clean = []
    if not isinstance(results, list):
        return clean
    for result in results:
        item = sanitize_recent_result(result)
        if item is not None:
            clean.append(item)
        if len(clean) >= limit:
            break
    return clean


def load_recent_results():
    try:
        if not RECENT_RESULTS_PATH.exists():
            return []
        with RECENT_RESULTS_PATH.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
        return trim_recent_results(data)
    except Exception:
        return []


def save_recent_results(results):
    clean = trim_recent_results(results)
    try:
        with RECENT_RESULTS_PATH.open("w", encoding="utf-8") as handle:
            json.dump(clean, handle, ensure_ascii=False, indent=2)
    except Exception:
        pass
    return clean


def _safe_path_part(value):
    if value is None:
        return ""
    text = str(value).replace("\\", "/").strip("/")
    if not text:
        return ""
    parts = [part for part in text.split("/") if part]
    if any(part in {".", ".."} for part in parts):
        return ""
    return "/".join(parts)


def _safe_filename(value):
    if not value:
        return False
    text = str(value)
    return "/" not in text and "\\" not in text and ".." not in text and Path(text).suffix.lower() in IMAGE_EXTENSIONS


def _directory_for_source_type(source_type):
    if folder_paths is None:
        return None
    try:
        if source_type == "output":
            return Path(folder_paths.get_output_directory())
        if source_type == "temp":
            return Path(folder_paths.get_temp_directory())
    except Exception:
        return None
    return None


def _resolve_source_image_path(source_image):
    if not isinstance(source_image, dict):
        return None
    source_type = str(source_image.get("type") or "")
    filename = str(source_image.get("filename") or "")
    subfolder = _safe_path_part(source_image.get("subfolder") or "")
    if source_type not in {"output", "temp"} or not _safe_filename(filename):
        return None
    base_dir = _directory_for_source_type(source_type)
    if base_dir is None:
        return None
    base_dir = base_dir.resolve()
    source_path = (base_dir / subfolder / filename).resolve() if subfolder else (base_dir / filename).resolve()
    try:
        source_path.relative_to(base_dir)
    except ValueError:
        return None
    if not source_path.exists() or not source_path.is_file():
        return None
    return source_path


def _image_size(path):
    if Image is None:
        return None
    try:
        with Image.open(path) as image:
            return image.size
    except Exception:
        return None


def _latest_image_in_dir(base_dir, source_type, max_age_seconds=1800, min_mtime=None, max_long_side=None):
    if base_dir is None:
        return None
    try:
        base_dir = Path(base_dir).resolve()
        if not base_dir.exists() or not base_dir.is_dir():
            return None
        now = time.time()
        try:
            min_mtime = float(min_mtime) if min_mtime is not None else None
        except Exception:
            min_mtime = None
        latest = None
        latest_mtime = -1
        for path in base_dir.rglob("*"):
            try:
                if not path.is_file() or path.suffix.lower() not in IMAGE_EXTENSIONS:
                    continue
                mtime = path.stat().st_mtime
                if min_mtime is not None and mtime < min_mtime:
                    continue
                if max_age_seconds is not None and now - mtime > max_age_seconds:
                    continue
                if max_long_side is not None:
                    size = _image_size(path)
                    if not size:
                        continue
                    if max(size) > max_long_side:
                        continue
                if mtime > latest_mtime:
                    latest = path
                    latest_mtime = mtime
            except Exception:
                continue
        if latest is None:
            return None
        subfolder = ""
        if latest.parent != base_dir:
            subfolder = str(latest.parent.relative_to(base_dir)).replace("\\", "/")
        return {
            "filename": latest.name,
            "subfolder": subfolder,
            "type": source_type,
        }
    except Exception:
        return None


def find_latest_image_source(prefer_output=False, min_mtime=None):
    temp_source = _latest_image_in_dir(
        _directory_for_source_type("temp"),
        "temp",
        max_age_seconds=600,
        min_mtime=min_mtime,
        max_long_side=2048,
    )
    output_source = None
    if prefer_output:
        output_source = _latest_image_in_dir(
            _directory_for_source_type("output"),
            "output",
            max_age_seconds=120,
            min_mtime=min_mtime,
        )
    if prefer_output:
        return output_source or temp_source
    return temp_source


def copy_result_thumbnail(source_image):
    if not isinstance(source_image, dict):
        return _settings_only_image()
    source_type = str(source_image.get("type") or "")
    source_path = _resolve_source_image_path(source_image)
    if source_path is None:
        return {
            "status": "missing",
            "filename": "",
            "subfolder": "",
            "type": "composer_thumbnail",
            "source": _sanitize_json_value(source_image),
        }
    THUMBNAIL_DIR.mkdir(parents=True, exist_ok=True)
    extension = source_path.suffix.lower()
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    thumb_name = f"thumb_{stamp}_{uuid.uuid4().hex[:8]}{extension}"
    target_path = (THUMBNAIL_DIR / thumb_name).resolve()
    try:
        target_path.relative_to(THUMBNAIL_DIR.resolve())
    except ValueError:
        return _settings_only_image()
    shutil.copy2(source_path, target_path)
    return {
        "status": "preview_copied" if source_type == "temp" else "output_copied",
        "filename": thumb_name,
        "subfolder": "",
        "type": "composer_thumbnail",
        "source": {
            "filename": str(source_image.get("filename") or ""),
            "subfolder": str(source_image.get("subfolder") or ""),
            "type": source_type,
        },
    }


def _thumbnail_filename(result):
    if not isinstance(result, dict):
        return ""
    image = result.get("image")
    if not isinstance(image, dict) or image.get("type") != "composer_thumbnail":
        return ""
    filename = str(image.get("filename") or "")
    return filename if _safe_filename(filename) else ""


def delete_thumbnail_file(filename):
    if not _safe_filename(filename):
        return
    try:
        thumb_path = (THUMBNAIL_DIR / filename).resolve()
        thumb_path.relative_to(THUMBNAIL_DIR.resolve())
        if thumb_path.exists() and thumb_path.is_file():
            thumb_path.unlink()
    except Exception:
        pass


def delete_thumbnail_if_unreferenced(filename, remaining_results):
    if not filename:
        return
    for result in remaining_results:
        if _thumbnail_filename(result) == filename:
            return
    delete_thumbnail_file(filename)


def clear_thumbnail_files():
    try:
        if not THUMBNAIL_DIR.exists():
            return
        for path in THUMBNAIL_DIR.iterdir():
            if path.is_file() and path.suffix.lower() in IMAGE_EXTENSIONS:
                path.unlink()
    except Exception:
        pass


def cleanup_orphan_thumbnails(results):
    referenced = {_thumbnail_filename(result) for result in results}
    referenced.discard("")
    try:
        if not THUMBNAIL_DIR.exists():
            return
        for path in THUMBNAIL_DIR.iterdir():
            if path.is_file() and path.name not in referenced and path.suffix.lower() in IMAGE_EXTENSIONS:
                path.unlink()
    except Exception:
        pass


def thumbnail_response(filename):
    if not _safe_filename(filename):
        raise FileNotFoundError()
    thumb_path = (THUMBNAIL_DIR / filename).resolve()
    thumb_path.relative_to(THUMBNAIL_DIR.resolve())
    if not thumb_path.exists() or not thumb_path.is_file():
        raise FileNotFoundError()
    return thumb_path


def _value(value):
    text = str(value or "").strip()
    return "" if text == NONE_VALUE or text.lower() == "none" else text


def _clamp_unit(value, default=0.0):
    try:
        return max(0.0, min(1.0, float(value)))
    except Exception:
        return default


def _theme_matches(options, theme):
    keywords = THEME_KEYWORDS.get(str(theme or "").lower(), [])
    if not keywords:
        return []
    matches = []
    for option in options:
        text = str(option).lower()
        if option != NONE_VALUE and any(keyword in text for keyword in keywords):
            matches.append(option)
    return matches


def _resolve_consistency_theme(value, themes, rng=None):
    rng = rng or random
    theme = str(value or "any")
    if theme in ("any", "random"):
        choices = [item for item in themes if item not in ("any", "random") and item in THEME_KEYWORDS]
        return rng.choice(choices) if choices else None
    return theme if theme in THEME_KEYWORDS else None


def _consistency_context(values, rng=None):
    resolved_theme = {
        "world": _resolve_consistency_theme(values.get("CONSISTENCY_WORLD_THEME", "any"), CONSISTENCY_WORLD_THEMES, rng),
        "culture": _resolve_consistency_theme(values.get("CONSISTENCY_CULTURE_THEME", "any"), CONSISTENCY_CULTURE_THEMES, rng),
        "material": _resolve_consistency_theme(values.get("CONSISTENCY_MATERIAL_THEME", "any"), CONSISTENCY_MATERIAL_THEMES, rng),
        "concept": _resolve_consistency_theme(values.get("CONSISTENCY_CONCEPT_THEME", "any"), CONSISTENCY_CONCEPT_THEMES, rng),
    }
    values["resolved_theme"] = resolved_theme
    if not _is_locked(values.get("CONSISTENCY_MODE")):
        return None
    theme_weights = {
        category: _clamp_unit(values.get(widget_name), 0.5)
        for category, widget_name in CONSISTENCY_WEIGHT_KEYS.items()
    }
    theme_weights_by_theme = {}
    for category, theme in resolved_theme.items():
        if not theme:
            continue
        theme_weights_by_theme[theme] = max(theme_weights_by_theme.get(theme, 0.0), theme_weights.get(category, 0.5))
    themes = list(resolved_theme.values())
    themes = [theme for theme in themes if theme]
    if not themes:
        legacy_theme = _resolve_consistency_theme(values.get("CONSISTENCY_THEME", "any"), CONSISTENCY_THEMES, rng)
        themes = [legacy_theme] if legacy_theme else []
    if not themes:
        return None
    strength = _clamp_unit(values.get("CONSISTENCY_STRENGTH"), 0.65)
    return {"themes": themes, "theme": themes[0], "strength": strength, "theme_weights": theme_weights_by_theme}


def _theme_biased_choices(options, consistency):
    if not consistency:
        return []
    weighted = []
    theme_weights = consistency.get("theme_weights") or {}
    for theme in consistency.get("themes") or [consistency.get("theme")]:
        weight = _clamp_unit(theme_weights.get(theme, 0.5), 0.5)
        multiplier = int(round(weight * 8))
        if multiplier <= 0:
            continue
        weighted.extend(_theme_matches(options, theme) * multiplier)
    return weighted


def _pick(rng, pool, allow_none=False, consistency=None):
    choices = pool if allow_none else [item for item in pool if item != NONE_VALUE]
    if consistency and not allow_none:
        biased = _theme_biased_choices(choices, consistency)
        if biased and rng.random() < consistency["strength"]:
            return rng.choice(biased)
    return rng.choice(choices or pool)


def _unique_choices(rng, pool, count, consistency=None):
    choices = [item for item in pool if item != NONE_VALUE]
    if not choices or count <= 0:
        return []
    if consistency:
        biased = _theme_biased_choices(choices, consistency)
        if biased and rng.random() < consistency["strength"]:
            rng.shuffle(biased)
            result = []
            for item in biased:
                if item in result:
                    continue
                result.append(item)
                if len(result) >= count:
                    break
            if len(result) >= count:
                return result
            choices = [item for item in choices if item not in result]
            rng.shuffle(choices)
            return result + choices[: count - len(result)]
    rng.shuffle(choices)
    return choices[: min(count, len(choices))]


def _join_list(items):
    items = [item for item in items if item]
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    return ", ".join(items[:-1]) + " and " + items[-1]


def _natural_join(items):
    items = [item for item in items if item]
    if not items:
        return ""
    if len(items) == 1:
        return items[0]
    if len(items) == 2:
        return f"{items[0]} and {items[1]}"
    return ", ".join(items[:-1]) + f", and {items[-1]}"


def _clean_sentence_part(value):
    return " ".join(str(value or "").strip().strip(" ,.;").split())


def _sentence_case(value):
    text = " ".join(str(value or "").strip().split())
    if not text:
        return ""
    return text[0].upper() + text[1:]


def _strip_prefix(value, prefixes):
    text = _clean_sentence_part(value)
    lowered = text.lower()
    for prefix in prefixes:
        if lowered.startswith(prefix):
            return text[len(prefix):].strip()
    return text


def _finish_sentence(value):
    text = _sentence_case(_clean_sentence_part(value))
    if not text:
        return ""
    return text.rstrip(".!?") + "."


def _clamp_mix(value):
    try:
        return max(0.0, min(1.0, float(value)))
    except Exception:
        return 0.0


def _resolve_tone(primary, secondary="none", mix=0.0):
    primary = primary if primary in TONE_OPTIONS else "neutral"
    secondary = secondary if secondary in TONE_OPTIONS else "none"
    mix = _clamp_mix(mix)
    if secondary == "none" or mix <= 0:
        return primary, "none", 0.0
    return (secondary, primary, mix) if mix >= 0.65 else (primary, secondary, mix)


def _tone_influence_sentence(tone, mix):
    if tone not in TONE_OPTIONS or mix <= 0:
        return ""
    if tone == "concise":
        return "The language stays direct and restrained."
    if tone == "cinematic":
        return "The composition keeps a cinematic sense of depth, contrast, and atmosphere."
    if tone == "poetic":
        return "The image carries a more symbolic, emotionally suspended quality."
    if tone == "technical":
        return "Precise surface detail, lighting gradients, and depth cues guide the description."
    return "The description stays balanced and plainly readable."


def _structured_style_sentence(values):
    style_render = _value(values.get("STYLE_RENDER"))
    style_lighting = _value(values.get("STYLE_LIGHTING"))
    style_color = _value(values.get("STYLE_COLOR"))
    style_texture = _value(values.get("STYLE_TEXTURE"))
    style_mood = _value(values.get("STYLE_MOOD"))
    clauses = []
    if style_render:
        clauses.append(f"the visual treatment uses {style_render}")
    if style_lighting:
        lighting = _strip_prefix(style_lighting, ["with ", "under "])
        clauses.append(f"light reveals {lighting}")
    if style_color:
        clauses.append(f"the scene uses a {_strip_prefix(style_color, ['with ', 'in '])} palette")
    if style_texture:
        texture = _strip_prefix(style_texture, ["with "])
        clauses.append(f"its surface shows {texture}")
    if style_mood:
        clauses.append(f"the atmosphere leans toward {style_mood}")
    if not clauses:
        return ""
    return _finish_sentence("; ".join(clauses))


def _structured_blocks_and_artists_sentence(values, chaos):
    blocks = [_finish_sentence(block) for block in _build_style_blocks(values)]
    blocks = [block for block in blocks if block]
    if chaos < 0.25:
        blocks = blocks[:1]
    elif chaos < 0.65:
        blocks = blocks[:2]
    artists = []
    for key in ARTIST_KEYS:
        artist = _value(values.get(key))
        if artist and artist not in artists:
            artists.append(artist)
    artist_sentence = _finish_sentence(f"The piece is influenced by {_natural_join(artists)}") if artists else ""
    if chaos < 0.65 and artist_sentence and blocks:
        return [_finish_sentence(f"{blocks[0].rstrip('.')}; the piece is influenced by {_natural_join(artists)}")]
    return [*blocks, artist_sentence]


def _coerce_count(value, max_count):
    try:
        return max(0, min(max_count, int(value)))
    except Exception:
        return 0


def _build_scene(values):
    primary = _value(values.get("PRIMARY_SUBJECT"))
    modifier = _value(values.get("SUBJECT_MODIFIER"))
    secondary = [_value(values.get("SECONDARY_SUBJECT_1")), _value(values.get("SECONDARY_SUBJECT_2"))]
    secondary = [item for item in secondary if item]
    relationship = _value(values.get("RELATIONSHIP")) or "with"
    environment = _value(values.get("ENVIRONMENT"))
    primary_phrase = f"{primary} {modifier}".strip() if modifier else primary

    if secondary:
        scene = f"{primary_phrase} {relationship} {_join_list(secondary)}"
    else:
        scene = primary_phrase

    if environment:
        scene = f"{scene} in {environment}"
    return scene.strip()


def _build_style_layers(values):
    return [_value(values.get(key)) for key in STYLE_KEYS if _value(values.get(key))]


def _build_artist_mix(values):
    artists = []
    for key in ARTIST_KEYS:
        artist = _value(values.get(key))
        if artist and artist not in artists:
            artists.append(artist)
    if not artists:
        return ""
    return f"inspired by {' and '.join(artists)}"


def _build_style_blocks(values):
    return [_value(values.get(key)) for key in STYLE_BLOCK_KEYS if _value(values.get(key))]


def _compose_prompt(values, separator):
    sentence_parts = [_build_scene(values)]
    sentence_parts.extend(_build_style_layers(values))
    artist_mix = _build_artist_mix(values)
    if artist_mix:
        sentence_parts.append(artist_mix)

    first_sentence = separator.join(part for part in sentence_parts if part)
    blocks = _build_style_blocks(values)
    return " ".join(part.rstrip(".") + "." for part in [first_sentence, *blocks] if part)


def _structured_prompt(values, chaos=0.5, primary_tone="neutral", secondary_tone="none", tone_mix=0.0):
    user_prompt = _clean_sentence_part(values.get("USER_PROMPT"))
    primary = _value(values.get("PRIMARY_SUBJECT"))
    modifier = _value(values.get("SUBJECT_MODIFIER"))
    secondary = [_value(values.get("SECONDARY_SUBJECT_1")), _value(values.get("SECONDARY_SUBJECT_2"))]
    secondary = [item for item in secondary if item]
    relationship = _value(values.get("RELATIONSHIP"))
    environment = _value(values.get("ENVIRONMENT"))

    tone, influence_tone, resolved_mix = _resolve_tone(primary_tone, secondary_tone, tone_mix)
    subject = " ".join(part for part in [primary, modifier] if part).strip()
    subject_article = f"a {subject}" if subject else ""
    secondary_text = _natural_join(secondary)
    scene_plain = ", ".join(part for part in [
        f"A {subject}" if subject else "",
        f"{relationship or 'interacting with'} {secondary_text}" if secondary_text else "",
        f"set in {environment}" if environment else "",
    ] if part)
    style_render = _value(values.get("STYLE_RENDER"))
    lighting = _strip_prefix(_value(values.get("STYLE_LIGHTING")), ["with ", "under "])
    color = _strip_prefix(_value(values.get("STYLE_COLOR")), ["with ", "in "])
    texture = _strip_prefix(_value(values.get("STYLE_TEXTURE")), ["with "])
    mood = _value(values.get("STYLE_MOOD"))
    blocks = [_finish_sentence(block) for block in _build_style_blocks(values)]
    blocks = [block for block in blocks if block]
    if chaos < 0.25:
        blocks = blocks[:1]
    elif chaos < 0.65:
        blocks = blocks[:2]
    artists = []
    for key in ARTIST_KEYS:
        artist = _value(values.get(key))
        if artist and artist not in artists:
            artists.append(artist)

    def artist_sentence(prefix):
        return _finish_sentence(f"{prefix} {_natural_join(artists)}") if artists else ""

    sentences = [_finish_sentence(user_prompt)] if user_prompt else []

    if tone == "concise":
        style_bits = [style_render, lighting, color, texture]
        style_bits = [bit for bit in style_bits if bit]
        if scene_plain:
            sentences.append(_finish_sentence(scene_plain))
        if style_bits and chaos >= 0.25:
            sentences.append(_finish_sentence(f"Rendered with {_natural_join(style_bits)}"))
        if chaos >= 0.65 and artists:
            sentences.append(artist_sentence("Inspired by"))
    elif tone == "cinematic":
        frame = f"The frame captures {subject_article}" if subject else "The frame captures the scene"
        if secondary_text:
            frame += f" {relationship or 'alongside'} {secondary_text}"
        if environment:
            frame += f" in {environment}"
        sentences.append(_finish_sentence(frame))
        cinematic_bits = []
        if lighting:
            cinematic_bits.append(f"light cuts through {lighting}")
        if color:
            cinematic_bits.append(f"the scene holds a {color} palette")
        if mood:
            cinematic_bits.append(f"shadows lean into {mood}")
        if texture:
            cinematic_bits.append(f"surface detail catches {texture}")
        if style_render:
            cinematic_bits.append(f"the image plays as {style_render}")
        if cinematic_bits and chaos >= 0.25:
            sentences.append(_finish_sentence("; ".join(cinematic_bits)))
        if chaos >= 0.65:
            sentences.extend(blocks)
        if artists:
            sentences.append(artist_sentence("Visually influenced by"))
    elif tone == "poetic":
        presence = f"A presence emerges as {subject_article}" if subject else "A presence emerges"
        if secondary_text:
            presence += f", {relationship or 'drifting with'} {secondary_text}"
        if environment:
            presence += f", inside {environment}"
        sentences.append(_finish_sentence(presence))
        poetic_bits = []
        if lighting:
            poetic_bits.append(f"light breathes across {lighting}")
        if color:
            poetic_bits.append(f"{color} color moves through the image")
        if texture:
            poetic_bits.append(f"forms dissolve into {texture}")
        if mood:
            poetic_bits.append(f"the image feels {mood}")
        if style_render:
            poetic_bits.append(f"its shape remembers {style_render}")
        if poetic_bits and chaos >= 0.25:
            sentences.append(_finish_sentence("; ".join(poetic_bits)))
        if chaos >= 0.65:
            sentences.extend(blocks[:2])
        if artists:
            sentences.append(artist_sentence("Echoing the language of"))
    elif tone == "technical":
        technical_scene = scene_plain or subject
        if technical_scene:
            sentences.append(_finish_sentence(technical_scene))
        technical_bits = []
        if style_render:
            technical_bits.append(f"rendering style: {style_render}")
        if lighting:
            technical_bits.append(f"lighting: {lighting}")
        if color:
            technical_bits.append(f"color palette: {color}")
        if texture:
            technical_bits.append(f"surface detail: {texture}")
        if mood:
            technical_bits.append(f"mood target: {mood}")
        if technical_bits and chaos >= 0.25:
            sentences.append(_finish_sentence(f"Technical direction includes {_natural_join(technical_bits)}"))
        if blocks and chaos >= 0.65:
            sentences.append(_finish_sentence(f"The image includes these features: {_natural_join([block.rstrip('.') for block in blocks])}"))
        if artists:
            sentences.append(artist_sentence("Influenced by"))
    else:
        if scene_plain:
            sentences.append(_finish_sentence(scene_plain))
        style_sentence = _structured_style_sentence(values)
        if style_sentence and chaos >= 0.25:
            sentences.append(style_sentence)
        elif style_sentence and len(sentences) <= 1:
            sentences.append(style_sentence)
        if chaos >= 0.65:
            sentences.extend(_structured_blocks_and_artists_sentence(values, chaos))
        elif chaos >= 0.25:
            tail = _structured_blocks_and_artists_sentence(values, chaos)
            if tail:
                sentences.append(tail[0])
        elif not scene_plain:
            tail = _structured_blocks_and_artists_sentence(values, chaos)
            if tail:
                sentences.append(tail[0])

    influence_sentence = _tone_influence_sentence(influence_tone, resolved_mix)
    if influence_sentence and chaos >= 0.25:
        if resolved_mix < 0.5 and len(sentences) > 1:
            sentences[1] = _finish_sentence(f"{sentences[1].rstrip('.')}; {influence_sentence[0].lower() + influence_sentence[1:].rstrip('.')}")
        else:
            insert_at = min(len(sentences), 3)
            sentences.insert(insert_at, influence_sentence)

    cleaned = [sentence for sentence in sentences if sentence]
    return " ".join(cleaned).replace("..", ".")


def _join_prompt_parts(parts, separator):
    return separator.join(str(part).strip() for part in parts if str(part or "").strip())


def _is_locked(value):
    return value is True


def _field_locked(values, field):
    return _is_locked(values.get(FIELD_LOCK_KEYS.get(field, "")))


def _clamp_chaos(value):
    try:
        return max(0.0, min(1.0, float(value)))
    except Exception:
        return 0.5


def _chance_pick(rng, pool, chance, consistency=None):
    if rng.random() < chance:
        return _pick(rng, pool, consistency=consistency)
    return NONE_VALUE


def _secondary_count_for_chaos(rng, chaos):
    if chaos < 0.25:
        return rng.choice([0, 0, 1])
    if chaos < 0.65:
        return rng.choice([0, 1, 1, 2])
    return rng.choice([1, 1, 2, 2])


def _artist_count_for_chaos(rng, chaos):
    if chaos < 0.25:
        return rng.choice([0, 1])
    if chaos < 0.65:
        return rng.choice([1, 1, 2])
    return rng.choice([2, 2, 3])


def _block_count_for_chaos(rng, chaos):
    if chaos < 0.25:
        return rng.choice([0, 0, 1])
    if chaos < 0.65:
        return rng.choice([1, 1, 2])
    if chaos < 0.90:
        return rng.choice([2, 2, 3, 4])
    return rng.choice([3, 4, 5])


def _block_limit_for_chaos(chaos):
    if chaos < 0.25:
        return 1
    if chaos < 0.65:
        return 2
    if chaos < 0.90:
        return 4
    return 5


def _randomize_tone_values(rng, values):
    primary = rng.choice(TONE_OPTIONS)
    values["TONE_PRESET_PRIMARY"] = primary
    if rng.random() < 0.5:
        values["TONE_PRESET_SECONDARY"] = "none"
        values["TONE_MIX"] = 0.0
        return
    choices = [tone for tone in TONE_OPTIONS if tone != primary]
    values["TONE_PRESET_SECONDARY"] = rng.choice(choices)
    values["TONE_MIX"] = rng.choice([0.25, 0.35, 0.5, 0.65])


def _choices_excluding(rng, pool, count, excluded=None, consistency=None):
    excluded = set(item for item in (excluded or []) if item and item != NONE_VALUE)
    choices = [item for item in pool if item != NONE_VALUE and item not in excluded]
    if not choices or count <= 0:
        return []
    if consistency:
        biased = _theme_matches(choices, consistency["theme"])
        if biased and rng.random() < consistency["strength"]:
            rng.shuffle(biased)
            result = biased[: min(count, len(biased))]
            if len(result) >= count:
                return result
            choices = [item for item in choices if item not in result]
            rng.shuffle(choices)
            return result + choices[: count - len(result)]
    rng.shuffle(choices)
    return choices[: min(count, len(choices))]


def _ollama_status(message):
    return f"Ollama: {message}"


def _call_ollama(base_prompt, values):
    if not _is_locked(values.get("OLLAMA_ENABLE")):
        return base_prompt, _ollama_status("OFF")
    model = str(values.get("OLLAMA_MODEL") or "").strip()
    if not model:
        return base_prompt, _ollama_status("Model not found: <empty>")
    url = str(values.get("OLLAMA_URL") or "http://127.0.0.1:11434").strip().rstrip("/")
    system_prompt = str(values.get("OLLAMA_SYSTEM_PROMPT") or DEFAULT_OLLAMA_SYSTEM_PROMPT).strip()
    try:
        temperature = float(values.get("OLLAMA_TEMPERATURE", 0.75))
    except Exception:
        temperature = 0.75
    try:
        timeout = max(1.0, float(values.get("OLLAMA_TIMEOUT", 30)))
    except Exception:
        timeout = 30

    payload = {
        "model": model,
        "prompt": f"{system_prompt}\n\n{base_prompt}" if system_prompt else base_prompt,
        "stream": False,
        "options": {"temperature": temperature},
    }
    request = urllib.request.Request(
        f"{url}/api/generate",
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(request, timeout=timeout) as response:
            data = json.loads(response.read().decode("utf-8"))
        if data.get("error"):
            error_text = str(data.get("error") or "")
            if "not found" in error_text.lower():
                return base_prompt, _ollama_status(f"Model not found: {model}")
            return base_prompt, _ollama_status("Error -> fallback used")
        expanded = str(data.get("response") or "").strip()
        if not expanded:
            return base_prompt, _ollama_status("Error -> fallback used")
        return expanded, _ollama_status("Connected")
    except TimeoutError:
        return base_prompt, _ollama_status("Timeout -> fallback used")
    except socket.timeout:
        return base_prompt, _ollama_status("Timeout -> fallback used")
    except urllib.error.HTTPError as error:
        if error.code in (404, 400):
            return base_prompt, _ollama_status(f"Model not found: {model}")
        return base_prompt, _ollama_status("Error -> fallback used")
    except urllib.error.URLError:
        return base_prompt, _ollama_status("Not reachable -> fallback used")
    except Exception:
        return base_prompt, _ollama_status("Error -> fallback used")


def send_compose_sync(unique_id, values, prompt, status=None, base_prompt=None):
    if PromptServer is None or not unique_id:
        return
    try:
        PromptServer.instance.send_sync(
            "prompt_deck_composer.composed",
            {
                "node_id": str(unique_id),
                "values": values,
                "prompt": prompt,
                "base_prompt": base_prompt if base_prompt is not None else prompt,
                "ollama_prompt": prompt if _is_locked(values.get("OLLAMA_ENABLE")) else "",
                "status": status or values.get("OLLAMA_STATUS", ""),
                "resolved_theme": values.get("resolved_theme", {}),
            },
        )
    except Exception:
        pass


class PromptDeckComposer:
    CATEGORY = "prompt/PromptDeckComposer"
    RETURN_TYPES = ("STRING",)
    RETURN_NAMES = ("prompt",)
    FUNCTION = "compose"

    @classmethod
    def INPUT_TYPES(cls):
        deck = load_deck()
        required = {
            "randomize": ("BOOLEAN", {"default": True}),
            "seed": ("INT", {"default": 0, "min": 0, "max": 0xFFFFFFFF}),
            "separator": ("STRING", {"default": ", "}),
            "PRIMARY_SUBJECT": (deck["PRIMARY_SUBJECT"], {"default": deck["PRIMARY_SUBJECT"][0]}),
            "SUBJECT_MODIFIER": (deck["SUBJECT_MODIFIER"], {"default": NONE_VALUE}),
            "SECONDARY_SUBJECT_1": (deck["SECONDARY_SUBJECT"], {"default": NONE_VALUE}),
            "SECONDARY_SUBJECT_2": (deck["SECONDARY_SUBJECT"], {"default": NONE_VALUE}),
            "RELATIONSHIP": (deck["RELATIONSHIP"], {"default": deck["RELATIONSHIP"][0]}),
            "ENVIRONMENT": (deck["ENVIRONMENT"], {"default": NONE_VALUE}),
            "LOCK_SCENE_STRUCTURE": ("BOOLEAN", {"default": False}),
            "LOCK_SUBJECT_MODIFIER": ("BOOLEAN", {"default": False}),
            "STYLE_RENDER": (deck["STYLE_RENDER"], {"default": NONE_VALUE}),
            "STYLE_LIGHTING": (deck["STYLE_LIGHTING"], {"default": NONE_VALUE}),
            "STYLE_COLOR": (deck["STYLE_COLOR"], {"default": NONE_VALUE}),
            "STYLE_TEXTURE": (deck["STYLE_TEXTURE"], {"default": NONE_VALUE}),
            "STYLE_MOOD": (deck["STYLE_MOOD"], {"default": NONE_VALUE}),
            "LOCK_STYLE_LAYERS": ("BOOLEAN", {"default": False}),
            "ARTIST_COUNT": (COUNT_OPTIONS, {"default": "2"}),
            "ARTIST_1": (deck["ARTIST"], {"default": NONE_VALUE}),
            "ARTIST_2": (deck["ARTIST"], {"default": NONE_VALUE}),
            "ARTIST_3": (deck["ARTIST"], {"default": NONE_VALUE}),
            "LOCK_ARTIST_MIX": ("BOOLEAN", {"default": False}),
            "STYLE_BLOCK_LIGHTING": (deck["STYLE_BLOCK_LIGHTING"], {"default": NONE_VALUE}),
            "STYLE_BLOCK_TEXTURE": (deck["STYLE_BLOCK_TEXTURE"], {"default": NONE_VALUE}),
            "STYLE_BLOCK_ATMOSPHERE": (deck["STYLE_BLOCK_ATMOSPHERE"], {"default": NONE_VALUE}),
            "STYLE_BLOCK_CAMERA": (deck["STYLE_BLOCK_CAMERA"], {"default": NONE_VALUE}),
            "STYLE_BLOCK_CONCEPT": (deck["STYLE_BLOCK_CONCEPT"], {"default": NONE_VALUE}),
            "LOCK_STYLE_BLOCKS": ("BOOLEAN", {"default": False}),
            "CHAOS_LEVEL": ("FLOAT", {"default": 0.5, "min": 0.0, "max": 1.0, "step": 0.05}),
            "USER_PROMPT": ("STRING", {"default": "", "multiline": True}),
            "LOCK_PRIMARY_SUBJECT": ("BOOLEAN", {"default": False}),
            "LOCK_SECONDARY_SUBJECT_1": ("BOOLEAN", {"default": False}),
            "LOCK_SECONDARY_SUBJECT_2": ("BOOLEAN", {"default": False}),
            "LOCK_RELATIONSHIP": ("BOOLEAN", {"default": False}),
            "LOCK_ENVIRONMENT": ("BOOLEAN", {"default": False}),
            "LOCK_STYLE_RENDER": ("BOOLEAN", {"default": False}),
            "LOCK_STYLE_LIGHTING": ("BOOLEAN", {"default": False}),
            "LOCK_STYLE_COLOR": ("BOOLEAN", {"default": False}),
            "LOCK_STYLE_TEXTURE": ("BOOLEAN", {"default": False}),
            "LOCK_STYLE_MOOD": ("BOOLEAN", {"default": False}),
            "LOCK_ARTIST_COUNT": ("BOOLEAN", {"default": False}),
            "LOCK_ARTIST_1": ("BOOLEAN", {"default": False}),
            "LOCK_ARTIST_2": ("BOOLEAN", {"default": False}),
            "LOCK_ARTIST_3": ("BOOLEAN", {"default": False}),
            "LOCK_STYLE_BLOCK_LIGHTING": ("BOOLEAN", {"default": False}),
            "LOCK_STYLE_BLOCK_TEXTURE": ("BOOLEAN", {"default": False}),
            "LOCK_STYLE_BLOCK_ATMOSPHERE": ("BOOLEAN", {"default": False}),
            "LOCK_STYLE_BLOCK_CAMERA": ("BOOLEAN", {"default": False}),
            "LOCK_STYLE_BLOCK_CONCEPT": ("BOOLEAN", {"default": False}),
            "STRUCTURED_MODE": ("BOOLEAN", {"default": True}),
            "TONE_PRESET": (TONE_OPTIONS, {"default": "neutral"}),
            "TONE_PRESET_PRIMARY": (TONE_OPTIONS, {"default": "neutral"}),
            "TONE_PRESET_SECONDARY": (SECONDARY_TONE_OPTIONS, {"default": "none"}),
            "TONE_MIX": ("FLOAT", {"default": 0.0, "min": 0.0, "max": 1.0, "step": 0.05}),
            "RANDOM_TONE": ("BOOLEAN", {"default": False}),
            "LOCK_TONE": ("BOOLEAN", {"default": False}),
            "CONSISTENCY_MODE": ("BOOLEAN", {"default": False}),
            "CONSISTENCY_THEME": (CONSISTENCY_THEMES, {"default": "any"}),
            "CONSISTENCY_STRENGTH": ("FLOAT", {"default": 0.65, "min": 0.0, "max": 1.0, "step": 0.05}),
            "OLLAMA_ENABLE": ("BOOLEAN", {"default": False}),
            "OLLAMA_MODEL": ("STRING", {"default": ""}),
            "OLLAMA_TEMPERATURE": ("FLOAT", {"default": 0.75, "min": 0.0, "max": 2.0, "step": 0.05}),
            "OLLAMA_STATUS": ("STRING", {"default": "Ollama: OFF"}),
            "OLLAMA_SYSTEM_PROMPT": ("STRING", {"default": DEFAULT_OLLAMA_SYSTEM_PROMPT, "multiline": True}),
            "OLLAMA_URL": ("STRING", {"default": "http://127.0.0.1:11434"}),
            "OLLAMA_TIMEOUT": ("INT", {"default": 30, "min": 1, "max": 300}),
            "RANDOM_CHAOS_LEVEL": ("BOOLEAN", {"default": False}),
            "RANDOM_CONSISTENCY_STRENGTH": ("BOOLEAN", {"default": False}),
            "CONSISTENCY_WORLD_THEME": (CONSISTENCY_WORLD_THEMES, {"default": "any"}),
            "CONSISTENCY_CULTURE_THEME": (CONSISTENCY_CULTURE_THEMES, {"default": "any"}),
            "CONSISTENCY_MATERIAL_THEME": (CONSISTENCY_MATERIAL_THEMES, {"default": "any"}),
            "CONSISTENCY_CONCEPT_THEME": (CONSISTENCY_CONCEPT_THEMES, {"default": "any"}),
            "CONSISTENCY_WORLD_WEIGHT": ("FLOAT", {"default": 0.5, "min": 0.0, "max": 1.0, "step": 0.05}),
            "CONSISTENCY_CULTURE_WEIGHT": ("FLOAT", {"default": 0.5, "min": 0.0, "max": 1.0, "step": 0.05}),
            "CONSISTENCY_MATERIAL_WEIGHT": ("FLOAT", {"default": 0.5, "min": 0.0, "max": 1.0, "step": 0.05}),
            "CONSISTENCY_CONCEPT_WEIGHT": ("FLOAT", {"default": 0.5, "min": 0.0, "max": 1.0, "step": 0.05}),
            "world_weight_random": ("BOOLEAN", {"default": False}),
            "culture_weight_random": ("BOOLEAN", {"default": False}),
            "material_weight_random": ("BOOLEAN", {"default": False}),
            "concept_weight_random": ("BOOLEAN", {"default": False}),
        }
        return {"required": required, "hidden": {"unique_id": "UNIQUE_ID"}}

    @classmethod
    def IS_CHANGED(cls, **kwargs):
        if kwargs.get("randomize") or kwargs.get("RANDOM_TONE") or any(kwargs.get(key) for key in CONSISTENCY_WEIGHT_RANDOM_KEYS.values()):
            return time.time()
        return json.dumps(kwargs, sort_keys=True)

    def compose(self, randomize, seed, separator, unique_id=None, **kwargs):
        deck = load_deck()
        rng = random.Random(seed if seed else time.time_ns())
        values = dict(kwargs)
        user_prompt = str(values.get("USER_PROMPT", ""))
        chaos = random.random() if _is_locked(kwargs.get("RANDOM_CHAOS_LEVEL")) else _clamp_chaos(kwargs.get("CHAOS_LEVEL", 0.5))
        if _is_locked(kwargs.get("RANDOM_CHAOS_LEVEL")):
            values["CHAOS_LEVEL"] = chaos
        if _is_locked(kwargs.get("RANDOM_CONSISTENCY_STRENGTH")):
            values["CONSISTENCY_STRENGTH"] = random.random()
        for category, random_key in CONSISTENCY_WEIGHT_RANDOM_KEYS.items():
            if _is_locked(kwargs.get(random_key)):
                weight_key = CONSISTENCY_WEIGHT_KEYS[category]
                values[weight_key] = 0.1 + random.random() * 0.9
        if not values.get("TONE_PRESET_PRIMARY") and values.get("TONE_PRESET"):
            values["TONE_PRESET_PRIMARY"] = values.get("TONE_PRESET")
        consistency = _consistency_context(values, rng)

        if randomize and not _is_locked(kwargs.get("LOCK_SCENE_STRUCTURE")):
            secondary_count = _secondary_count_for_chaos(rng, chaos)
            secondary_keys = ["SECONDARY_SUBJECT_1", "SECONDARY_SUBJECT_2"]
            locked_secondaries = [
                _value(values.get(key))
                for key in secondary_keys
                if _field_locked(values, key) and _value(values.get(key))
            ]
            free_secondary_keys = [key for key in secondary_keys if not _field_locked(values, key)]
            desired_free_count = max(0, secondary_count - len(locked_secondaries))
            secondaries = _choices_excluding(
                rng,
                deck["SECONDARY_SUBJECT"],
                min(desired_free_count, len(free_secondary_keys)),
                locked_secondaries,
                consistency,
            )
            if not _field_locked(values, "PRIMARY_SUBJECT"):
                values["PRIMARY_SUBJECT"] = _pick(rng, deck["PRIMARY_SUBJECT"], consistency=consistency)
            for index, key in enumerate(free_secondary_keys):
                values[key] = secondaries[index] if index < len(secondaries) else NONE_VALUE
            environment_chance = 0.35 + chaos * 0.55
            if not _field_locked(values, "ENVIRONMENT"):
                values["ENVIRONMENT"] = _chance_pick(rng, deck["ENVIRONMENT"], environment_chance, consistency)
            if not _field_locked(values, "RELATIONSHIP"):
                values["RELATIONSHIP"] = _pick(rng, deck["RELATIONSHIP"], consistency=consistency)

        if randomize and not _is_locked(kwargs.get("LOCK_SUBJECT_MODIFIER")):
            modifier_chance = 0.15 + chaos * 0.75
            values["SUBJECT_MODIFIER"] = _chance_pick(rng, deck["SUBJECT_MODIFIER"], modifier_chance, consistency)

        if randomize and not _is_locked(kwargs.get("LOCK_STYLE_LAYERS")):
            for key in STYLE_KEYS:
                if _field_locked(values, key):
                    continue
                chance = 0.65 + chaos * 0.3 if key == "STYLE_RENDER" else 0.45 + chaos * 0.45
                values[key] = _chance_pick(rng, deck[key], chance, consistency)

        if randomize and not _is_locked(kwargs.get("LOCK_ARTIST_MIX")):
            artist_count = _coerce_count(values.get("ARTIST_COUNT"), 3) if _field_locked(values, "ARTIST_COUNT") else _artist_count_for_chaos(rng, chaos)
            if not _field_locked(values, "ARTIST_COUNT"):
                values["ARTIST_COUNT"] = str(artist_count)
            locked_artists = [
                _value(values.get(key))
                for key in ARTIST_KEYS
                if _field_locked(values, key) and _value(values.get(key))
            ]
            free_artist_keys = [key for key in ARTIST_KEYS if not _field_locked(values, key)]
            artists_needed = max(0, artist_count - len(locked_artists))
            artists = _choices_excluding(rng, deck["ARTIST"], min(artists_needed, len(free_artist_keys)), locked_artists, consistency)
            for index, key in enumerate(free_artist_keys):
                values[key] = artists[index] if index < len(artists) else NONE_VALUE

        if randomize and not _is_locked(kwargs.get("LOCK_STYLE_BLOCKS")):
            block_count = _block_count_for_chaos(rng, chaos)
            block_limit = min(_block_limit_for_chaos(chaos), len(STYLE_BLOCK_KEYS))
            locked_active = [
                key
                for key in STYLE_BLOCK_KEYS
                if _field_locked(values, key) and _value(values.get(key))
            ]
            free_block_keys = [key for key in STYLE_BLOCK_KEYS if not _field_locked(values, key)]
            desired_total = min(block_count, block_limit)
            open_slots = max(0, desired_total - len(locked_active))
            active_keys = _unique_choices(rng, free_block_keys, min(block_count, open_slots))
            for key in STYLE_BLOCK_KEYS:
                if _field_locked(values, key):
                    continue
                values[key] = _pick(rng, deck[key], consistency=consistency) if key in active_keys else NONE_VALUE

        if _is_locked(values.get("RANDOM_TONE")):
            _randomize_tone_values(rng, values)

        if _is_locked(kwargs.get("STRUCTURED_MODE", True)):
            base_prompt = _structured_prompt(
                values,
                chaos,
                str(values.get("TONE_PRESET_PRIMARY") or values.get("TONE_PRESET") or "neutral"),
                str(values.get("TONE_PRESET_SECONDARY", "none")),
                values.get("TONE_MIX", 0.0),
            )
        else:
            deck_prompt = _compose_prompt(values, separator)
            base_prompt = _join_prompt_parts([user_prompt, deck_prompt], separator)

        prompt, ollama_status = _call_ollama(base_prompt, values)
        values["OLLAMA_STATUS"] = ollama_status
        send_compose_sync(unique_id, values, prompt, ollama_status, base_prompt)

        return (prompt,)


NODE_CLASS_MAPPINGS = {"PromptDeckComposer": PromptDeckComposer}
NODE_DISPLAY_NAME_MAPPINGS = {"PromptDeckComposer": "PromptDeckComposer"}


def _register_routes():
    if PromptServer is None or web is None:
        return

    if getattr(PromptServer.instance, "_prompt_deck_composer_recent_routes_registered", False):
        return
    setattr(PromptServer.instance, "_prompt_deck_composer_recent_routes_registered", True)
    routes = PromptServer.instance.routes

    @routes.get("/prompt_deck_composer/recent_results")
    async def get_recent_results(request):
        return web.json_response({"ok": True, "results": load_recent_results()})

    @routes.get("/prompt_deck_composer/thumbnail")
    async def get_thumbnail(request):
        try:
            thumb_path = thumbnail_response(request.query.get("filename", ""))
            return web.FileResponse(thumb_path)
        except Exception:
            return web.Response(status=404, text="thumbnail not found")

    @routes.post("/prompt_deck_composer/recent_results")
    async def post_recent_results(request):
        try:
            body = await request.json()
            if not isinstance(body, dict):
                return web.json_response({"ok": False, "error": "body must be an object"}, status=400)
            action = body.get("action")
            results = load_recent_results()

            if action == "save":
                raw_result = body.get("result") or {}
                result = sanitize_recent_result(raw_result)
                if result is None:
                    return web.json_response({"ok": False, "error": "result must be an object"}, status=400)
                source_image = body.get("source_image")
                if not source_image and isinstance(raw_result, dict):
                    source_image = raw_result.get("source_image")
                    if not source_image and isinstance(raw_result.get("image"), dict):
                        source_image = raw_result["image"].get("source")
                run_started_at = raw_result.get("run_started_at") if isinstance(raw_result, dict) else None
                if not source_image and run_started_at is not None:
                    source_image = find_latest_image_source(
                        prefer_output=False,
                        min_mtime=run_started_at,
                    )
                result["image"] = copy_result_thumbnail(source_image) if source_image else _settings_only_image()
                result.pop("source_image", None)
                results = save_recent_results([result, *results])
                cleanup_orphan_thumbnails(results)
            elif action == "delete":
                result_id = str(body.get("id", ""))
                deleted = [item for item in results if str(item.get("id", "")) == result_id]
                remaining = [item for item in results if str(item.get("id", "")) != result_id]
                for item in deleted:
                    delete_thumbnail_if_unreferenced(_thumbnail_filename(item), remaining)
                results = save_recent_results(remaining)
            elif action == "clear":
                clear_thumbnail_files()
                results = save_recent_results([])
            elif action == "replace":
                old_results = results
                results = save_recent_results(body.get("results", []))
                for item in old_results:
                    delete_thumbnail_if_unreferenced(_thumbnail_filename(item), results)
                cleanup_orphan_thumbnails(results)
            else:
                return web.json_response({"ok": False, "error": "unknown action"}, status=400)

            return web.json_response({"ok": True, "results": results})
        except Exception as error:
            return web.json_response({"ok": False, "error": str(error)}, status=500)


_register_routes()
