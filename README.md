# dolka-limona

Веб-приложение для визуализации заказов "Магнит" по временным срезам и кольцам вокруг Кремля.

## Что внутри

- `backend` — Kotlin, Spring Boot, Gradle
- `frontend` — React, Vite, Plotly, Nginx
- `docker-compose.yml` — локальный запуск через Docker Compose
- `docker-compose.prod.yml` — production-запуск с доменом и HTTPS через Caddy

## Что умеет сайт

- показывает кольцевую инфографику по Москве;
- переключает временной срез по дням недели и часам;
- меняет режим отображения:
  - процент опозданий;
  - время доставки;
  - количество заказов.

## Локальный запуск через Docker

```bash
docker compose up --build -d
```

После запуска:

- сайт: [http://localhost:8080](http://localhost:8080)
- API: [http://localhost:8081/api/stats/overview](http://localhost:8081/api/stats/overview)

## Как открыть сайт "онлайн" как обычный веб-сайт

Текущий `docker compose` уже собирает рабочее приложение, но оно доступно только локально на вашем компьютере.
Чтобы сайт работал в интернете как нормальный веб-сайт, нужен сервер с публичным IP и домен.

### Рекомендуемый вариант

1. Возьмите VPS или облачный сервер с Linux.
2. Привяжите домен к IP сервера через DNS.
3. Установите на сервер Docker и Docker Compose.
4. Склонируйте репозиторий на сервер.
5. В файле `Caddyfile` замените `example.com` на ваш домен.
6. Запустите production-конфиг:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

После этого:

- сайт будет открываться по `https://ваш-домен`
- HTTPS-сертификат Caddy получит автоматически
- backend не будет торчать наружу отдельным портом

## Production-конфигурация

В production-схеме:

- `frontend` обслуживает React-приложение;
- `frontend` проксирует `/api/*` во внутренний `backend`;
- `caddy` принимает внешний трафик на `80/443` и выдает HTTPS.

Это безопаснее и ближе к нормальной схеме публичного сайта, чем просто открывать `8080` и `8081` наружу.

## Локальная разработка без Docker

### Backend

Нужно:

- Java 17
- Gradle

Запуск:

```bash
cd backend
gradle bootRun
```

Backend поднимется на `http://localhost:8080`.

### Frontend

Нужно:

- Node.js 20+

Запуск:

```bash
cd frontend
npm install
npm run dev
```

Vite поднимет dev-сервер, но для полнофункционального режима удобнее использовать Docker Compose, потому что там уже настроен прокси на backend.

## Данные

### Графики Plotly

Сайт получает срезы из API и строит карту в браузере с помощью Plotly при открытии страницы и переключении показателя или времени. Готовые HTML-файлы из `analytics/output/` ему не нужны.

Для создания трёх HTML-графиков из `analytics/data/magnit_data.csv` выполните из корня репозитория:

```bash
python -m pip install -r analytics/requirements.txt
python analytics/charts/delivery_time_map.py
python analytics/charts/late_rate_map.py
python analytics/charts/order_count_map.py
```

Результаты сохраняются в `analytics/output/` как `delivery_time.html`, `late_rate.html` и `order_count.html`. Это генерируемые файлы, поэтому они не хранятся в Git.

CSV лежит здесь:

- [magnit_data.csv](C:/Users/User/Dev/dolka-limona/backend/src/main/resources/data/magnit_data.csv)

Основной endpoint:

```text
GET /api/stats/overview
```

## Полезно знать

- На локальной машине сайт уже работает как веб-приложение по `http://localhost:8080`.
- Для публикации на GitHub Pages этот проект в текущем виде не подходит, потому что у него есть backend API.
- Если нужен быстрый временный внешний доступ без сервера, можно использовать tunnel-сервисы вроде Cloudflare Tunnel или ngrok, но для нормального постоянного сайта лучше VPS + домен.
