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

## Графики Plotly

Сайт строит карту из данных API при открытии страницы и смене времени или показателя. Готовые HTML-файлы ему не нужны.

Чтобы создать все три HTML-графика из [`analytics/data/magnit_data.csv`](analytics/data/magnit_data.csv), выполните из корня репозитория:

```bash
python -m pip install -r analytics/requirements.txt
python analytics/charts/delivery_time_map.py
python analytics/charts/late_rate_map.py
python analytics/charts/order_count_map.py
```

Файлы `delivery_time.html`, `late_rate.html` и `order_count.html` появятся в `analytics/output/`. Эта папка исключена из Git.
