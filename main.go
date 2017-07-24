package main

// +goimports github.com/layby42/invisiblellama
import (
	"fmt"
	"net/http"
	"time"

	assetfs "github.com/elazarl/go-bindata-assetfs"
	"github.com/gin-contrib/multitemplate"
	"github.com/gin-gonic/gin"
	"github.com/gin-gonic/gin/render"

	"github.com/layby42/invisiblellama/assets"
)

func initializeBoard() [][]int {
	res := [][]int{}
	for i := 0; i < 9; i++ {
		row := []int{}
		for j := 0; j < 9; j++ {
			row = append(row, i*9+j)
		}
		res = append(res, row)
	}
	return res
}

func newRender() render.HTMLRender {
	r := multitemplate.New()
	r.AddFromString("index",
		string(assets.MustAsset("assets/templates/index.tmpl"))+
			string(assets.MustAsset("assets/templates/_head.tmpl"))+
			string(assets.MustAsset("assets/templates/_lines.tmpl")))
	return r
}

func registerRoutes() *gin.Engine {
	r := gin.Default()
	r.HTMLRender = newRender()

	r.GET("/", func(c *gin.Context) {
		c.HTML(http.StatusOK, "index",
			gin.H{
				"board": initializeBoard(),
				"year":  time.Now().Year(),
			})
	})

	general := []string{"privacy", "support", "contact"}
	for _, g := range general {
		r.GET(fmt.Sprintf("/%s", g), func(c *gin.Context) {
			c.Redirect(http.StatusMovedPermanently, "/")
		})
	}

	// support for old site urls
	lines := r.Group("/lines")
	oldRoutes := []string{
		"", "android", "ios", "iphone", "mac", "mac/appcast", "mac_appcast",
		"mac/release_notes", "mac_release_notes",
		"mac_download", "mac/appcast/:lang", "mac/release_notes/:lang",
		"mac/download/:version",
	}
	for _, old := range oldRoutes {
		lines.GET(fmt.Sprintf("/%s", old), func(c *gin.Context) {
			c.Redirect(http.StatusMovedPermanently, "/")
		})
	}

	// TODO: after login routing

	r.StaticFS("/resources", &assetfs.AssetFS{
		Asset: assets.Asset, AssetDir: assets.AssetDir, AssetInfo: assets.AssetInfo, Prefix: "assets/resources",
	})
	r.StaticFile("/favicon.ico", string(assets.MustAsset("assets/resources/favicon.ico")))

	return r
}

func main() {
	r := registerRoutes()
	r.Run("127.0.0.1:3000")
}
