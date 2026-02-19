+++
title = "PwshWeb: A Python-Inspired HTTP Server for PowerShell"
date = "2025-10-30"
draft = false
tags = ["powershell", "webserver", "http"]
summary = "PwshWeb: a lightweight, cross-platform PowerShell module"
+++
# PwshWeb: A Python-Inspired HTTP Server for PowerShell

If you've ever done local web development, you've probably typed `python3 -m http.server` at least once. It's one of Python's most quietly beloved features, zero config, instant file serving, done. But what if you're living in a PowerShell world, in my case what if you have to Google what the Python command is? What if you want that same frictionless experience without switching runtimes?

Enter **PwshWeb**: a lightweight, cross-platform PowerShell module that brings the spirit of Python's HTTP server to the PowerShell ecosystem. Written by me, it's designed for exactly the same ad-hoc scenarios, serve a directory, preview a static site and work more efficiently.

---

## Installation & Quick Start

Getting started is exactly as easy as you'd hope:

```powershell
Install-Module PwshWeb
```

Once installed, spin up a server in your current directory with:

```powershell
Start-PwshWeb
```

By default, this serves the current directory on port `8000`. Open your browser to `http://localhost:8000/` and you'll see a clean, auto-generated directory listing. Press `Ctrl+C` to stop.

**Requirements:** PowerShell 5.1+ on Windows, or PowerShell 7+ for cross-platform use on macOS and Linux.

---

## Feature Walkthrough

### Choosing Your Port and Directory

The two most common parameters are `-Port` and `-Path`. Both are positional, so you can be terse:

```powershell
# Serve on a custom port
Start-PwshWeb -Port 8080

# Serve a specific directory on a custom port
Start-PwshWeb -Port 8080 -Path C:\Website

# Positional shorthand
Start-PwshWeb 8080 C:\Website
```

### Running as a Background Job

One of the most useful features for automation or longer-running workflows is the `-AsJob` switch. Instead of blocking your terminal session, the server runs as a PowerShell background job:

```powershell
$server = Start-PwshWeb -Port 9000 -AsJob
```

The returned `PwshWeb.ServerJob` object gives you the port, path, URI, start time, and — crucially — a reference to the underlying PowerShell `Job` object so you can manage it:

```powershell
# Check what's running
$server.Uri       # e.g. http://localhost:9000/
$server.State     # Running

# Stop when done
Stop-Job $server.Job
Remove-Job $server.Job
```

### Verbose Logging

Add `-Verbose` to get per-request logging in the console — handy for debugging what your browser or test runner is actually requesting.

### WhatIf and Confirm

PwshWeb supports PowerShell's standard `-WhatIf` and `-Confirm` switches, so it fits naturally into scripted workflows:

```powershell
# Preview without starting
Start-PwshWeb -Port 8080 -WhatIf
```

---

## Parameter Reference

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `-Port` | `Int32` | `8000` | Port to listen on (1–65535) |
| `-Path` | `String` | Current directory | Directory to serve (must exist) |
| `-AsJob` | `Switch` | — | Run server as a background job |
| `-WhatIf` | `Switch` | — | Preview action without executing |
| `-Confirm` | `Switch` | — | Prompt for confirmation before starting |
| `-Verbose` | Common | — | Enable per-request console logging |

---

## Directory Listings and File Serving

If a requested directory doesn't contain an `index.html` or `index.htm`, PwshWeb auto-generates a styled HTML directory listing. It's not just a raw file dump — directories are listed first (sorted), then files, each with a clickable link, human-readable file size (bytes/KB/MB/GB), and a last-modified timestamp. A `..` parent directory link makes navigation intuitive.

When an `index.html` or `index.htm` is present, it's served automatically — exactly the behavior you'd expect.

### MIME Type Support

PwshWeb handles over 20 MIME types out of the box:

- **Text/Web:** `.html`, `.htm`, `.css`, `.js`, `.json`, `.xml`, `.txt`, `.md`
- **Images:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.svg`, `.ico`
- **Media:** `.mp3`, `.mp4`, `.webm`
- **Documents:** `.pdf`, `.zip`
- **Fallback:** `application/octet-stream` for anything unrecognized

---

## Under the Hood

### System.Net.HttpListener

PwshWeb uses .NET's built-in `System.Net.HttpListener` to bind to `http://localhost:{Port}/`. This is a robust, production-tested HTTP listener that ships with every .NET runtime — no external HTTP libraries required.

The server's main loop uses `GetContextAsync()` for non-blocking context retrieval, polling every 100ms (with a 10ms sleep) to remain responsive to cancellation. This keeps CPU usage low while still being able to react promptly to `Ctrl+C`.

### The Job Isolation Problem (And How It's Solved)

Here's where it gets interesting. When you use `-AsJob`, the server code runs in a **separate PowerShell runspace** — an isolated environment that doesn't inherit functions defined in your session. This is a common gotcha when working with PowerShell background jobs.

PwshWeb solves this elegantly: the helper functions (`Get-DirectoryListing`, `Format-FileSize`, `Get-ContentType`) are **serialized as strings** and injected into the job's scriptblock via `Invoke-Expression` at runtime. The job literally carries its own function definitions with it, bootstrapping everything it needs inside the isolated runspace. It's a clean pattern worth knowing if you're building your own job-based tools.

### Runspace IDs for Log Correlation

Each server instance generates a unique GUID (`RunspaceId`) at startup. This gets included in log output, which is useful if you're running multiple server instances and need to correlate log entries to a specific server.

---

## Practical Use Cases

**Local static site preview.** Working on a Jekyll, Hugo, or plain HTML site? Skip the `file://` protocol quirks (broken relative paths, CORS blocks) and serve the output directory directly. It takes one command.

**Sharing files on a LAN.** Need to transfer a file to another machine without setting up a shared drive or SCP? Start PwshWeb, share the URL, done. Works across any device with a browser on the same network.

**Testing web apps.** Some JavaScript features (like service workers or certain `fetch` behaviors) require an HTTP context. PwshWeb gives you that context instantly, without spinning up a full dev server.

**CI/CD artifact serving.** Running integration tests that need to fetch static assets over HTTP? Start PwshWeb as a background job, run your tests, then stop it — all in the same pipeline script.

---

## How It Compares to Python's `http.server`

| Feature | `python3 -m http.server` | `Start-PwshWeb` |
|---------|--------------------------|-----------------|
| Zero-config startup | ✅ | ✅ |
| Custom port | ✅ (`--port`) | ✅ (`-Port`) |
| Custom directory | ✅ (argument) | ✅ (`-Path`) |
| Background execution | ❌ (need `&` + disown) | ✅ (`-AsJob`) |
| Structured return object | ❌ | ✅ (`PwshWeb.ServerJob`) |
| WhatIf / Confirm | ❌ | ✅ |
| MIME type support | ✅ | ✅ (20+ types) |
| Directory listing | ✅ | ✅ (styled HTML) |
| Requires separate runtime | Python 3 | PowerShell 5.1+ |

The headline difference is job management. Python's HTTP server blocks the terminal, and backgrounding it (`python3 -m http.server &`) leaves you with a process to hunt down and kill manually. PwshWeb's `-AsJob` gives you a proper handle to the server — start it, use it, stop it cleanly, all from the same script.

---

## Conclusion

PwshWeb embodies a clear philosophy: do one thing, do it predictably, and get out of the way. I built it myself as it allowed me to extend as needed, but the core will always be, minimal footprint and ease of use.

The module is MIT-licensed, tested with a Pester suite, and the CI/CD pipeline runs on GitHub Actions. If you want to contribute, the codebase is approachable and the architecture (especially the serialized-function trick for job isolation) offers some genuinely interesting patterns to explore.

Give it a try the next time you find yourself reaching for Python just to serve a directory:

```powershell
Install-Module PwshWeb
Start-PwshWeb
```

Your browser is one `localhost:8000` away.
