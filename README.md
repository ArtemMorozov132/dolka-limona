# dolka-limona

Веб-приложение для визуализации заказов "Магнит" по временным срезам и кольцам вокруг Кремля.

Стек:
- `backend`: Kotlin + Spring Boot + Gradle
- `frontend`: React + Vite + Plotly
- `infra`: Docker Compose

Что умеет:
- показывает одну карту-график по кольцам Москвы;
- меняет срез по ползунку времени `день + час`;
- переключает режим визуализации:
  - процент опозданий;
  - среднее время доставки;
  - количество заказов.

Запуск через Docker:

```bash
docker compose up --build
```

После запуска:
- фронтенд: `http://localhost:8080`
- backend API: `http://localhost:8081/api/stats/overview`

Локальная разработка:

1. Для backend нужен установленный `Gradle` и `Java 17`.
2. Для frontend нужен `Node.js`.
3. CSV уже лежит в `backend/src/main/resources/data/magnit_data.csv`.

Основной endpoint:

```text
GET /api/stats/overview
```
