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

PROTOC_INCLUDES := packages/api/third-party
MATCHMAKER_GOLANG_PROTOS = packages/matchmaker/pb/quip-matchmaker.pb.go packages/matchmaker/internal/ipb/messages.pb.go
GOLANG_PROTOS = $(MATCHMAKER_GOLANG_PROTOS)
SWAGGER_JSON_DOCS = packages/api/quip-matchmaker.swagger.json
ALL_PROTOS = $(GOLANG_PROTOS) $(SWAGGER_JSON_DOCS)

help:
	@cat Makefile | grep ^\#\# | grep -v ^\#\#\# |cut -c 4-

## # Install toolchain. Short for installing protoc tools.
## install-toolchain
##

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

packages/api/third-party/: packages/api/third-party/google/api packages/api/third-party/protoc-gen-openapiv2/options

GOOGLE_API_FILES := http annotations
packages/api/third-party/google/api:
	mkdir -p $(TOOLCHAIN_DIR)/googleapis-temp/
	mkdir -p $(REPOSITORY_ROOT)/packages/api/third-party/google/api
	curl -o $(TOOLCHAIN_DIR)/googleapis-temp/googleapis.zip -L https://github.com/googleapis/googleapis/archive/$(GOOGLE_APIS_VERSION).zip
	(cd $(TOOLCHAIN_DIR)/googleapis-temp/; unzip -q -o googleapis.zip)
	cp -f $(foreach file,$(GOOGLE_API_FILES),$(TOOLCHAIN_DIR)/googleapis-temp/googleapis-$(GOOGLE_APIS_VERSION)/google/api/$(file).proto) $(REPOSITORY_ROOT)/packages/api/third-party/google/api/
	rm -rf $(TOOLCHAIN_DIR)/googleapis-temp

packages/api/third-party/protoc-gen-openapiv2/options:
	mkdir -p $(TOOLCHAIN_DIR)/grpc-gateway-temp/
	mkdir -p $(REPOSITORY_ROOT)/packages/api/third-party/protoc-gen-openapiv2/options
	curl -o $(TOOLCHAIN_DIR)/grpc-gateway-temp/grpc-gateway.zip -L https://github.com/grpc-ecosystem/grpc-gateway/archive/v$(GRPC_GATEWAY_VERSION).zip
	(cd $(TOOLCHAIN_DIR)/grpc-gateway-temp/; unzip -q -o grpc-gateway.zip)
	cp -f $(TOOLCHAIN_DIR)/grpc-gateway-temp/grpc-gateway-$(GRPC_GATEWAY_VERSION)/protoc-gen-openapiv2/options/*.proto $(REPOSITORY_ROOT)/packages/api/third-party/protoc-gen-openapiv2/options/
	rm -rf $(TOOLCHAIN_DIR)/grpc-gateway-temp

## ####################################
## # Protobuf
##

## # Build all protobuf definitions
## all-protos
## matchmaker-protos
##

all-protos: $(ALL_PROTOS)
matchmaker-protos: $(MATCHMAKER_GOLANG_PROTOS)

GO_PROTOC_DEPS := build/toolchain/bin/protoc$(EXE_EXTENSION)
GO_PROTOC_DEPS += build/toolchain/bin/protoc-gen-go$(EXE_EXTENSION)
GO_PROTOC_DEPS += build/toolchain/bin/protoc-gen-go-grpc$(EXE_EXTENSION)
GO_PROTOC_DEPS += build/toolchain/bin/protoc-gen-grpc-gateway$(EXE_EXTENSION)

packages/matchmaker/internal/ipb/%.pb.go: packages/matchmaker/internal/api/%.proto $(GO_PROTOC_DEPS)
	mkdir -p $(REPOSITORY_ROOT)/packages/matchmaker/internal/ipb
	$(PROTOC) $< \
		-I $(REPOSITORY_ROOT) -I $(PROTOC_INCLUDES) \
		--go_out=$(REPOSITORY_ROOT)/packages/matchmaker/internal/ipb \
		--go_opt=module=$(GO_MODULE)/packages/matchmaker/internal/ipb

packages/matchmaker/pb/%.pb.go: packages/api/%.proto packages/api/third-party/ $(GO_PROTOC_DEPS)
	mkdir -p $(REPOSITORY_ROOT)/packages/matchmaker/pb
	$(PROTOC) $< \
		-I $(REPOSITORY_ROOT) -I $(PROTOC_INCLUDES) \
		--go_out=$(REPOSITORY_ROOT)/packages/matchmaker \
		--go_opt=module=$(GO_MODULE)/packages/matchmaker \
		--go-grpc_out=require_unimplemented_servers=false:$(REPOSITORY_ROOT)/packages/matchmaker \
		--go-grpc_opt=module=$(GO_MODULE)/packages/matchmaker

packages/api/%.swagger.json: packages/api/%.proto packages/third-party/ build/toolchain/bin/protoc$(EXE_EXTENSION) build/toolchain/bin/protoc-gen-openapiv2$(EXE_EXTENSION)
	$(PROTOC) $< \
		-I $(REPOSITORY_ROOT) -I $(PROTOC_INCLUDES) \
		--openapiv2_out=json_names_for_fields=false,logtostderr=true,allow_delete_body=true:$(REPOSITORY_ROOT)

#######################################

clean-toolchain:
	rm -rf $(TOOLCHAIN_DIR)/

clean-build: clean-toolchain
	rm -rf $(BUILD_DIR)/

clean-third-party:
	rm -rf $(REPOSITORY_ROOT)/third_party/

clean: clean-build clean-third-party
