package main

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"

	_ "modernc.org/sqlite"
)

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
	tag_name TEXT
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

	if err != nil {
	}
}
