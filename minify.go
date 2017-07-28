package main

import (
	"bytes"
	"net/http"
	"strconv"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/tdewolff/minify"
	"github.com/tdewolff/minify/css"
	"github.com/tdewolff/minify/html"
	"github.com/tdewolff/minify/js"
)

type minifyWriter struct {
	gin.ResponseWriter
	buf *bytes.Buffer
}

func (m minifyWriter) Write(b []byte) (int, error) {
	h := m.Header()
	if h.Get("Content-Type") == "" {
		h.Set("Content-Type", http.DetectContentType(b))
	}
	return m.buf.Write(b)
}

var minifiers = map[string]minify.MinifierFunc{
	"text/html":              html.Minify,
	"text/css":               css.Minify,
	"application/javascript": js.Minify,
}

func Minifier() gin.HandlerFunc {
	m := minify.New()
	for k, v := range minifiers {
		m.AddFunc(k, v)
	}

	return func(c *gin.Context) {
		mw := &minifyWriter{c.Writer, new(bytes.Buffer)}
		c.Writer = mw

		c.Next()

		h := mw.Header()
		ct := h.Get("Content-Type")
		if idx := strings.Index(ct, ";"); idx >= 0 {
			ct = ct[:idx]
		}
		if _, ok := minifiers[ct]; ok {
			b, err := m.Bytes(ct, mw.buf.Bytes())
			if err != nil {
				panic(err)
			}
			h.Set("Content-Length", strconv.Itoa(len(b)))
			mw.ResponseWriter.Write(b)
		} else {
			mw.ResponseWriter.Write(mw.buf.Bytes())
		}
	}
}
