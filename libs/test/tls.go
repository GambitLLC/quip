package test

import (
	"github.com/GambitLLC/quip/libs/config"
	"github.com/GambitLLC/quip/libs/test/data"
)

func SetTLS(cfg config.Mutable) {
	cfg.Set("api.tls.certificateFile", data.Path("x509/server_cert.pem"))
	cfg.Set("api.tls.privateKeyFile", data.Path("x509/server_key.pem"))
	cfg.Set("api.tls.rootCertificateFile", data.Path("x509/ca_cert.pem"))
}
