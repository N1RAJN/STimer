package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	_ "modernc.org/sqlite"
)

type sessionInfo struct {
	StartedAt       string `json:"startedAt"`
	EndedAt         string `json:"endedAt"`
	Duration        uint16 `json:"duration"`
	PausesInSession []struct {
		StartedAt string `json:"startedAt"`
		EndedAt   string `json:"endedAt"`
	} `json:"pausesInSession"`
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Tags        []string `json:"tags"`
	Resources   string   `json:"resources"`
}
type pauseObj struct {
	StartedAtUnixTime int64
	EndedAtUnixTime   int64
}

var db *sql.DB

func main() {
	var err error
	db, err = sql.Open("sqlite", "file:data.db")
	if err != nil {
		log.Fatal(err)
	}

	createTable()

	fs := http.FileServer(http.Dir("./src"))
	http.Handle("/", fs)
	http.HandleFunc("/api/storeSession", storeSessionInfo)
	http.HandleFunc("/api/getTags", getTagsList)

	fmt.Println("Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func createTable() {
	sessionQuery := `
	CREATE TABLE IF NOT EXISTS session(
	session_id INTEGER PRIMARY KEY AUTOINCREMENT,
	started_at INTEGER,
	ended_at INTEGER,
	duration INTEGER,
	title TEXT,
	description TEXT,
	resources TEXT 
	)
	`
	pausesQuery := `
	CREATE TABLE IF NOT EXISTS pauses(
	pause_id INTEGER PRIMARY KEY AUTOINCREMENT,
	session_id INTEGER,
	started_at INTEGER,
	ended_at INTEGER,
	FOREIGN KEY(session_id) REFERENCES session(session_id)
	)
	`
	tagsQuery := `
	CREATE TABLE IF NOT EXISTS tags(
	tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
	tag_name TEXT UNIQUE
	)
	`
	sessionTagsQuery := `
	CREATE TABLE IF NOT EXISTS session_tags(
	session_id INTEGER,
	tag_id INTEGER,
	FOREIGN KEY (session_id) REFERENCES session(session_id),
	FOREIGN KEY (tag_id) REFERENCES tags(tag_id),
	UNIQUE (session_id, tag_id)
	)
	`
	var err error
	queries := []string{sessionQuery, pausesQuery, tagsQuery, sessionTagsQuery}
	for _, query := range queries {
		_, err = db.Exec(query)
		if err != nil {
			log.Fatal(err)
		}
	}
}

func storeSessionInfo(w http.ResponseWriter, r *http.Request) {
	var err error
	var sessionData sessionInfo
	var requestBody []byte
	var startedTime, endedTime, pauseStartedTime, pauseEndedTime time.Time

	requestBody, err = io.ReadAll(r.Body)
	if err == nil {
		err = json.Unmarshal(requestBody, &sessionData)
	}

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		io.WriteString(w, "Invalid request body.")
		return
	}
	// Parse the ISO 8601 timestamp
	startedTime, err = time.Parse(time.RFC3339Nano, sessionData.StartedAt)
	if err == nil {
		endedTime, err = time.Parse(time.RFC3339Nano, sessionData.EndedAt)
	}
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		io.WriteString(w, "Invalid Time Format.")
		return
	}
	startedUnixTime := startedTime.Unix()
	endedUnixTime := endedTime.Unix()
	duration := sessionData.Duration
	title := sessionData.Title
	description := sessionData.Description
	resources := sessionData.Resources

	tx, err := db.Begin()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		io.WriteString(w, "Query failed")
		return
	}

	sessionQuery := `
	INSERT INTO session(started_at, ended_at, duration, title, description, resources)
	Values(?, ?, ?, ?, ?, ?)
	`
	sessionQueryResult, queryErr := tx.Exec(sessionQuery, startedUnixTime, endedUnixTime, duration, title, description, resources)
	if queryErr != nil {
		tx.Rollback()
		w.WriteHeader(http.StatusInternalServerError)
		io.WriteString(w, "Query failed")
		return
	}
	var pausesInSession []pauseObj
	for _, pause := range sessionData.PausesInSession {
		pauseStartedTime, err = time.Parse(time.RFC3339Nano, pause.StartedAt)
		if err == nil {
			pauseEndedTime, err = time.Parse(time.RFC3339Nano, pause.EndedAt)
		}
		if err != nil {
			tx.Rollback()
			w.WriteHeader(http.StatusBadRequest)
			io.WriteString(w, "Invalid Time Format.")
			return
		}
		pausesInSession = append(pausesInSession, pauseObj{StartedAtUnixTime: pauseStartedTime.Unix(), EndedAtUnixTime: pauseEndedTime.Unix()})
	}

	pausesQuery := `
	INSERT INTO pauses(session_id, started_at, ended_at) VALUES(?, ?, ?)
	`
	sessionId, err := sessionQueryResult.LastInsertId()
	if err != nil {
		tx.Rollback()
		w.WriteHeader(http.StatusBadRequest)
		io.WriteString(w, "Query failed")
		return
	}
	for _, pause := range pausesInSession {
		_, err = tx.Exec(pausesQuery, sessionId, pause.StartedAtUnixTime, pause.EndedAtUnixTime)
		if err != nil {
			tx.Rollback()
			w.WriteHeader(http.StatusInternalServerError)
			io.WriteString(w, "Query failed")
			return
		}
	}

	getTagsQuery := `
	SELECT tag_id FROM tags WHERE tag_name=?
	`
	insertTagsQuery := `
	INSERT OR IGNORE INTO tags(tag_name) VALUES(?)
	`
	insertSessionTagsQuery := `
	INSERT INTO session_tags(session_id, tag_id) VALUES(?, ?)
	`
	for _, tag := range sessionData.Tags {
		_, err = tx.Exec(insertTagsQuery, tag)
		if err == nil {
			var tagId int64
			err = tx.QueryRow(getTagsQuery, tag).Scan(&tagId)
			if err == nil {
				_, err = tx.Exec(insertSessionTagsQuery, sessionId, tagId)
			}
		}
		if err != nil {
			tx.Rollback()
			w.WriteHeader(http.StatusInternalServerError)
			io.WriteString(w, "Query failed")
			return
		}
	}
	tx.Commit()

	w.WriteHeader(http.StatusOK)
	io.WriteString(w, "Session Info saved")
}

func getTagsList(w http.ResponseWriter, r *http.Request) {
	query := `
	SELECT tag_name FROM tags
	`
	rows, err := db.Query(query)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		io.WriteString(w, "Query failed")
		return
	}
	var tagsList []string
	for rows.Next() {
		var tag string
		if err := rows.Scan(&tag); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		tagsList = append(tagsList, tag)
	}
	if err := rows.Err(); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	encodedTags, err := json.Marshal(tagsList)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	io.WriteString(w, string(encodedTags))
}
