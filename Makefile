## quip Make Help
## =====================
##

PROTOC_VERSION = 21.12
GOOGLE_APIS_VERSION = 73131bbb21f396969b5cf86893231dbe4c94728d
GRPC_GATEWAY_VERSION = 2.15.0
OPEN_MATCH_VERSION = 1.7.0

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

MATCHMAKER_PROTO_NAMES = frontend manager broker extensions messages
MATCHMAKER_GOLANG_PROTOS = $(foreach proto,$(MATCHMAKER_PROTO_NAMES), pkg/matchmaker/pb/$(proto).pb.go)
MATCHMAKER_TYPESCRIPT_PROTOS = $(foreach proto,$(MATCHMAKER_PROTO_NAMES), packages/pb/matchmaker/$(proto).ts)

ALL_PROTOS = $(MATCHMAKER_PROTOS)

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

## ####################################
## # Protobuf
##

## # Build protobuf definitions
## all-protos
## matchmaker-protos
##
## # Download third party protobuf definitions
## api/third-party/
##

all-protos: $(ALL_PROTOS)
matchmaker-protos: matchmaker-go-protos matchmaker-ts-protos
matchmaker-go-protos: $(MATCHMAKER_GOLANG_PROTOS)
matchmaker-ts-protos: $(MATCHMAKER_TYPESCRIPT_PROTOS)

GO_PROTOC_DEPS := build/toolchain/bin/protoc$(EXE_EXTENSION)
GO_PROTOC_DEPS += build/toolchain/bin/protoc-gen-go$(EXE_EXTENSION)
GO_PROTOC_DEPS += build/toolchain/bin/protoc-gen-go-grpc$(EXE_EXTENSION)

pkg/matchmaker/pb/%.pb.go: api/matchmaker/%.proto api/third-party/ $(GO_PROTOC_DEPS)
	mkdir -p $(REPOSITORY_ROOT)/pkg/matchmaker/pb
	$(PROTOC) matchmaker/$(*F).proto \
		-I $(REPOSITORY_ROOT)/api -I $(PROTOC_INCLUDES) \
		--go_out=$(REPOSITORY_ROOT)/pkg/matchmaker/pb \
		--go_opt=module=$(GO_MODULE)/pkg/matchmaker/pb \
		--go-grpc_out=require_unimplemented_servers=false:$(REPOSITORY_ROOT)/pkg/matchmaker/pb \
		--go-grpc_opt=module=$(GO_MODULE)/pkg/matchmaker/pb

# Include proto structure for dependency chain to run properly.
pkg/matchmaker/pb/frontend.pb.go: pkg/matchmaker/pb/messages.pb.go
pkg/matchmaker/pb/manager.pb.go: pkg/matchmaker/pb/messages.pb.go
pkg/matchmaker/pb/broker.pb.go: pkg/matchmaker/pb/messages.pb.go
pkg/matchmaker/pb/extensions.pb.go: pkg/matchmaker/pb/messages.pb.go

TS_PROTOC_DEPS := build/toolchain/bin/protoc$(EXE_EXTENSION) node_modules

# ts proto regenerates dependency files as well
# pass all protos at once into protoc so that make can properly cache
packages/pb/matchmaker/%.ts: api/matchmaker/%.proto api/third-party/ $(TS_PROTOC_DEPS)
	mkdir -p $(REPOSITORY_ROOT)/packages/pb
	$(PROTOC) $(foreach proto,$(MATCHMAKER_PROTO_NAMES),matchmaker/$(proto).proto)  \
		-I $(REPOSITORY_ROOT)/api -I $(PROTOC_INCLUDES) \
		--plugin=./node_modules/.bin/protoc-gen-ts_proto \
		--ts_proto_out=$(REPOSITORY_ROOT)/packages/pb \
		--ts_proto_opt=esModuleInterop=true \
		--ts_proto_opt=outputServices=grpc-js \
		--ts_proto_opt=removeEnumPrefix=true \
		--ts_proto_opt=unrecognizedEnum=false

api/third-party/:
	mkdir -p api/third-party
# api/third-party/: api/third-party/google api/third-party/protoc-gen-openapiv2/options api/third-party/open-match

# api/third-party/open-match:
# 	mkdir -p $(TOOLCHAIN_DIR)/open-match-temp/
# 	mkdir -p $(REPOSITORY_ROOT)/api/third-party/open-match
# 	curl -o $(TOOLCHAIN_DIR)/open-match-temp/open-match.zip -L https://github.com/googleforgames/open-match/archive/v$(OPEN_MATCH_VERSION).zip
# 	(cd $(TOOLCHAIN_DIR)/open-match-temp/; unzip -q -o open-match.zip)
# 	cp -f $(TOOLCHAIN_DIR)/open-match-temp/open-match-$(OPEN_MATCH_VERSION)/api/messages.proto $(REPOSITORY_ROOT)/api/third-party/open-match/
# 	rm -rf $(TOOLCHAIN_DIR)/open-match-temp

# GOOGLE_API_FILES := api/http api/annotations rpc/status
# api/third-party/google:
# 	mkdir -p $(TOOLCHAIN_DIR)/googleapis-temp/
# 	mkdir -p $(REPOSITORY_ROOT)/api/third-party/google/api
# 	curl -o $(TOOLCHAIN_DIR)/googleapis-temp/googleapis.zip -L https://github.com/googleapis/googleapis/archive/$(GOOGLE_APIS_VERSION).zip
# 	(cd $(TOOLCHAIN_DIR)/googleapis-temp/; unzip -q -o googleapis.zip)
# 	$(foreach file,$(GOOGLE_API_FILES),mkdir -p $(REPOSITORY_ROOT)/api/third-party/google/$(dir $(file)))
# 	$(foreach file,$(GOOGLE_API_FILES),cp -f $(TOOLCHAIN_DIR)/googleapis-temp/googleapis-$(GOOGLE_APIS_VERSION)/google/$(file).proto $(REPOSITORY_ROOT)/api/third-party/google/$(dir $(file));)
# 	rm -rf $(TOOLCHAIN_DIR)/googleapis-temp

## ####################################
## # Clean
##
## clean
## clean-build
## clean-third-party
##

clean-build:
	rm -rf $(BUILD_DIR)/

clean-third-party:
	rm -rf $(REPOSITORY_ROOT)/api/third-party/

PB_EXCLUDE_ITEMS = packages/pb/README.md pkg/matchmaker/pb/README.md
PB_ITEMS = $(filter-out $(PB_EXCLUDE_ITEMS), $(wildcard packages/pb/* pkg/matchmaker/pb/*))

clean-protos:
	rm -rf $(foreach item,$(PB_ITEMS), $(REPOSITORY_ROOT)/$(item))

.PHONY: clean
clean: clean-build clean-third-party clean-protos
