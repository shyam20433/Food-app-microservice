# Run this script to generate a self-signed SSL certificate for local dev
# Requirements: OpenSSL must be installed
# Windows: download from https://slproweb.com/products/Win32OpenSSL.html
#           or install via: choco install openssl

$CertDir = "$PSScriptRoot\certs"
New-Item -ItemType Directory -Force -Path $CertDir | Out-Null

Write-Host "Generating self-signed SSL certificate..." -ForegroundColor Cyan

# Generate private key + self-signed certificate (valid 365 days)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
  -keyout "$CertDir\nginx.key" `
  -out    "$CertDir\nginx.crt" `
  -subj "/C=IN/ST=TamilNadu/L=Coimbatore/O=FoodApp/CN=localhost" `
  -addext "subjectAltName=IP:127.0.0.1,DNS:localhost"

if ($LASTEXITCODE -eq 0) {
  Write-Host ""
  Write-Host "Certificate generated successfully!" -ForegroundColor Green
  Write-Host "  Key:  $CertDir\nginx.key"
  Write-Host "  Cert: $CertDir\nginx.crt"
  Write-Host ""
  Write-Host "NOTE: Your browser will show a security warning for self-signed certs." -ForegroundColor Yellow
  Write-Host "      Click 'Advanced' -> 'Proceed to localhost' to bypass it." -ForegroundColor Yellow
  Write-Host ""
  Write-Host "To trust the certificate (remove warning):" -ForegroundColor Cyan
  Write-Host "  1. Double-click $CertDir\nginx.crt"
  Write-Host "  2. Click 'Install Certificate'"
  Write-Host "  3. Store: 'Local Machine' -> 'Trusted Root Certification Authorities'"
} else {
  Write-Host "Failed! Make sure OpenSSL is installed and in your PATH." -ForegroundColor Red
  Write-Host "Install: choco install openssl" -ForegroundColor Yellow
}
