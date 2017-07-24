.PHONY:	all
all: invisiblellama

ASSETS :=	$(shell find assets ! -type d ! -name assets.go)
SOURCES :=	$(shell find . -name \*.go)

assets/assets.go: $(ASSETS)
	go-bindata -nometadata -nocompress -pkg assets -o assets/assets.go -ignore assets/assets.go assets/...

invisiblellama: $(SOURCES) assets/assets.go
	go build

server: invisiblellama
	./invisiblellama

clean:
	-rm invisiblellama 2>&1 >/dev/null
