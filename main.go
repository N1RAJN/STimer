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

	http.HandleFunc("/api/hello", helloHandler)

	// Serve static files (your frontend)
	fs := http.FileServer(http.Dir("./src"))
	http.Handle("/", fs)

	fmt.Println("Server running at http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func createTable() {
	query := `
	CREATE TABLE IF NOT EXISTS users (
		id INTEGER PRIMARY KEY AUTOINCREMENT,
		name TEXT
	);`
	_, err := db.Exec(query)
	if err != nil {
		log.Fatal(err)
	}
}

func helloHandler(w http.ResponseWriter, r *http.Request) {
	rows, err := db.Query("SELECT id, name FROM users")
	if err != nil {
		http.Error(w, err.Error(), 500)
		return
	}
	defer rows.Close()

	var result string
	for rows.Next() {
		var id int
		var name string
		rows.Scan(&id, &name)
		result += fmt.Sprintf("%d: %s\n", id, name)
	}

	w.Write([]byte(result))
}
