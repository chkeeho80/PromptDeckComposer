# PromptDeckComposer

PromptDeckComposer is a separate ComfyUI custom node for structured prompt composition. It is not part of PromptDeckMixer and does not reuse PromptDeckMixer code.

## Purpose

PromptDeckComposer builds richer natural-language prompts by combining:

- scene structure
- subject modifiers
- subject relationships
- layered style roles
- artist mixes
- categorized long style text blocks

The output is a normal ComfyUI `STRING` suitable for Ollama prompt-generation workflows.

## Frontend UI

PromptDeckComposer includes a lightweight custom frontend UI:

- `AUTO COMPOSE ON/OFF` mode button backed by the real `randomize` widget.
- `CHAOS LEVEL` compact slider backed by the real `CHAOS_LEVEL` widget.
- Sectioned compact rows for Basic, Scene, Style Layers, Artist Mix, and Style Blocks.
- `LOCK` / `FREE` buttons backed by the real lock widgets.
- A read-only Final Prompt Preview.
- A top-level `USER_PROMPT` text row for fixed anchor text.

The custom UI reads and writes real backend widgets by exact name. Hidden backend widgets remain serialized so workflows keep saving correctly.

## Install

Copy this folder into:

```text
ComfyUI/custom_nodes/PromptDeckComposer
```

Restart ComfyUI. The node appears under:

```text
prompt/PromptDeckComposer -> PromptDeckComposer
```

## Inputs

Scene structure:

- `PRIMARY_SUBJECT`
- `SUBJECT_MODIFIER`
- `SECONDARY_SUBJECT_1`
- `SECONDARY_SUBJECT_2`
- `RELATIONSHIP`
- `ENVIRONMENT`
- `LOCK_SCENE_STRUCTURE`
- `LOCK_SUBJECT_MODIFIER`

Style layers:

- `STYLE_LIGHTING`
- `STYLE_COLOR`
- `STYLE_TEXTURE`
- `STYLE_MOOD`
- `STYLE_RENDER`
- `LOCK_STYLE_LAYERS`

Artist mix:

- `ARTIST_COUNT`
- `ARTIST_1`
- `ARTIST_2`
- `ARTIST_3`
- `LOCK_ARTIST_MIX`

Style blocks:

- `STYLE_BLOCK_LIGHTING`
- `STYLE_BLOCK_TEXTURE`
- `STYLE_BLOCK_ATMOSPHERE`
- `STYLE_BLOCK_CAMERA`
- `STYLE_BLOCK_CONCEPT`
- `LOCK_STYLE_BLOCKS`

Random controls:

- `randomize`
- `seed`
- `separator`
- `CHAOS_LEVEL`
- `USER_PROMPT`

## Behavior

When `randomize` is enabled, unlocked systems are randomized during execution.

Limits:

- secondary subjects: 0 to 2
- artists: 1 to 3
- randomized categorized style blocks: 0 to 2

Locked systems keep their manual values.

`USER_PROMPT` is prepended to the generated Composer prompt when present. It is not randomized and is not affected by locks.

`CHAOS_LEVEL` controls randomization intensity:

- `0.00` to `0.24`: calm, minimal, stable
- `0.25` to `0.64`: balanced
- `0.65` to `1.00`: wild, richer, more expressive

It affects future randomization only. Manual dropdown values are still used as-is when `randomize` is off.

`SUBJECT_MODIFIER` modifies only the primary subject. It is for material, aura, transformation, construction, or symbolic state, such as `made of herbs`, `formed from smoke and wet ink`, or `partially fused with biomechanical parts`.

Categorized style block randomization picks up to two active block categories from lighting, texture, atmosphere, camera, and concept. Non-active block categories are set to `<none>` during randomization.

Prompt example:

```text
young woman made of herbs standing with mechanical raven in rainy neon alley, under neon rim lighting, in teal and amber, with soft film grain, dreamlike and quiet, cinematic concept art, inspired by Caravaggio and Gustav Klimt. Organic warmth fights against synthetic light, emphasizing the boundary between human, machine, and myth. A red halation blooms around the brightest light sources, giving the image a vintage optical glow.
```

## Editing Pools

Edit:

```text
composer_deck.json
```

Keep the top-level pool names unchanged.
