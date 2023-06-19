## quip Make Help
## =====================
## 

PROTOC_VERSION = 21.12
GOOGLE_APIS_VERSION = 73131bbb21f396969b5cf86893231dbe4c94728d
GRPC_GATEWAY_VERSION = 2.15.0

# Defines the absolute local directory of this project
REPOSITORY_ROOT := $(patsubst %/,%,$(dir $(abspath $(MAKEFILE_LIST))))
BUILD_DIR := $(REPOSITORY_ROOT)/build
TOOLCHAIN_DIR := $(BUILD_DIR)/toolchain
TOOLCHAIN_BIN := $(TOOLCHAIN_DIR)/bin
EXE_EXTENSION =

GO = GO111MODULE=on go
GO_MODULE = github.com/GambitLLC/quip
PROTOC = $(TOOLCHAIN_BIN)/protoc$(EXE_EXTENSION)

export PATH := $(TOOLCHAIN_BIN):$(PATH)

ifeq ($(OS),Windows_NT)
	EXE_EXTENSION = .exe
	PROTOC_PACKAGE = https://github.com/protocolbuffers/protobuf/releases/download/v$(PROTOC_VERSION)/protoc-$(PROTOC_VERSION)-win64.zip
else
	UNAME_S := $(shell uname -s)
	ifeq ($(UNAME_S),Linux)
		PROTOC_PACKAGE = https://github.com/protocolbuffers/protobuf/releases/download/v$(PROTOC_VERSION)/protoc-$(PROTOC_VERSION)-linux-x86_64.zip
	endif
	ifeq ($(UNAME_S),Darwin)
		PROTOC_PACKAGE = https://github.com/protocolbuffers/protobuf/releases/download/v$(PROTOC_VERSION)/protoc-$(PROTOC_VERSION)-osx-x86_64.zip
	endif
endif

PROTOC_INCLUDES := api/third-party

MATCHMAKER_INTERNAL_PROTOS = libs/matchmaker/internal/ipb/messages.pb.go

MATCHMAKER_PROTO_NAMES = backend frontend messages
MATCHMAKER_TYPESCRIPT_PROTOS = $(foreach proto,$(MATCHMAKER_PROTO_NAMES), libs/pb/matchmaker/$(proto).ts)
MATCHMAKER_GOLANG_PROTOS = $(foreach proto,$(MATCHMAKER_PROTO_NAMES), libs/pb/matchmaker/$(proto).pb.go) $(MATCHMAKER_INTERNAL_PROTOS)
MATCHMAKER_PROTOS = $(MATCHMAKER_TYPESCRIPT_PROTOS) $(MATCHMAKER_GOLANG_PROTOS)

SWAGGER_JSON_DOCS = api/matchmaker/frontend.swagger.json api/matchmaker/backend.swagger.json

ALL_PROTOS = $(MATCHMAKER_PROTOS) $(SWAGGER_JSON_DOCS)

help:
	@cat Makefile | grep ^\#\# | grep -v ^\#\#\# |cut -c 4-

## ####################################
## # Install
##

## # Install npm dependencies and protoc tools.
## install
##
## install-npm
## install-toolchain
## 

install: install-npm install-toolchain

install-npm: node_modules

# Add dependency on package.json so recipe runs on any dependency changes.
node_modules: package.json
	npm install

install-toolchain: install-protoc-tools

install-protoc-tools: build/toolchain/bin/protoc$(EXE_EXTENSION)
install-protoc-tools: build/toolchain/bin/protoc-gen-go$(EXE_EXTENSION)
install-protoc-tools: build/toolchain/bin/protoc-gen-go-grpc$(EXE_EXTENSION)
install-protoc-tools: build/toolchain/bin/protoc-gen-openapiv2$(EXE_EXTENSION)

build/toolchain/bin/protoc$(EXE_EXTENSION):
	mkdir -p $(TOOLCHAIN_BIN)
	curl -o $(TOOLCHAIN_DIR)/protoc-temp.zip -L $(PROTOC_PACKAGE)
	(cd $(TOOLCHAIN_DIR); unzip -q -o protoc-temp.zip)
	rm $(TOOLCHAIN_DIR)/protoc-temp.zip

build/toolchain/bin/protoc-gen-go$(EXE_EXTENSION):
	mkdir -p $(TOOLCHAIN_BIN)
	cd $(TOOLCHAIN_BIN) && $(GO) get google.golang.org/protobuf/cmd/protoc-gen-go && $(GO) build -pkgdir . google.golang.org/protobuf/cmd/protoc-gen-go

build/toolchain/bin/protoc-gen-go-grpc$(EXE_EXTENSION):
	mkdir -p $(TOOLCHAIN_BIN)
	cd $(TOOLCHAIN_BIN) && $(GO) get google.golang.org/grpc/cmd/protoc-gen-go-grpc && $(GO) build -pkgdir . google.golang.org/grpc/cmd/protoc-gen-go-grpc

build/toolchain/bin/protoc-gen-openapiv2$(EXE_EXTENSION):
	mkdir -p $(TOOLCHAIN_BIN)
	cd $(TOOLCHAIN_BIN) && $(GO) get github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2 && $(GO) build -pkgdir . github.com/grpc-ecosystem/grpc-gateway/v2/protoc-gen-openapiv2

# init module because there are conflicting module versions (prometheus)
build/e2e/bin/minimatch:
	mkdir -p $(BUILD_DIR)/e2e/bin
	-cd $(BUILD_DIR)/e2e/bin && $(GO) mod init derp
	cd $(BUILD_DIR)/e2e/bin && $(GO) get open-match.dev/open-match/cmd/minimatch && $(GO) build -pkgdir . open-match.dev/open-match/cmd/minimatch

# init module because there are conflicting module versions (prometheus)
build/e2e/bin/default-evaluator:
	mkdir -p $(BUILD_DIR)/e2e/bin
	-cd $(BUILD_DIR)/e2e/bin && $(GO) mod init derp
	cd $(BUILD_DIR)/e2e/bin && $(GO) get open-match.dev/open-match/cmd/default-evaluator && $(GO) build -pkgdir . open-match.dev/open-match/cmd/default-evaluator

# init module because there are conflicting module versions (prometheus)
build/e2e/bin/synchronizer:
	mkdir -p $(BUILD_DIR)/e2e/bin
	-cd $(BUILD_DIR)/e2e/bin && $(GO) mod init derp
	cd $(BUILD_DIR)/e2e/bin && $(GO) get open-match.dev/open-match/cmd/synchronizer && $(GO) build -pkgdir . open-match.dev/open-match/cmd/synchronizer


api/third-party/: api/third-party/google/api api/third-party/protoc-gen-openapiv2/options

GOOGLE_API_FILES := http annotations
api/third-party/google/api:
	mkdir -p $(TOOLCHAIN_DIR)/googleapis-temp/
	mkdir -p $(REPOSITORY_ROOT)/api/third-party/google/api
	curl -o $(TOOLCHAIN_DIR)/googleapis-temp/googleapis.zip -L https://github.com/googleapis/googleapis/archive/$(GOOGLE_APIS_VERSION).zip
	(cd $(TOOLCHAIN_DIR)/googleapis-temp/; unzip -q -o googleapis.zip)
	cp -f $(foreach file,$(GOOGLE_API_FILES),$(TOOLCHAIN_DIR)/googleapis-temp/googleapis-$(GOOGLE_APIS_VERSION)/google/api/$(file).proto) $(REPOSITORY_ROOT)/api/third-party/google/api/
	rm -rf $(TOOLCHAIN_DIR)/googleapis-temp

api/third-party/protoc-gen-openapiv2/options:
	mkdir -p $(TOOLCHAIN_DIR)/grpc-gateway-temp/
	mkdir -p $(REPOSITORY_ROOT)/api/third-party/protoc-gen-openapiv2/options
	curl -o $(TOOLCHAIN_DIR)/grpc-gateway-temp/grpc-gateway.zip -L https://github.com/grpc-ecosystem/grpc-gateway/archive/v$(GRPC_GATEWAY_VERSION).zip
	(cd $(TOOLCHAIN_DIR)/grpc-gateway-temp/; unzip -q -o grpc-gateway.zip)
	cp -f $(TOOLCHAIN_DIR)/grpc-gateway-temp/grpc-gateway-$(GRPC_GATEWAY_VERSION)/protoc-gen-openapiv2/options/*.proto $(REPOSITORY_ROOT)/api/third-party/protoc-gen-openapiv2/options/
	rm -rf $(TOOLCHAIN_DIR)/grpc-gateway-temp

## ####################################
## # Testing
##
## test
##

.PHONY: test
test: install-npm
	npx nx run-many --targets=test,e2e --all

## ####################################
## # GraphQL
##

## graph/generated.go

graph/generated.go: graph/schema.graphqls gqlgen.yml
	$(GO) run github.com/99designs/gqlgen generate .

## ####################################
## # Protobuf
##

## # Build protobuf definitions
## all-protos
## matchmaker-protos
##
## # Build Swagger OpenAPI docs
## api-docs
##


api-docs: $(SWAGGER_JSON_DOCS)

matchmaker-protos: $(MATCHMAKER_PROTOS)
all-protos: $(ALL_PROTOS)

GO_PROTOC_DEPS := build/toolchain/bin/protoc$(EXE_EXTENSION)
GO_PROTOC_DEPS += build/toolchain/bin/protoc-gen-go$(EXE_EXTENSION)
GO_PROTOC_DEPS += build/toolchain/bin/protoc-gen-go-grpc$(EXE_EXTENSION)

libs/pb/matchmaker/%.pb.go: api/matchmaker/%.proto api/third-party/ $(GO_PROTOC_DEPS)
	mkdir -p $(REPOSITORY_ROOT)/libs/pb/matchmaker
	$(PROTOC) matchmaker/$(*F).proto \
		-I $(REPOSITORY_ROOT)/api -I $(PROTOC_INCLUDES) \
		--go_out=$(REPOSITORY_ROOT)/libs/pb/matchmaker \
		--go_opt=module=$(GO_MODULE)/libs/pb/matchmaker \
		--go-grpc_out=require_unimplemented_servers=false:$(REPOSITORY_ROOT)/libs/pb/matchmaker \
		--go-grpc_opt=module=$(GO_MODULE)/libs/pb/matchmaker

# Include proto structure for dependency chain to run properly.
libs/pb/matchmaker/frontend.pb.go: libs/pb/matchmaker/messages.pb.go
libs/pb/matchmaker/backend.pb.go: libs/pb/matchmaker/messages.pb.go

libs/matchmaker/internal/ipb/%.pb.go: libs/matchmaker/internal/api/%.proto $(GO_PROTOC_DEPS)
	mkdir -p $(REPOSITORY_ROOT)/libs/matchmaker/internal/ipb
	$(PROTOC) $< \
		-I $(REPOSITORY_ROOT) -I $(PROTOC_INCLUDES) \
		--go_out=$(REPOSITORY_ROOT)/libs/matchmaker/internal/ipb \
		--go_opt=module=$(GO_MODULE)/libs/matchmaker/internal/ipb

TS_PROTOC_DEPS := build/toolchain/bin/protoc$(EXE_EXTENSION) node_modules

# ts proto regenerates dependency files as well
# pass all protos at once into protoc so that make can properly cache
libs/pb/matchmaker/%.ts: api/matchmaker/%.proto api/third-party/ $(TS_PROTOC_DEPS)
	mkdir -p $(REPOSITORY_ROOT)/libs/pb/matchmaker
	$(PROTOC) $(foreach proto,$(MATCHMAKER_PROTO_NAMES),matchmaker/$(proto).proto)  \
		-I $(REPOSITORY_ROOT)/api -I $(PROTOC_INCLUDES) \
		--plugin=./node_modules/.bin/protoc-gen-ts_proto \
		--ts_proto_out=$(REPOSITORY_ROOT)/libs/pb \
		--ts_proto_opt=esModuleInterop=true \
		--ts_proto_opt=outputServices=grpc-js \
		--ts_proto_opt=removeEnumPrefix=true \
		--ts_proto_opt=unrecognizedEnum=false

# Include proto structure for dependency chain to run properly.
libs/pb/matchmaker/frontend.ts: libs/pb/matchmaker/messages.ts
libs/pb/matchmaker/backend.ts: libs/pb/matchmaker/messages.ts

api/matchmaker/%.swagger.json: api/matchmaker/%.proto api/third-party/ build/toolchain/bin/protoc$(EXE_EXTENSION) build/toolchain/bin/protoc-gen-openapiv2$(EXE_EXTENSION)
	$(PROTOC) matchmaker/$(*F).proto \
		-I $(REPOSITORY_ROOT)/api -I $(PROTOC_INCLUDES) \
		--openapiv2_out=json_names_for_fields=false,logtostderr=true,allow_delete_body=true:$(REPOSITORY_ROOT)/api

clean-build:
	rm -rf $(BUILD_DIR)/

clean-third-party:
	rm -rf $(REPOSITORY_ROOT)/api/third-party/

PB_EXCLUDE_ITEMS = libs/pb/package.json libs/pb/project.json libs/pb/README.md libs/pb/tsconfig.json libs/pb/tsconfig.lib.json
PB_ITEMS = $(filter-out $(PB_EXCLUDE_ITEMS), $(wildcard libs/pb/*))

clean-protos:
	rm -rf $(foreach item,$(PB_ITEMS), $(REPOSITORY_ROOT)/$(item))

.PHONY: clean
clean: clean-build clean-third-party clean-protos
