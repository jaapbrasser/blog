---
title: "Run your PowerShell scripts with -WhatIf and -Confirm "
date: 2025-11-16
draft: false
tags: ["PowerShell", "WhatIf", "Confirm", "safety", "scripting", "best-practices", "SupportShouldProcess"]
summary: "Use -WhatIf and -Confirm to make destructive PowerShell commands safer."
---


Most of that pain comes from one missing feature: a built-in way to see what a script would do before it does it. PowerShell already has that with `-WhatIf` and `-Confirm`. In this post we’ll look at how they behave on built-in cmdlets and how to see which commands support them. By building this understanding we will 

To discover which commands support the `-WhatIf` and `-Confirm` switch parameters, we will use the `Get-Command` cmdlet in combination with the `-ParameterName` parameter.

```powershell
PS Jaap> Get-Command -ParameterName Confirm | Measure-Object

Count             : 61
Average           :
Sum               :
Maximum           :
Minimum           :
StandardDeviation :
Property          :
```

These are powerful tools, but you still need to check whether a cmdlet or function actually supports them before you trust that `-Confirm` parameter is supported and behaves as you expect. Two good example of this are `Stop-Process` and `Remove-Item`, both potentially destructive cmdlets.

```powershell
PS Jaap> Get-Process 'notepad' | Stop-Process -WhatIf

What if: Performing the operation "Stop-Process" on target "Explorer.exe".
What if: Performing the operation "Stop-Process" on target "winlogon".
...
```

As you can see here, we're piping `Get-Process` into `Stop-Process` and if it was not for the `-WhatIf` switch parameter, it would have attempted to stop all processes. This is especially useful when testing and validating your assumptions. And here is the `Remove-Item` example:

```powershell
PS Jaap> Remove-Item explorer.txt -Confirm

Confirm
Are you sure you want to perform this action?
Performing the operation "Remove File" on target "explorer.txt".
[Y] Yes  [A] Yes to All  [N] No  [L] No to All  [S] Suspend  [?] Help (default is "Y"):
```

That sums up some of the default behaviour, and how you can discover which Cmdlets and Functions on your system support these parameters. In the next part of this series, we’ll go a step further and wire `-WhatIf` and `-Confirm` into our own scripts, functions and modules. If you have any further questions or feedback drop me a message and I'll be happy to get back to you.

- Jaap