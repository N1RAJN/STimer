UPDATE session 
SET pause_duration = COALESCE(
    (SELECT SUM(duration) FROM pauses WHERE pauses.session_id = session.session_id)
    ,0
);

UPDATE session
SET duration = ((ended_at - started_at) / 1000) - pause_duration;
    
