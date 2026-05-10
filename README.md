# STimer
---
A generic study session tracker.
Heavly Inspired by: [Studo](https://Studo.space)

---
## Features
- Session tracker
- Heatmap
- Backup system
- Tags

---
## Things left to do
- Integrated background music player
- Session Statistics

---
## Dependencies
- sqlite 3.45.1
- go 1.25.0

---
## Usage
Build with go and run the executable.
```console
go build
./STimer
```

---
## Why not just Studo?
The following features about studo is based on my limited knowledge.
- I'm broke, so I have to use the free version which doesn't provide statistics (Not even the session duration).
- Studo calculates the session duration as the duration between start and end of the session, disregarding the pauses in between. So pausing the session doesn't really mean anything besides the clock being paused.
- Having a local site is more convinient
- My laptop is potato and crashes time to time. And there is no backup system in Studo.

---
## What STimer does not have
- Good looking UI. I am not good at UI design. Mostly copied the looks of Studo.
- An online webpage. Since it is supposed to be local.
