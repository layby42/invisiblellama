.PHONY:	all
all: invisiblellama

ASSETS:=	$(shell find assets ! -type d ! -name assets.go)
SOURCES:=	$(shell find . -name \*.go)
DEBUG:=		$(if $(RELEASE),,-debug)

assets/assets.go: $(ASSETS)
	go-bindata $(DEBUG) -nometadata -nocompress -pkg assets -o assets/assets.go -ignore assets/assets.go assets/...

invisiblellama: $(SOURCES) assets/assets.go
	go build

server: invisiblellama
	./invisiblellama

clean:
	-rm assets/assets.go &> /dev/null
	-rm invisiblellama &> /dev/null
