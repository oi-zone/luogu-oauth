package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
	"github.com/wxh06/luogu-oauth/prisma/db"
)

func getSession(ctx context.Context, client *db.PrismaClient, accessToken string) (*db.LuoguSessionModel, error) {
	token, err := client.Token.
		FindUnique(db.Token.AccessToken.Equals(accessToken)).
		Select(db.Token.AccessTokenExpiresAt.Field(), db.Token.Revoked.Field()).
		With(
			db.Token.User.Fetch().Select().With(
				db.LuoguUser.Sessions.
					Fetch(db.LuoguSession.Valid.Equals(true)).
					Select(db.LuoguSession.UID.Field(), db.LuoguSession.ClientID.Field()).
					Take(1),
			),
		).
		Exec(ctx)
	if errors.Is(err, db.ErrNotFound) || token.Revoked || token.AccessTokenExpiresAt.Before(time.Now()) {
		return nil, errors.New("Unauthorized")
	}
	if err != nil {
		return nil, err
	}
	return &token.User().Sessions()[0], nil
}

func main() {
	if err := godotenv.Load(); err != nil {
		log.Fatal(err)
	}

	client := db.NewClient()
	if err := client.Prisma.Connect(); err != nil {
		log.Fatal(err)
	}

	rpURL, err := url.Parse("https://www.luogu.com.cn")
	if err != nil {
		log.Fatal(err)
	}
	http.Handle("/", &httputil.ReverseProxy{
		Rewrite: func(r *httputil.ProxyRequest) {
			r.SetXForwarded()
			r.SetURL(rpURL)
			r.Out.Header.Set("x-luogu-type", "content-only")
			r.Out.Header.Set("x-lentille-request", "content-only")

			r.Out.Header.Del("Authorization")
			authorization := strings.Split(r.In.Header.Get("Authorization"), " ")
			if authorization[0] == "Bearer" {
				ctx := context.Background()
				session, err := getSession(ctx, client, authorization[1])
				if err != nil {
					log.Println(err)
					return
				}
				r.Out.AddCookie(&http.Cookie{Name: "_uid", Value: strconv.Itoa(session.UID)})
				r.Out.AddCookie(&http.Cookie{Name: "__client_id", Value: session.ClientID})
			}
		},
	})
	log.Fatal(http.ListenAndServe(":8080", nil))
}
