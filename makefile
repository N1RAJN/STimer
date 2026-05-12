prod:
	PORT=8080 DB_PATH=data.db go run main.go

dev:
	PORT=9090 DB_PATH=test.db go run main.go
