# Полная документация административного веб-API RemnaWave Bot

## 1. Общее описание

Административное веб-API проекта RemnaWave Bedolaga Telegram Bot реализовано на FastAPI (см. `app/webapi/app.py`). Оно предоставляет удаленный доступ ко всем операциям, которые выполняются из внутренней админ-панели: управление пользователями, подписками, промо-активностями, контентом и интеграцией с панелью RemnaWave.

Структура кода:
- `app/webapi/app.py` – сборка FastAPI-приложения и подключение роутеров.
- `app/webapi/server.py` – точка входа для запуска Uvicorn/Hypercorn.
- `app/webapi/routes/` – набор модулей с эндпоинтами (логика).
- `app/webapi/schemas/` – Pydantic-схемы запросов и ответов.
- `app/webapi/dependencies.py` – общие зависимости (авторизация, сессии БД).
- `app/webapi/middleware.py` – дополнительное middleware (логирование).
- `app/webapi/background/` – задачи фоновых очередей (например, бекапы).

## 2. Запуск и базовая конфигурация

Ключевые настройки читаются из `app/config.py` (класс `Settings`):
- `WEB_API_ENABLED` – включает HTTP-сервер.
- `WEB_API_HOST`, `WEB_API_PORT`, `WEB_API_WORKERS` – параметры запуска.
- `WEB_API_ALLOWED_ORIGINS` – список доменов для CORS (по умолчанию `["*"]`).
- `WEB_API_DOCS_ENABLED` – если `True`, доступны Swagger/Redoc (`/docs`, `/redoc`).
- `WEB_API_TITLE`, `WEB_API_VERSION` – метаданные OpenAPI.
- `WEB_API_REQUEST_LOGGING` – включает middleware `RequestLoggingMiddleware`.
- `WEB_API_DEFAULT_TOKEN`, `WEB_API_TOKEN_HASH_ALGORITHM` – настройка токенов по умолчанию.
- `WEB_API_ALLOWED_ORIGINS`, `WEB_API_DOCS_*` – управление документацией и CORS.

## 3. Аутентификация и авторизация

- Все административные эндпоинты требуют API-токен.
- Допустимые варианты передачи:
  - заголовок `X-API-Key: <token>`;
  - либо `Authorization: Bearer <token>`.
- Проверка выполняется в `require_api_token` (см. `dependencies.py`). Используется `web_api_token_service`:
  - токен сверяется по хешу;
  - статус и срок действия проверяются;
  - сохраняется информация о последнем использовании (`last_used_at`, `last_used_ip`).
- При отсутствии или неверном токене возвращается `401 Unauthorized`.
- Для некоторых операций возможен ответ `403 Forbidden` (например, попытка изменить read-only настройку).

## 4. Общие соглашения API

- **Формат данных:** JSON (`Content-Type: application/json`).
- **Дата/время:** ISO 8601 в UTC (`YYYY-MM-DDTHH:MM:SSZ`).
- **Денежные суммы:** в копейках (`*_kopeks`). В ответах часто дублируются рублевые значения (`*_rubles`).
- **Пагинация:** большинство перечислительных эндпоинтов принимают `limit` (1–200) и `offset` (>=0), возвращая `total`, `limit`, `offset`.
- **Параметры фильтрации:** чаще всего передаются через query (`status`, `user_id`, `search` и т.д.).
- **Ошибки:** стандартная схема FastAPI: `{"detail": "сообщение"}`. Возможные коды — `400`, `401`, `403`, `404`, `409`, `422`, `500`.
- **Модули и теги:** набор тегов определяется в константе `OPENAPI_TAGS` (`app/webapi/app.py`).

## 5. Справочник эндпоинтов

Ниже перечислены все доступные маршруты, сгруппированные по префиксам. Для краткости указаны основные поля схем — полный список можно найти в `app/webapi/schemas/*.py`.

### 5.1 Health (`/health`)

- **GET `/health`**
  - Назначение: состояние API, версия бота и флаги доступности.
  - Заголовок: API-токен обязателен.
  - Ответ: `HealthCheckResponse`
    - `status` (`ok`), `api_version`, `bot_version`.
    - `features`: `monitoring`, `maintenance`, `reporting`, `webhooks`.

### 5.2 Stats (`/stats`)

- **GET `/stats/overview`**
  - Назначение: агрегированная статистика (пользователи, подписки, support, платежи за сегодня).
  - Параметры: отсутствуют.
  - Ответ: объект с блоками `users`, `subscriptions`, `support`, `payments`.

### 5.3 Settings (`/settings`)

Использует `SettingDefinition`, `SettingCategorySummary`, `SettingUpdateRequest` (см. `schemas/config.py`).

- **GET `/settings/categories`**
  - Возвращает список категорий (`key`, `label`, `items`).
- **GET `/settings`**
  - Query: `category` (опционально).
  - Ответ: массив `SettingDefinition` (ключ, отображаемое имя, категория, текущие/дефолтные значения, тип, выборки).
- **GET `/settings/{key}`**
  - Ответ: отдельный `SettingDefinition`.
- **PUT `/settings/{key}`**
  - Тело: `SettingUpdateRequest` (`value`: любое JSON значение).
  - Ошибки: `403` при попытке изменить read-only ключ.
- **DELETE `/settings/{key}`**
  - Сбрасывает настройку к дефолту.

### 5.4 Users (`/users`)

Схемы: `UserListResponse`, `UserResponse`, `UserCreateRequest`, `UserUpdateRequest`, `BalanceUpdateRequest` (см. `schemas/users.py`).

- **GET `/users`**
  - Query: `limit`, `offset`, `status` (`UserStatus`), `promo_group_id`, `search`.
  - Ответ: список пользователей c привязкой подписки и промо-группы.
- **GET `/users/{user_id}`**
  - Возвращает `UserResponse` с вложенными summary по подписке и промо-группе.
- **POST `/users`**
  - Тело: `UserCreateRequest` (минимум `telegram_id`; опционально язык и промо-группа).
  - Ответ: созданный пользователь.
- **PATCH `/users/{user_id}`**
  - Тело: `UserUpdateRequest` (частичное обновление).
- **POST `/users/{user_id}/balance`**
  - Тело: `BalanceUpdateRequest` (`amount_kopeks`, `description`, `create_transaction`).
  - Результат: обновленный пользователь; баланс изменяется (может быть отрицательный `amount` для списаний).

### 5.5 Subscriptions (`/subscriptions`)

Схемы: `SubscriptionResponse`, `SubscriptionCreateRequest`, `SubscriptionExtendRequest`, `SubscriptionTrafficRequest`, `SubscriptionDevicesRequest`, `SubscriptionSquadRequest` (см. `schemas/subscriptions.py`).

- **GET `/subscriptions`**
  - Query: `limit`, `offset`, `status` (`SubscriptionStatus`), `user_id`, `is_trial`.
- **GET `/subscriptions/{subscription_id}`**
  - Возвращает расширенный ответ по подписке (включая подключенные сквады).
- **POST `/subscriptions`**
  - Тело: `SubscriptionCreateRequest`
    - обязательные поля: `user_id`, `duration_days`;
    - опции: `traffic_limit_gb`, `device_limit`, `connected_squads`, `is_trial`.
- **POST `/subscriptions/{id}/extend`**
  - Тело: `SubscriptionExtendRequest` (`days`, `reset_used_traffic`, `update_subscription_link`).
- **POST `/subscriptions/{id}/traffic`**
  - Тело: `SubscriptionTrafficRequest` (`additional_gb`, `reset_usage`).
- **POST `/subscriptions/{id}/devices`**
  - Тело: `SubscriptionDevicesRequest` (`additional_devices`).
- **POST `/subscriptions/{id}/squads`**
  - Тело: `SubscriptionSquadRequest` (список `squad_uuid`).
- **DELETE `/subscriptions/{id}/squads/{squad_uuid}`**
  - Удаляет подключенный сквад.

### 5.6 Tickets (`/tickets`)

Схемы: `TicketListResponse`, `TicketResponse`, `TicketStatusUpdateRequest`, `TicketPriorityUpdateRequest`, `TicketReplyBlockRequest` (см. `schemas/tickets.py`).

- **GET `/tickets`**
  - Query: `limit`, `offset`, `status` (`TicketStatus`), `priority`, `user_id`.
  - Ответ содержит сообщения тикета (`TicketMessageResponse`).
- **GET `/tickets/{ticket_id}`**
  - Полный тикет с историей сообщений.
- **POST `/tickets/{id}/status`**
  - Тело: `TicketStatusUpdateRequest` (`status`).
- **POST `/tickets/{id}/priority`**
  - Тело: `TicketPriorityUpdateRequest` (`priority`).
- **POST `/tickets/{id}/reply-block`**
  - Тело: `TicketReplyBlockRequest` (`permanent`, `until`).
- **DELETE `/tickets/{id}/reply-block`**
  - Снимает блокировку на ответы пользователя.

### 5.7 Transactions (`/transactions`)

Схемы: `TransactionListResponse`, `TransactionResponse` (см. `schemas/transactions.py`).

- **GET `/transactions`**
  - Query: `limit`, `offset`, `user_id`, `type` (`TransactionType`), `payment_method`, `is_completed`, `date_from`, `date_to`.
  - Возвращает историю финансовых операций (депозиты, списания, промо и т.д.).

### 5.8 Promo groups (`/promo-groups`)

Схемы: `PromoGroupResponse`, `PromoGroupListResponse`, `PromoGroupCreateRequest`, `PromoGroupUpdateRequest` (см. `schemas/promo_groups.py`).

- **GET `/promo-groups`**
  - Query: `limit`, `offset`.
- **GET `/promo-groups/{group_id}`**
  - Возвращает группу и её правила скидок.
- **POST `/promo-groups`**
  - Тело: `PromoGroupCreateRequest` (название, ограничения, скидки, auto-assign флаги).
- **PATCH `/promo-groups/{group_id}`**
  - Тело: `PromoGroupUpdateRequest`.
- **DELETE `/promo-groups/{group_id}`**
  - Удаляет промо-группу (если возможно).

### 5.9 Promo offers (`/promo-offers`)

Схемы: `PromoOfferResponse`, `PromoOfferListResponse`, `PromoOfferCreateRequest`, `PromoOfferLogResponse`, `PromoOfferTemplateResponse`, `PromoOfferTemplateUpdateRequest` (см. `schemas/promo_offers.py`).

- **GET `/promo-offers`**
  - Query: `limit`, `offset`, `user_id`, `notification_type`, `is_active`.
- **POST `/promo-offers`**
  - Тело: `PromoOfferCreateRequest` (определяет цель, вид бонуса, сроки, каналы доставки).
- **GET `/promo-offers/logs`**
  - Query: `limit`, `offset`, `user_id`, `offer_id`, `action`, `source`.
  - Журнал событий по промо-предложениям.
- **GET `/promo-offers/templates`**
  - Список используемых шаблонов предложений.
- **GET `/promo-offers/templates/{template_id}`**, **PATCH** того же пути – просмотр и обновление шаблона.
- **GET `/promo-offers/{offer_id}`**
  - Полная информация по конкретному предложению.

### 5.10 Promo codes (`/promo-codes`)

Схемы: `PromoCodeListResponse`, `PromoCodeResponse`, `PromoCodeDetailResponse`, `PromoCodeCreateRequest`, `PromoCodeUpdateRequest` (см. `schemas/promocodes.py`).

- **GET `/promo-codes`**
  - Query: `limit`, `offset`, `is_active`.
- **GET `/promo-codes/{id}`** – подробности, включая связанные пользователи.
- **POST `/promo-codes`** – создание промокода (`PromoCodeCreateRequest`).
- **PATCH `/promo-codes/{id}`** – обновление.
- **DELETE `/promo-codes/{id}`** – удаление.

### 5.11 Main menu buttons (`/main-menu/buttons`)

Схемы: `MainMenuButtonListResponse`, `MainMenuButtonResponse`, `MainMenuButtonCreateRequest`, `MainMenuButtonUpdateRequest` (см. `schemas/main_menu_buttons.py`).

- **GET** – список кнопок (пагинация).
- **POST** – создать кнопку (`text`, `action_type`, `action_value`, `visibility`, `is_active`, `display_order`).
- **PATCH `/{button_id}`** – обновить атрибуты.
- **DELETE `/{button_id}`** – удалить кнопку.

### 5.12 Pages (`/pages`)

Схемы: `RichTextPageResponse`, `FaqPageResponse`, `FaqPageListResponse`, `FaqPageCreateRequest`, `FaqPageUpdateRequest`, `FaqReorderRequest`, `FaqStatusResponse`, `ServiceRulesResponse`, `ServiceRulesHistoryResponse` и др. (см. `schemas/pages.py`).

- **Public offer:**  
  - `GET /pages/public-offer` (query: `language`, `fallback`, `include_disabled`).  
  - `PUT /pages/public-offer` с `RichTextPageUpsertRequest`.
- **Privacy policy:** аналогичные `GET/PUT /pages/privacy-policy`.
- **FAQ:**  
  - `GET /pages/faq` – список страниц (query `language`, `include_inactive`, `fallback`).  
  - `POST /pages/faq` – создать (`FaqPageCreateRequest`).  
  - `GET/PUT/DELETE /pages/faq/{page_id}`.  
  - `POST /pages/faq/reorder` – изменяет порядок (`FaqReorderRequest`).  
  - `GET/PUT /pages/faq/status` – глобальный статус FAQ.
- **Service rules:**  
  - `GET /pages/service-rules`, `PUT`, `DELETE`.  
  - `GET /pages/service-rules/history` (query `limit`).  
  - `POST /pages/service-rules/history/{rule_id}/restore` – восстановление версии.

### 5.13 Broadcasts (`/broadcasts`)

Схемы: `BroadcastCreateRequest`, `BroadcastResponse`, `BroadcastListResponse` (`schemas/broadcasts.py`).

- **POST `/broadcasts`**
  - Тело: `BroadcastCreateRequest` (целевая аудитория, текст, кнопки, медиа).
  - Требуется токен (используется `token.id` как создатель).
- **GET `/broadcasts`**
  - Query: `limit`, `offset`.
  - Возвращает существующие рассылки.
- **POST `/broadcasts/{broadcast_id}/stop`**
  - Останавливает активную рассылку.

### 5.14 Backups (`/backups`)

Схемы: `BackupCreateResponse`, `BackupListResponse`, `BackupStatusResponse`, `BackupTaskListResponse` (`schemas/backups.py`).

- **POST `/backups`**
  - Планирует создание бекапа (возвращает `task_id`, `status`).
- **GET `/backups`**
  - Query: `limit`, `offset`.
- **GET `/backups/status/{task_id}`**
  - Статус конкретной задачи.
- **GET `/backups/tasks`**
  - Query: `active_only` – активные задачи бекапов.

### 5.15 Campaigns (`/campaigns`)

Схемы: `CampaignCreateRequest`, `CampaignUpdateRequest`, `CampaignResponse`, `CampaignListResponse` (`schemas/campaigns.py`).

- **POST `/campaigns`** – создание кампании (уникальный `start_parameter`).
- **GET `/campaigns`**
  - Query: `limit`, `offset`, `include_inactive`.
- **PATCH `/campaigns/{id}`** – частичное обновление (название, бонусы, активность).
- **DELETE `/campaigns/{id}`** – удаление.

### 5.16 Tokens (`/tokens`)

Схемы: `TokenResponse`, `TokenCreateRequest` (`schemas/tokens.py`).

- **GET `/tokens`** – список действующих токенов.
- **POST `/tokens`** – создать новый (`name`, `description`, `expires_at`). Возвращает plaintext токен.
- **POST `/tokens/{id}/revoke`** – деактивировать.
- **POST `/tokens/{id}/activate`** – повторно активировать.
- **DELETE `/tokens/{id}`** – удалить.

### 5.17 Transactions (`/transactions`)

Уже рассмотрено в разделе 5.7 (см. выше).

### 5.18 RemnaWave интеграция (`/remnawave`)

Схемы: см. `schemas/remnawave.py` (очень обширный набор моделей: `RemnaWaveStatusResponse`, `RemnaWaveNode`, `RemnaWaveSquad`, `Sync*` запросы и т.д.).

Основные группы эндпоинтов:
- **Статус панели**
  - `GET /remnawave/status` – пинг панели (конфиг, версия).
  - `GET /remnawave/system` – общие системные показатели.
- **Ноды**
  - `GET /remnawave/nodes` – список.
  - `GET /remnawave/nodes/realtime` – моментальные показатели.
  - `GET /remnawave/nodes/{uuid}` – детали.
  - `GET /remnawave/nodes/{uuid}/statistics` – исторические метрики.
  - `GET /remnawave/nodes/{uuid}/usage` – трафик за интервал (`start`, `end` query ISO datetimes).
  - `POST /remnawave/nodes/{uuid}/actions` – управление (рестарт, снять из оборота и пр.; тело `NodeActionRequest`).
  - `POST /remnawave/nodes/restart` – массовый рестарт.
- **Сквады**
  - `GET /remnawave/squads` – список сквадов.
  - `GET /remnawave/squads/{uuid}` – детали.
  - `POST /remnawave/squads` – создание (`RemnaWaveSquadCreateRequest`).
  - `PATCH /remnawave/squads/{uuid}` – обновление (`RemnaWaveSquadUpdateRequest`).
  - `POST /remnawave/squads/{uuid}/actions` – операции (включить/отключить, пересчитать пользователей).
  - `GET /remnawave/squads/{uuid}/migration-preview` – оценка миграции (query: `target_uuid` и пр.).
  - `POST /remnawave/squads/migrate` – миграция пользователей между сквадами.
- **Пользовательский трафик**
  - `GET /remnawave/users/{telegram_id}/traffic` – usage по конкретному пользователю.
- **Синхронизация**
  - `POST /remnawave/sync/from-panel` – синхронизация подписок/пользователей из панели (`RemnaWaveSyncRequest`).
  - `POST /remnawave/sync/to-panel` – выгрузка изменений в панель.
  - `POST /remnawave/sync/subscriptions/validate` – проверка несоответствий.
  - `POST /remnawave/sync/subscriptions/cleanup` – удаление сиротских подписок (только в панели).
  - `POST /remnawave/sync/subscriptions/statuses` – выравнивание статусов.
  - `GET /remnawave/sync/recommendations` – подсказки по устранению несоответствий.

Каждый запрос возвращает развёрнутые структуры с детализацией по сквадам, inbounds, пользователям и результатам синхронизации.

### 5.19 Mini App (`/miniapp`)

Этот модуль обслуживает Telegram Mini App (пользовательский интерфейс). Все запросы — POST с телом, включающим контекст (`MiniAppContext`), поэтому авторизация отличается:
- В заголовках токен не используется (эндпоинты вызываются ботом).
- Контекст включает `init_data` (подписанное Telegram payload), `language`, `user_id`, `subscription_id` и т.д.
- Основные схемы описаны в `schemas/miniapp.py` (много моделей; ключевые: `MiniAppRequestContext`, `MiniAppPaymentMethodRequest`, `MiniAppSubscriptionResponse`, `MiniAppPaymentCreateRequest`, `MiniAppPromoActivationRequest` и др.).

Основные группы:
- **Платежи**  
  - `POST /miniapp/payments/methods` – получить доступные методы (`MiniAppPaymentMethodResponse`).
  - `POST /miniapp/payments/create` – сформировать ссылку (`MiniAppPaymentCreateRequest`).  
  - `POST /miniapp/payments/status` – массовая проверка статусов.
- **Подписка**  
  - `POST /miniapp/subscription` – основные данные подписки.  
  - `POST /miniapp/subscription/autopay` – управление автопродлением.  
  - `POST /miniapp/subscription/trial` – активация trial.  
  - `POST /miniapp/subscription/renewal/options` и `/renewal` – продление.  
  - `POST /miniapp/subscription/purchase/options`, `/purchase/preview`, `/purchase` – покупка новой подписки через miniapp.  
  - `POST /miniapp/subscription/settings` – настройки (`MiniAppSubscriptionSettingsResponse`).  
  - `POST /miniapp/subscription/servers`, `/traffic`, `/devices` – изменение параметров подписки.
- **Промо**  
  - `POST /miniapp/promo-codes/activate` – активация промокода.  
  - `POST /miniapp/promo-offers/{offer_id}/claim` – получение промо-предложения.
- **Устройства**  
  - `POST /miniapp/devices/remove` – отключение устройства (поддерживает OTP-код).

Каждый ответ содержит поля `success`, `message`, `subscription`/`payment` и др., см. подробные схемы.

### 5.20 Дополнительные модули

- **Transactions** – см. раздел 5.7.
- **Campaigns, Broadcasts, Backups, Tokens** – см. соответствующие разделы.
- **Miniapp** – описан выше.

## 6. Управление авторизационными токенами

- Создать новый токен можно через `POST /tokens`.
- Ответ включает `token` (plain-text) и `prefix`. Plain-text значение **храните сразу**, повторно получить нельзя.
- Токены можно ревокировать и активировать повторно (`/tokens/{id}/revoke`, `/activate`).
- Для аудита см. поля `last_used_at`, `last_used_ip`.

## 7. Фоновые процессы и бекапы

- Создание бекапа асинхронно: `POST /backups` возвращает `task_id`, далее статус доступен по `GET /backups/status/{task_id}`.
- Дополнительно можно отслеживать активные задачи (`GET /backups/tasks`).
- Резервные копии сохраняются через `backup_service` и содержат метаданные (размер, количество таблиц, ошибку, автора).

## 8. Интеграция c RemnaWave панелью

- Большинство RemnaWave-эндпоинтов требуют активной панели, настроенной в конфигурации (`REMNAWAVE_*` переменные).
- При выполнении синхронизаций стоит учитывать, что операции долгиe и могут возвращать большие JSON объёмы; целесообразно пагинировать на стороне клиента.
- Управление нодами и сквадами изменяет состояние внешней панели, поэтому рекомендуется использовать сервисные токены с ограниченным доступом.

## 9. Типичные ответы и коды ошибок

- `200 OK` – успешный запрос (GET/POST с результатом).
- `201 Created` – создание ресурса (пользователь, промокод, кнопка меню и т.д.).
- `202 Accepted` – задачи, выполняющиеся асинхронно (бекапы).
- `204 No Content` – удаление или операции без тела ответа.
- `400 Bad Request` – неверные параметры (например, дублирующий `start_parameter` кампании).
- `401 Unauthorized` – нет токена или он недействителен.
- `403 Forbidden` – попытка изменить защищенный ресурс (read-only настройка).
- `404 Not Found` – ресурс не найден (пользователь, сквад, тикет и т.д.).
- `409 Conflict` – бизнес-конфликт (например, промокод уже существует).
- `422 Unprocessable Entity` – валидация Pydantic (неверные типы/формат).

## 10. Рекомендации клиентским разработчикам

- Всегда кэшируйте список настроек/категорий или используйте условные запросы: `GET /settings` возвращает большой объём.
- Для пагинационных ресурсов используйте `limit` и `offset`, при необходимости стройте курсоры на клиенте.
- При генерации отчётов полагайтесь на `/stats/overview` или агрегируйте данные самостоятельно через `/transactions`, `/users`, `/subscriptions`.
- Используйте `/promo-offers/logs` и `PromoOfferTemplate*` для управления коммуникациями вместо прямых SQL.
- Для MiniApp:
  - передавайте `init_data` без изменений – сервер самостоятельно валидирует подпись Telegram;
  - следите за версией схем (`MiniAppVersionInfo` внутри ответов) – при изменениях сервер высылает флаги совместимости.
- При работе с RemnaWave синхронизациями выполняйте операции последовательно и проверяйте рекомендации (`GET /remnawave/sync/recommendations`) перед массовыми миграциями.

## 11. Где искать дополнительные сведения

- Схемы: `app/webapi/schemas/*.py` – полный набор полей и типов.
- Бизнес-логика маршрутов: `app/webapi/routes/*.py`.
- Сервисы, выполняющие основную работу: `app/services/*` (например, `subscription_purchase_service`, `promo_offer_service`, `remnawave_service`).
- Общие утилиты и интеграции: `app/utils`, `app/external`.

Документация выше охватывает все маршруты, доступные в текущей кодовой базе (commit на момент подготовки документа). При добавлении новых эндпоинтов рекомендуется синхронно обновлять этот файл.

## 12. Карта функций для веб-админки

Ниже приведено сопоставление предполагаемых экранов/виджетов будущей web-панели с API-эндпоинтами.

| Раздел интерфейса | Основные запросы | Дополнительно |
| ----------------- | ---------------- | ------------- |
| **Дашборд** | `GET /health`, `GET /stats/overview` | отображение версии, счетчиков, предупреждений |
| **Пользователи** | `GET /users`, `GET /users/{id}`, `POST /users`, `PATCH /users/{id}`, `POST /users/{id}/balance` | фильтры по статусу, поиску; модал баланс-корректировки |
| **Подписки** | `GET /subscriptions`, `GET /subscriptions/{id}`, `POST /subscriptions`, `POST /subscriptions/{id}/extend`, `POST /subscriptions/{id}/traffic`, `POST /subscriptions/{id}/devices`, `POST /subscriptions/{id}/squads`, `DELETE /subscriptions/{id}/squads/{uuid}` | карточка подписки + виджеты продления, доп. услуг |
| **Support (тикеты)** | `GET /tickets`, `GET /tickets/{id}`, `POST /tickets/{id}/status`, `POST /tickets/{id}/priority`, `POST /tickets/{id}/reply-block`, `DELETE /tickets/{id}/reply-block` | для ответов на тикеты используется телеграм-бот; API управляет только статусами/блокировками |
| **Биллинг / Транзакции** | `GET /transactions` | таблица с фильтрами, экспорт в CSV на клиенте |
| **Промо-группы** | `GET/POST/PATCH/DELETE /promo-groups` | в UI предусмотреть редактор скидок и ограничений |
| **Промо-предложения** | `GET/POST /promo-offers`, `GET /promo-offers/logs`, `GET/PATCH /promo-offers/templates` | журнал для аудита, превью коммуникаций |
| **Промокоды** | `GET/POST/PATCH/DELETE /promo-codes`, `GET /promo-codes/{id}` | создание кампаний и отслеживание активаций |
| **Кампании** | `GET/POST/PATCH/DELETE /campaigns` | управление deep-link кампаниями и бонусами |
| **Рассылки** | `GET /broadcasts`, `POST /broadcasts`, `POST /broadcasts/{id}/stop` | конструктор рассылок, просмотр статусов |
| **Главное меню бота** | `GET/POST/PATCH/DELETE /main-menu/buttons` | drag-n-drop сортировка, фильтрация по видимости |
| **Контент страниц (оферта, политика, FAQ, правила)** | `GET/PUT /pages/public-offer`, `GET/PUT /pages/privacy-policy`, `GET/POST/PUT/DELETE /pages/faq`, `POST /pages/faq/reorder`, `GET/PUT /pages/faq/status`, `GET/PUT/DELETE /pages/service-rules`, `GET /pages/service-rules/history`, `POST /pages/service-rules/history/{id}/restore` | редакторы Markdown/HTML, история версий правил |
| **Бекапы** | `POST /backups`, `GET /backups`, `GET /backups/status/{task_id}`, `GET /backups/tasks` | статус задач, скачивание файлов по возвращаемому пути |
| **Настройки бота** | `GET /settings/categories`, `GET /settings`, `GET/PUT/DELETE /settings/{key}` | дерево категорий, формы какого-либо типа (строка, число, bool, выбор) |
| **API токены** | `GET/POST /tokens`, `POST /tokens/{id}/revoke`, `POST /tokens/{id}/activate`, `DELETE /tokens/{id}` | генерация токенов, просмотр last-used |
| **RemnaWave интеграция** | множество из `/remnawave/...` | мониторинг нод, сквадов, запуск синхронизаций |
| **MiniApp мониторинг** | эндпоинты `/miniapp/...` | используется самим мини-аппом; можно строить аналитические графики по ответам |

### UI-паттерны и состояния

1. **Загрузка данных**  
   - Использовать optimistic UI только там, где сервер делает быструю операцию (например, PATCH настройки).  
   - Для долгих процессов (бекапы, синхронизация RemnaWave) отображать прогресс-бар с периодическим опросом.

2. **Формы**  
   - Для каждого типа настройки (`SettingDefinition.type`) выбирать компонент: `bool` → toggle, `int`/`float` → числовое поле, `optional[...]` → допускает пустое значение, `choices` → select.

3. **Ошибки**  
   - `400` и `422` отображать как валидационные (подсветка полей).
   - `401` → редирект на экран входа (/token).
   - `403` → запрещено (например, read-only настройка) – показывать тост с текстом.

4. **Модули с кэшированием**  
   - Главные меню и настройки имеют внутренние кэши; после изменения стоит перезагружать данные (например, повторный `GET`).

## 13. Типовые сценарии (пошагово)

### 13.1 Создание пользователя и выдача подписки
1. `POST /users` с `telegram_id` и базовыми данными.
2. `POST /subscriptions` и в теле указать `user_id`, `duration_days`, лимиты.
3. При необходимости сразу добавить сквады (`POST /subscriptions/{id}/squads`) или трафик (`POST .../traffic`).

### 13.2 Пополнение баланса администратором
1. Открыть карточку пользователя (`GET /users/{id}`).
2. Отправить `POST /users/{id}/balance` с `amount_kopeks` (положительное или отрицательное) и описанием.
3. В UI рекомендуется отобразить подтверждение и актуализировать баланс новым `GET`.

### 13.3 Управление промокодом
1. `POST /promo-codes` → резервирование кода и конфигурации.
2. `PATCH /promo-codes/{id}` при изменении сроков, ограничений.
3. Отслеживать активации через `GET /promo-codes/{id}` (в ответе список пользователей и статистика).

### 13.4 Публикация изменений FAQ
1. Список страниц: `GET /pages/faq`.
2. Создать/обновить страницу: `POST` или `PUT`.
3. Изменить порядок: `POST /pages/faq/reorder`.
4. Управлять статусом видимости: `GET/PUT /pages/faq/status`.

### 13.5 Контроль RemnaWave
1. Проверить статус панели: `GET /remnawave/status`.
2. Получить список нод: `GET /remnawave/nodes`.
3. Выполнить действие (например, рестарт): `POST /remnawave/nodes/{uuid}/actions` с `{"action": "restart"}`.
4. Отследить синхронизацию: `POST /remnawave/sync/from-panel` или `.../cleanup`, после чего сверить рекомендации.

## 14. Архитектурные заметки для web-панели

- **Стек авторизации**: web UI может хранить токен API в хранилище браузера (localStorage/IndexedDB). Необходимо предусмотреть страницу входа с полем ввода токена и опциональной генерацией через админку.
- **Менеджмент состояния**: рекомендуем выделить модуль API-клиента, оборачивающий fetch/axios и автоматически добавляющий заголовок `X-API-Key`.
- **Глобальное логирование**: ловить ответные заголовки `X-Request-ID` (если подключено middleware) для отладки.
- **Мульти-тенантность**: некоторых пользователям лучше выдавать рид-онли токены (см. поля `is_active`, `created_by` для `/tokens`).
- **Локализация**: многие эндпоинты поддерживают параметр `language` (`ru`, `en`). UI должен позволять отправлять выбранный язык (особенно в `/pages` и `/miniapp`).
- **Сетевые таймауты**: для тяжелых операций (RemnaWave sync, backups) выставлять увеличенный timeout (до 120 сек), а UI – показывать индикаторы ожидания.

## 15. Примеры запросов

```bash
# Получить список активных пользователей
curl -H "X-API-Key: $TOKEN" \
  "https://host/api/users?limit=50&status=active"

# Пополнить баланс на 500 ₽ (50000 копеек)
curl -X POST -H "X-API-Key: $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"amount_kopeks": 50000, "description": "Manual top-up"}' \
     "https://host/api/users/123/balance"

# Создать подписку на 30 дней безлимит
curl -X POST -H "X-API-Key: $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"user_id":123,"duration_days":30,"traffic_limit_gb":0,"device_limit":3}' \
     "https://host/api/subscriptions"
```

Эти примеры можно использовать в качестве шаблонов для реализации API-клиента в web-панели.

---

Документ рекомендуется поддерживать в актуальном состоянии: при добавлении/изменении эндпоинтов следует обновлять соответствующие разделы и примеры.
5. **subscriptions** - `/subscriptions/*` - управление подписками
6. **support** - `/tickets/*` - работа с тикетами поддержки
7. **transactions** - `/transactions/*` - история финансовых операций
8. **promo-groups** - `/promo-groups/*` - управление промо-группами
9. **promo-offers** - `/promo-offers/*` - управление промо-предложениями
10. **main-menu** - `/main-menu/buttons/*` - управление кнопками главного меню
11. **pages** - `/pages/*` - управление публичными страницами (оферта, политика, FAQ)
12. **promo-codes** - `/promo-codes/*` - управление промокодами
13. **broadcasts** - `/broadcasts/*` - рассылки
14. **backups** - `/backups/*` - управление бекапами
15. **campaigns** - `/campaigns/*` - кампании
16. **auth** - `/tokens/*` - управление токенами доступа
17. **remnawave** - `/remnawave/*` - интеграция с Remnawave
18. **miniapp** - `/miniapp/*` - эндпоинты для Telegram Mini App

### 4. Авторизация и безопасность

API использует токен-базированную аутентификацию:
- Токены хранятся в базе данных
- Поддерживаются разные типы токенов с разными уровнями доступа
- Используется зависимость `require_api_token` для защиты эндпоинтов
- Токены могут быть выпущены, отозваны и реактивированы через эндпоинты `/tokens/*`

### 5. Интеграция с основным приложением

API интегрирован в основное приложение (main.py):
- Запускается как отдельный uvicorn-сервер в асинхронной задаче
- Использует ту же базу данных, что и основной бот
- Использует ту же систему конфигурации и логирования
- Работает параллельно с основным polling-циклом бота

### 6. Особенности реализации

- Поддержка CORS для веб-приложений
- Логирование запросов (опционально)
- Swagger UI с возможностью авторизации
- Структурированные схемы данных Pydantic
- Интеграция с системой мониторинга и уведомлений бота

## Заключение

Веб-API представляет собой полнофункциональный интерфейс для удаленного управления ботом. Он позволяет:
- Управлять пользователями и их подписками
- Проводить рассылки
- Управлять промо-акциями
- Проверять статистику
- Работать с тикетами поддержки
- Управлять конфигурацией бота
- Интегрироваться с внешними системами

API безопасен, использует токен-базированную аутентификацию и имеет хорошую документацию через Swagger UI.
