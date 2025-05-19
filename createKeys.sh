#!/bin/bash

# 현재 디렉토리 기준 키 저장 경로
API_GW_DIR="./keys/api-gw"
AUTH_DIR="./keys/auth"

# 디렉토리 없으면 생성
mkdir -p "$API_GW_DIR"
mkdir -p "$AUTH_DIR"

# 키 파일 경로
PRIVATE_KEY_PATH="$AUTH_DIR/private.key"
PUBLIC_KEY_AUTH_PATH="$AUTH_DIR/public.key"
PUBLIC_KEY_API_GW_PATH="$API_GW_DIR/public.key"

# 개인키 생성 (auth 디렉토리)
openssl genpkey -algorithm RSA -out "$PRIVATE_KEY_PATH" -pkeyopt rsa_keygen_bits:2048

# 공개키 생성 (auth 디렉토리)
openssl rsa -pubout -in "$PRIVATE_KEY_PATH" -out "$PUBLIC_KEY_AUTH_PATH"

# 공개키 복사 (api-gw 디렉토리)
cp "$PUBLIC_KEY_AUTH_PATH" "$PUBLIC_KEY_API_GW_PATH"

echo "키 생성 완료!"
echo "Private key (auth): $PRIVATE_KEY_PATH"
echo "Public key (auth): $PUBLIC_KEY_AUTH_PATH"
echo "Public key (api-gw): $PUBLIC_KEY_API_GW_PATH"