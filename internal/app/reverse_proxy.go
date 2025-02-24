package app

import (
	"context"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strconv"
	"strings"

	"github.com/wxh06/luogu-oauth/internal/db"
)

func NewReverseProxy(client *db.PrismaClient, host string) *httputil.ReverseProxy {
	app := app{client: client, url: &url.URL{Scheme: "https", Host: host}}
	return &httputil.ReverseProxy{Rewrite: app.rewrite}
}

type app struct {
	url    *url.URL
	client *db.PrismaClient
}

func (app app) rewrite(r *httputil.ProxyRequest) {
	r.SetXForwarded()
	r.SetURL(app.url)
	r.Out.Header.Set("x-luogu-type", "content-only")
	r.Out.Header.Set("x-lentille-request", "content-only")

	r.Out.Header.Del("Authorization")
	authorization := strings.Split(r.In.Header.Get("Authorization"), " ")
	if authorization[0] == "Bearer" {
		ctx := context.Background()
		session, err := app.getSession(ctx, authorization[1])
		if err != nil {
			log.Println(err)
			return
		}
		r.Out.AddCookie(&http.Cookie{Name: "_uid", Value: strconv.Itoa(session.UID)})
		r.Out.AddCookie(&http.Cookie{Name: "__client_id", Value: session.ClientID})
	}
}
