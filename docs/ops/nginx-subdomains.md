# Nginx 배포 템플릿(서브도메인/단일도메인) — Ubuntu 24.04

오빠가 말한 “외부는 80/443만 열고 나머지는 닫기”면, 보통은 **서브도메인 2개(Web/API)**로 나누는 게 깔끔해.
근데 DuckDNS 같은 걸로 “도메인 1개만” 써야 하면, 이 템플릿은 **단일 도메인**으로도 굴러가게 해놨어(Next BFF: `/api/bff`).

목표(모드 A: 서브도메인 2개):

- Web: `https://<WEB_DOMAIN>` → Next.js(`127.0.0.1:3000`)
- API: `https://<API_DOMAIN>` → FastAPI(`127.0.0.1:2000`)
- 외부 오픈 포트: 80/443만

목표(모드 B: 단일 도메인 1개):

- Web: `https://<DOMAIN>` → Next.js(`127.0.0.1:3000`)
- API: 외부 직접 노출 안 함(브라우저는 `https://<DOMAIN>/api/bff/...`로만 호출)
- 외부 오픈 포트: 80/443만

> 가정: 한 대의 서버에서 Web/API 둘 다 띄운다(리버스 프록시만 Nginx).

---

## 0) DNS

- 모드 A: `<WEB_DOMAIN>`, `<API_DOMAIN>` A/AAAA → 서버 IP
- 모드 B: `<DOMAIN>` A/AAAA → 서버 IP

### 0-1) “무료 도메인” 현실 버전

2차 도메인(예: `mydomain.tld`)을 **진짜로 무료**로 주는 곳은 요즘 거의 없다.
대신 템플릿 예시/개인 서버 용도로는 “무료 서브도메인(DDNS)”이 제일 현실적이야.

- DuckDNS(추천): `*.duckdns.org` 무료 서브도메인. IP가 바뀌면 토큰으로 업데이트(스크립트/크론).
- No-IP: 무료 DDNS도 가능하지만 30일마다 호스트 확인 같은 운영 귀찮음이 생길 수 있음.
- EU.org: 무료 서브도메인 등록(승인/처리 시간이 필요할 수 있음).

오빠가 “상시로 띄워놓을 템플릿”이면, **DuckDNS 2개(웹/API) 만들어서** `<WEB_DOMAIN>`, `<API_DOMAIN>`에 넣는 게 제일 빠르다.

### 0-2) DuckDNS IP 업데이트(토큰은 숨겨)

DuckDNS는 `api.<WEB_DOMAIN>` 같은 “3단계” 서브도메인을 만드는 방식이 아니고, **호스트명 자체를 2개 따로 파는 방식**이야.

- Web: `<WEB_DOMAIN>` (예: `myweb.duckdns.org`)
- API: `<API_DOMAIN>` (예: `myweb-api.duckdns.org`)

VPS처럼 IP가 고정이면 **한 번만 업데이트**해도 되고, IP가 바뀌는 환경이면 5~10분마다 갱신하도록 걸어두면 돼.

> 주의: DuckDNS 토큰은 커맨드 히스토리/로그에 남기지 마. 파일에 빼서 읽어.

예시(서버에서):

`/etc/duckdns/token.env` (root 전용):

```bash
DUCKDNS_TOKEN=__PUT_YOUR_TOKEN_HERE__
```

`/usr/local/bin/duckdns-update`:

```bash
#!/usr/bin/env bash
set -euo pipefail

source /etc/duckdns/token.env

# DuckDNS 업데이트는 ".duckdns.org"를 뺀 이름을 넣는다(여러 개면 쉼표).
# 예: myweb  또는  myweb,myweb-api
curl -fsS "https://www.duckdns.org/update?domains=<DUCKDNS_NAMES>&token=${DUCKDNS_TOKEN}&ip=" | grep -q OK
```

권한:

```bash
sudo chown root:root /etc/duckdns/token.env /usr/local/bin/duckdns-update
sudo chmod 600 /etc/duckdns/token.env
sudo chmod 755 /usr/local/bin/duckdns-update
```

cron(5분마다):

```bash
sudo bash -lc "printf '*/5 * * * * root /usr/local/bin/duckdns-update >/dev/null 2>&1\\n' > /etc/cron.d/duckdns"
```

DNS 확인:

```bash
dig +short <DOMAIN>
dig +short <WEB_DOMAIN>
dig +short <API_DOMAIN>
```

---

## 1) 패키지 설치

버전은 “특정 숫자”로 고정하지 말고, **Ubuntu 24.04 기본 레포(noble-security/noble-updates) nginx**를 써.
이 템플릿에 필요한 기능(리버스 프록시/HTTP2/Let’s Encrypt)은 그걸로 충분해.

```bash
sudo apt update
sudo apt install -y nginx
sudo apt install -y certbot python3-certbot-nginx
```

설치될 후보 버전 확인:

```bash
apt-cache policy nginx
nginx -v
```

방화벽(UFW 쓸 때만):

```bash
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 2) 앱 프로세스는 localhost로만 바인딩

“포트 닫아둘 거니까 괜찮다”는 말은 맞는데, 그래도 습관은 좋게 가져가자.

권장 바인딩:

- Next: `127.0.0.1:3000`
- FastAPI: `127.0.0.1:2000`

### 2-1) Backend (FastAPI) systemd 예시

`/etc/systemd/system/mywebtemplate-api.service`:

```ini
[Unit]
Description=MyWebTemplate API (FastAPI)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/mywebtemplate/backend
Environment=BACKEND_CONFIG=/opt/mywebtemplate/backend/config.ini
ExecStart=/usr/bin/bash -lc 'source /opt/mywebtemplate/env.sh && python3 -m gunicorn -k uvicorn.workers.UvicornWorker server:app -w 4 -b 127.0.0.1:2000'
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
```

> 경로(`/opt/mywebtemplate`)는 오빠 서버 실제 배치 경로로 바꿔.

### 2-2) Web (Next.js) systemd 예시

`/etc/systemd/system/mywebtemplate-web.service`:

```ini
[Unit]
Description=MyWebTemplate Web (Next.js)
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/opt/mywebtemplate/frontend-web
Environment=PORT=3000
ExecStart=/usr/bin/bash -lc 'source /opt/mywebtemplate/env.sh && pnpm start -- -p 3000 -H 127.0.0.1'
Restart=always
RestartSec=2

[Install]
WantedBy=multi-user.target
```

빌드 1회(배포 시):

```bash
cd /opt/mywebtemplate/frontend-web
source /opt/mywebtemplate/env.sh
pnpm install --frozen-lockfile
pnpm build
```

서비스 반영:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now mywebtemplate-api
sudo systemctl enable --now mywebtemplate-web
sudo systemctl status mywebtemplate-api --no-pager
sudo systemctl status mywebtemplate-web --no-pager
```

로그:

```bash
sudo journalctl -u mywebtemplate-api -f
sudo journalctl -u mywebtemplate-web -f
```

---

## 3) Nginx 설정

Ubuntu 기본 `/etc/nginx/nginx.conf`는 아래 디렉토리를 `include`로 읽는다:

- `/etc/nginx/conf.d/*.conf` (전역 스니펫)
- `/etc/nginx/sites-enabled/*` (활성화된 사이트)

그래서 `nginx.conf`를 직접 수정하기보다, 아래처럼 파일을 만들고(`conf.d`, `sites-available`) 활성화 링크(`sites-enabled`)만 걸면 된다.

### 3-1) 공통: WebSocket 헤더 맵 추가

`/etc/nginx/conf.d/connection_upgrade.conf` 생성:

```nginx
map $http_upgrade $connection_upgrade {
  default upgrade;
  '' close;
}
```

### 3-2) Web: `<WEB_DOMAIN>` → Next(3000)

주의: **certbot 돌리기 전**에는 `listen 443 ssl ...` 서버 블록을 미리 만들지 마.
인증서 경로(`ssl_certificate`)가 없는 상태면 `sudo nginx -t`에서 바로 터진다.
일단 HTTP(80)로 프록시만 걸어두고, certbot이 HTTPS/리다이렉트를 자동으로 주입하게 하는 게 제일 안전해.

`/etc/nginx/sites-available/mywebtemplate-web.conf`:

```nginx
server {
  listen 80;
  server_name <WEB_DOMAIN>;

  client_max_body_size 20m;

  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
  }
}
```

### 3-3) API: `<API_DOMAIN>` → FastAPI(2000)

`/etc/nginx/sites-available/mywebtemplate-api.conf`:

```nginx
server {
  listen 80;
  server_name <API_DOMAIN>;

  client_max_body_size 20m;

  location / {
    proxy_pass http://127.0.0.1:2000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

활성화/검증:

```bash
sudo ln -sf /etc/nginx/sites-available/mywebtemplate-web.conf /etc/nginx/sites-enabled/mywebtemplate-web.conf
# 모드 A(서브도메인 2개)에서만:
sudo ln -sf /etc/nginx/sites-available/mywebtemplate-api.conf /etc/nginx/sites-enabled/mywebtemplate-api.conf
# (선택) 기본 사이트가 걸리적거리면 꺼버려
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 4) TLS(Let’s Encrypt)

```bash
# 모드 A(서브도메인 2개)
sudo certbot --nginx -d <WEB_DOMAIN> -d <API_DOMAIN>

# 모드 B(단일 도메인 1개)
sudo certbot --nginx -d <DOMAIN>
```

certbot 실행 중에 “HTTP → HTTPS redirect” 옵션 물어보면, 오빠는 보통 **redirect 켜는 쪽**이 맞아.

갱신 테스트:

```bash
sudo certbot renew --dry-run
```

---

## 5) 스모크 체크

```bash
# 모드 A(서브도메인 2개)
curl -I https://<API_DOMAIN>/healthz
curl -I https://<API_DOMAIN>/readyz
curl -I https://<WEB_DOMAIN>/

# 모드 B(단일 도메인 1개): API는 BFF 경유로 체크(Next가 /api/*를 쓰니까 Nginx에서 /api를 백엔드로 보내면 안 됨)
curl -I https://<DOMAIN>/api/bff/healthz
curl -I https://<DOMAIN>/api/bff/readyz
curl -I https://<DOMAIN>/
```

---

## 6) 템플릿 값(서버에서 바꿔야 하는 것)

- `backend/config.ini`:
  - `[AUTH].secret_key`는 운영 시크릿으로 교체
  - (모드 A: 브라우저에서 API를 직접 호출할 거면) `[CORS].allow_origins = https://<WEB_DOMAIN>`
- `frontend-web/config.ini`:
  - `[APP].backendHost`는 서버 내부면 `http://127.0.0.1:2000` 권장
  - (모드 A) API 도메인으로 직접 호출하고 싶으면 `https://<API_DOMAIN>`로 설정
  - (모드 B) 외부 공개는 `<DOMAIN>` 하나만. 브라우저는 `api.js`가 알아서 `/api/bff`로 보내니까 보통 손댈 거 없음
