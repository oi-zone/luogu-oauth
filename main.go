package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
)

func main() {
	rpURL, err := url.Parse("https://www.luogu.com")
	if err != nil {
		log.Fatal(err)
	}
	http.Handle("/", &httputil.ReverseProxy{
		Rewrite: func(r *httputil.ProxyRequest) {
			r.SetXForwarded()
			r.SetURL(rpURL)
			r.Out.Header.Set("x-luogu-type", "content-only")
			r.Out.Header.Set("x-lentille-request", "content-only")
		},
	})
	log.Fatal(http.ListenAndServe(":8080", nil))
}
