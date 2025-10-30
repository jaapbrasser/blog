+++
title = "Papermod Customized"
date = "2025-10-30"
draft = false
tags = ["hugo", "papermod", "theming", "customization"]
summary = "How I took a plain PaperMod install, added a synthwave look, and deployed it."
+++
## Why I customized PaperMod

The stock PaperMod theme looks fine, but it also looks like every other new Hugo blog. Neutral colors, polite gray cards, which are fine but I wanted something that felt closer to a synthwave terminal than a generic template. Neon accents, dark background, high-contrast surfaces that feel like they came off a late-night shell session. Similar to what the [SynthWave '84](https://marketplace.visualstudio.com/items?itemName=RobbOwen.synthwave-vscode) theme for VS Code

There was one hard constraint. The site still had to stay light. No React front end, no heavy JS, nothing that makes GitHub Pages annoying. I recently put together a Hugo replacement in React for the [Dutch PowerShell User Group](https://dupsug.com). So the goal became: dark-first blog, neon highlight color, readable typography, minimal weight, be clean but have the option to spice things up with the Synthwave aesthetic.

## Baseline setup

I started from a clean Hugo setup. Hugo installed, new site created, nothing fancy. I pulled in the PaperMod theme and wired it up in the config so the site would actually render. Out of the box it built without errors, the default layout loaded, and a single test post showed on the home page.

That baseline was important. I wanted a working site before I started breaking the visuals. So at this point I had: fresh Hugo project, PaperMod active, default config in place, and one sample post rendering end to end. Only after that did I start cutting into the theme.