UPDATE session
SET duration = (ended_at - started_at) / 1000;
