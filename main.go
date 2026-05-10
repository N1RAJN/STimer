package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	_ "modernc.org/sqlite"
)

type pauseObj struct {
	StartedAt uint64 `json:"StartedAt"`
	EndedAt   uint64 `json:"EndedAt"`
}
type sessionInfoObj struct {
	StartedAt       uint64     `json:"StartedAt"`
	EndedAt         uint64     `json:"EndedAt"`
	Duration        uint16     `json:"Duration"`
	PausesInSession []pauseObj `json:"PausesInSession"`
	Title           string     `json:"Title"`
	Description     string     `json:"Description"`
	Tags            []string   `json:"Tags"`
	Resources       string     `json:"Resources"`
}
type sessionListRequestObj struct {
	Sort      string `json:"sort"`
	TimeRange uint16 `json:"timeRange"`
}
type tagUpdateBuffer struct {
	Added   []string `json:"Added"`
	Deleted []string `json:"Deleted"`
	Updated map[string]interface{}
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
	http.HandleFunc("/api/updateTags", updatedTags)
	http.HandleFunc("/api/getSession", getSessions)

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
	var sessionData sessionInfoObj
	var requestBody []byte

	requestBody, err = io.ReadAll(r.Body)
	if err == nil {
		err = json.Unmarshal(requestBody, &sessionData)
	}

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Println(err)
		io.WriteString(w, "Invalid request body.")
		return
	}
	startedTime := sessionData.StartedAt
	endedTime := sessionData.EndedAt
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
	sessionQueryResult, queryErr := tx.Exec(sessionQuery, startedTime, endedTime, duration, title, description, resources)
	if queryErr != nil {
		tx.Rollback()
		w.WriteHeader(http.StatusInternalServerError)
		io.WriteString(w, "Query failed")
		return
	}
	var pausesInSession []pauseObj
	for _, pause := range sessionData.PausesInSession {
		pausesInSession = append(pausesInSession, pauseObj{StartedAt: pause.StartedAt, EndedAt: pause.EndedAt})
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
		_, err = tx.Exec(pausesQuery, sessionId, pause.StartedAt, pause.EndedAt)
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
	message := fmt.Sprintf("Session Info Saved#%d", sessionId)
	io.WriteString(w, message)
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

func getSessions(w http.ResponseWriter, r *http.Request) {
	var sessionConstraints sessionInfoObj
	requestBody, err := io.ReadAll(r.Body)
	if err == nil {
		err = json.Unmarshal(requestBody, &sessionConstraints)
	}

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		io.WriteString(w, "Invalid request body.")
		return
	}
	// Since only one column of table tag is needed, use aggregation to get the tags in one row
	sessionWithTagsQuery := ` 
	SELECT s.*, GROUP_CONCAT(t.tag_name) as tags
	FROM session s
	LEFT JOIN session_tags st ON s.session_id = st.session_id
	LEFT JOIN tags t ON st.tag_id = t.tag_id
	GROUP BY s.session_id
	`

	sessionWithTags, err := db.Query(sessionWithTagsQuery)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}

	sessionList := make(map[uint64]sessionInfoObj) // actual response obj to send as a json
	// using maps to groups pauses by the sessionids
	var session sessionInfoObj // object to hold each session's info
	var (
		// varaibles to build the session Info object
		sessionId, started, ended     uint64
		duration                      uint16
		title, description, resources string
		tags                          sql.NullString
	)

	for sessionWithTags.Next() {
		err = sessionWithTags.Scan(&sessionId, &started, &ended, &duration, &title, &description, &resources, &tags)
		var tagSlice []string
		if tags.Valid {
			// tags contains all tags associated with the session, separated by comma
			tagSlice = strings.Split(tags.String, ",")
		}
		session = sessionInfoObj{started, ended, duration, []pauseObj{}, title, description, tagSlice, resources} // keep the pausesInSession empty,  and append later
		sessionList[sessionId] = session
	}

	// Need multiple columns from pauses table, so do it separately
	pausesQuery := `
	SELECT session_id, started_At, ended_At 
	FROM pauses
		`
	var sId, pStarted, pEnded uint64
	pauses, err := db.Query(pausesQuery)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	for pauses.Next() {
		if err := pauses.Scan(&sId, &pStarted, &pEnded); err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			return
		}
		if pause, ok := sessionList[sId]; ok {
			pause.PausesInSession = append(pause.PausesInSession, pauseObj{pStarted, pEnded})
			sessionList[sId] = pause
		}
	}
	encodedList, err := json.Marshal(sessionList)
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	io.WriteString(w, string(encodedList))

}
func updatedTags(w http.ResponseWriter, r *http.Request) {
	var requestBody []byte
	var tagUpdates tagUpdateBuffer
	requestBody, err := io.ReadAll(r.Body)
	if err == nil {
		err = json.Unmarshal(requestBody, &tagUpdates)
	}

	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		fmt.Println(err)
		io.WriteString(w, "Invalid request body.")
		return
	}

	tx, err := db.Begin()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		fmt.Println(err)
		return
	}
	addTagQuery := `
	INSERT INTO tags(tag_name) values(?)
	`

	for _, tag := range tagUpdates.Added {
		_, err := tx.Exec(addTagQuery, tag)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Println(err)
			tx.Rollback()
			return
		}
	}
	updateTagsQuery := `
	UPDATE tags
	SET tag_name=?
	WHERE tag_name=?
	`
	for newTag, oldTag := range tagUpdates.Updated {
		_, err := tx.Exec(updateTagsQuery, newTag, oldTag)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Println(err)
			tx.Rollback()
			return
		}
	}
	deleteSessionTagsQuery := `
	DELETE FROM session_tags 
	WHERE tag_id IN (
		SELECT tag_id FROM tags WHERE tag_name = ?
	)
	`
	for _, tag := range tagUpdates.Deleted {
		_, err := tx.Exec(deleteSessionTagsQuery, tag)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Println(err)
			tx.Rollback()
			return
		}
	}
	deleteTagsQuery := `
	DELETE FROM tags
	WHERE tag_name=?
	`

	for _, tag := range tagUpdates.Deleted {
		_, err := tx.Exec(deleteTagsQuery, tag)
		if err != nil {
			w.WriteHeader(http.StatusInternalServerError)
			fmt.Println(err)
			tx.Rollback()
			return
		}
	}
	tx.Commit()

	w.WriteHeader(http.StatusOK)
	w.Header().Set("Content-Type", "application/json")
	io.WriteString(w, "Tags Settings Saved")
}
