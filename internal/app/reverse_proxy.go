package app

import (
	"context"
	"errors"
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
	return &httputil.ReverseProxy{Rewrite: app.rewrite, ModifyResponse: app.modifyResponse}
}

type app struct {
	url    *url.URL
	client *db.PrismaClient
}

func (app app) rewrite(r *httputil.ProxyRequest) {
	r.SetXForwarded()
	r.Out.Header.Set("x-luogu-type", "content-only")
	r.Out.Header.Set("x-lentille-request", "content-only")

	r.Out.Header.Del("Authorization")
	authorization := strings.Split(r.In.Header.Get("Authorization"), " ")
	if authorization[0] == "Bearer" {
		ctx := context.Background()
		session, err := app.getSession(ctx, authorization[1])
		if err != nil {
			// TODO: 401 Unauthorized
			log.Println(err)
			return
		}
		r.Out.AddCookie(&http.Cookie{Name: "_uid", Value: strconv.Itoa(session.UID)})
		r.Out.AddCookie(&http.Cookie{Name: "__client_id", Value: session.ClientID})
	} else if authorization[0] != "" {
		// TODO: 400 Bad Request
		return
	}
	r.SetURL(app.url)
}

func (app app) modifyResponse(r *http.Response) error {
	var uid int
	if cookie, err := r.Request.Cookie("_uid"); errors.Is(err, http.ErrNoCookie) {
		// Not logged in
		return nil
	} else if err != nil {
		return err
	} else if uid, err = strconv.Atoi(cookie.Value); err != nil {
		return err
	}

	var clientID string
	if cookie, err := r.Request.Cookie("__client_id"); err != nil {
		return err
	} else {
		clientID = cookie.Value
	}

	ctx := context.Background()
	cookies := r.Cookies()
	if len(cookies) != 1 || cookies[0].Name != "_uid" || cookies[0].Value != strconv.Itoa(uid) {
		if err := app.updateSessionValidity(ctx, uid, clientID, false); err != nil {
			return err
		}
		return errors.New("unauthorized")
	}
	if err := app.updateSessionValidity(ctx, uid, clientID, true); err != nil {
		return err
	}
	return nil
}
