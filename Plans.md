# Study Timer feature specification

## Session Timer

### Track:
- Pauses in between session
- Session start and end timestamp
- Session duration
Ability to add links during the on-going session

### TimerModes:
1. StopWatch (count up)
2. Timer (count down)
---
## End-Of-Session Dialog:
Shown at the end of a session. Allow user to
- Enter session title, description, resources used
- Select the tags or insert a new one
- Optionally change the session date
---
## Settings:
- Add, update or delete tags
- Change the default timermode
---
## Heatmap:
- Github-like heatmap of sessions of last 365 day
- See the details of a day by clicking on its cell
---
## Session List:
- List the recent sessions

### Filters 
- Time 
- Tags
- Duration
### Sort
- Session length
- Recency 

- Update & delete session info
---
## Failure Resilience:
- Periodically save the session info in local storage (5 minutes)
---
## Background music:
- Lofi beats
- Ambient music  
- Rain, thunder sounds
---
## Session Analysis Dashboard:

### Aggregrate Session Statistics
- Average study time per day / per week
- Most and least study time periods 
- Session composition based on tags (pie chart)
- Number of sessions
- Total study duration
- Total pause duration
- Line graph of the (relevant) session info through selected time range

### Detailed Session View

**Timeline of sessions**:  Each session rendered as a rectangle with its duration and timestamp
    
Inspired by: [Studo](Studo.space) 




