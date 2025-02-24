package main

import (
	"log"
	"net/http"

	"github.com/joho/godotenv"
	"github.com/wxh06/luogu-oauth/internal/app"
	"github.com/wxh06/luogu-oauth/internal/db"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal(err)
	}

	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		log.Fatal(err)
	}

	log.Fatal(http.ListenAndServe(":8080", app.NewReverseProxy(client, "www.luogu.com.cn")))
}
