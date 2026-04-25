# dolka-limona

Веб-приложение для визуализации заказов "Магнит" по временным срезам и кольцам вокруг Кремля.

## Ссылка на презентацию проекта:
https://disk.yandex.ru/i/jHPckv7I-8jEVA

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
