# UI–API Contract

**Verzió: 1.1**

<!-- MARK: Registration -->
## 1. Registration

Egy felhasználó adott játékhoz tartozó regisztrációjának adatai.

```
{
  "registration_id": 25,
  "game_id": 1,
  "google_id": "google-user-id",
  "email": "player@example.com",
  "display_name": "Teszt Játékos",
  "role": "player",
  "registered_at": "2026-11-15T12:00:00"
}
```

| Mező              | Típus   | Leírás                                   |
| ----------------- | ------- | ---------------------------------------- |
| `registration_id` | integer | A regisztráció adatbázisbeli azonosítója |
| `game_id`         | integer | A játék azonosítója                      |
| `google_id`       | string  | A felhasználó Google-azonosítója         |
| `email`           | string  | A felhasználó e-mail-címe                |
| `display_name`    | string  | A felhasználó megjelenített neve         |
| `role`            | string  | Szerepkör: `player` vagy `admin`         |
| `registered_at`   | string  | A regisztráció időpontja (ISO 8601)      |

Egy felhasználó ugyanahhoz a játékhoz csak egyszer regisztrálhat. A regisztráció egy játékhoz kötődik.

<!-- MARK: Game -->
## 2. Game

Az aktuális játék konfigurációja.

```
{
  "game_id": 1,
  "name": "Adventi történelmi kvíz",
  "description": "Napi történelmi kérdések advent idején.",
  "asset_path": "/assets/history/",
  "publish_question": "6",
  "deadline_delay": "8",
  "publish_correct_answers": true,
  "publish_answer_delay": 8,
  "is_active": true
}
```

| Mező                      | Típus       | Leírás                                      |
| ------------------------- | ----------- | ------------------------------------------- |
| `game_id`                 | integer     | Játékazonosító                              |
| `name`                    | string      | Játék neve                                  |
| `description`             | string/null | Játék leírása                               |
| `asset_path`              | string/null | Statikus fájlok alapútvonala                |
| `deadline_time`           | string      | Napi válaszadási határidő (`HH:mm:ss`)      |
| `publish_correct_answers` | boolean     | Helyes válaszok közzététele engedélyezett-e |
| `publish_delay_hours`     | integer     | Közzététel késleltetése órában              |
| `is_active`               | boolean     | A játék aktív állapota                      |

<!-- MARK: Card -->
## 3. Card

Egy kvízkártya adatai.

```
{
  "card_id": 12,
  "card_date": "2026-12-01",
  "state": "available",
  "title": "Az első adventi kérdés",
  "image_path": "images/card01.jpg",
  "question": "Melyik évben koronázták meg Szent Istvánt?",
  "question_type": "multiple_choice",
  "options": ["895", "1000", "1001", "1038"],
  "answer": "2",
  "correct_answer": "2"
}
```

| Mező             | Típus         | Leírás                                        |
| ---------------- | ------------- | --------------------------------------------- |
| `card_id`        | integer       | Kártyaazonosító                               |
| `card_date`      | string        | Kártya dátuma (`YYYY-MM-DD`)                  |
| `state`          | string        | Állapot: `locked`, `available` vagy `expired` |
| `title`          | string        | Kártya címe                                   |
| `image_path`     | string/null   | Kép elérési útvonala                          |
| `question`       | string        | Kérdés szövege                                |
| `question_type`  | string        | Kérdéstípus: `multiple_choice` vagy `text`    |
| `options`        | string[]/null | Négy válaszlehetőség vagy `null`              |
| `answer`         | string        | Játékos válasza; válasz hiányában `""`        |
| `correct_answer` | string        | Helyes válasz                                 |

<!-- MARK: Cards -->
## 4. Cards

A játék kártyáinak tömbje.

```
[
  {
    "card_id": 12,
    "card_date": "2026-12-01",
    "state": "available",
    "title": "Az első adventi kérdés",
    "image_path": "images/card01.jpg",
    "question": "Melyik évben koronázták meg Szent Istvánt?",
    "question_type": "multiple_choice",
    "options": ["895", "1000", "1001", "1038"],
    "answer": "2",
    "correct_answer": "2"
  }
]
```

A tömb elemei `Card` objektumok. A sorrendet a `card_date` növekvő értéke határozza meg.

<!-- MARK: PlayerAnswer -->
## 5. PlayerAnswer

Egy játékos által beküldött válasz.

```
{
  "card_id": 12,
  "answer": "2"
}
```

| Mező      | Típus   | Leírás                            |
| --------- | ------- | --------------------------------- |
| `card_id` | integer | A megválaszolt kártya azonosítója |
| `answer`  | string  | A játékos válasza                 |

<!-- MARK: PlayerResult -->
## 6. PlayerResult

Egy játékos eredménye és válaszai.

```
{
  "registration_id": 25,
  "display_name": "Teszt Játékos",
  "score": 3,
  "answers": [
    {
      "card_id": 12,
      "card_date": "2026-12-01",
      "answer": "2",
      "is_correct": true,
      "admin_evaluation": null
    }
  ]
}
```

| Mező              | Típus   | Leírás                                |
| ----------------- | ------- | ------------------------------------- |
| `registration_id` | integer | Regisztrációazonosító; csak adminnak  |
| `display_name`    | string  | Játékos neve                          |
| `score`           | integer | API által számított pontszám          |
| `answers`         | array   | A játékos kártyákhoz tartozó válaszai |

Az `answers` elemeinek mezői:

| Mező               | Típus        | Leírás                                 |
| ------------------ | ------------ | -------------------------------------- |
| `card_id`          | integer      | Kártyaazonosító                        |
| `card_date`        | string       | Kártya dátuma                          |
| `answer`           | string       | Beküldött válasz; válasz hiányában `–` |
| `is_correct`       | boolean/null | Automatikus értékelés                  |
| `admin_evaluation` | boolean/null | Admin által megadott értékelés         |

<!-- MARK: PlayerResults -->
## 7. PlayerResults

A játékosok eredményeinek tömbje.

```
[
  <PlayerResult>
]
```

A tömb elemei `PlayerResult` objektumok. A sorrendet az API határozza meg.

<!-- MARK: AnswerEvaluations -->
## 8. AnswerEvaluations

Admin által módosított válaszértékelések tömbje. PATCH kérésben használatos.

```
[
  {
    "registration_id": 25,
    "answers": [
      {
        "card_id": 13,
        "admin_evaluation": true
      },
      {
        "card_id": 14,
        "admin_evaluation": false
      },
      {
        "card_id": 15,
        "admin_evaluation": null
      }
    ]
  }
]
```

| Mező                         | Típus        | Leírás                                                                    |
| ---------------------------- | ------------ | ------------------------------------------------------------------------- |
| `registration_id`            | integer      | Érintett játékos regisztrációazonosítója                                  |
| `answers`                    | array        | Módosított értékelések                                                    |
| `answers[].card_id`          | integer      | Érintett kártyaazonosító                                                  |
| `answers[].admin_evaluation` | boolean/null | `true`: helyes, `false`: helytelen, `null`: adminértékelés visszaállítása |

<!-- MARK: Közös adatformátumok -->
## 9. Közös adatformátumok

| Adat          | Formátum     |
| ------------- | ------------ |
| Azonosító     | integer      |
| Dátum         | `YYYY-MM-DD` |
| Időpont       | `HH:mm:ss`   |
| Időbélyeg     | ISO 8601     |
| Logikai érték | boolean      |
| Üres szöveg   | `""`         |
| Üres lista    | `[]`         |
| Hiányzó érték | `null`       |

Az opcionális mezők is mindig szerepelnek a JSON-ban. A dátum- és időkezelés a szerver és a kliens által közösen használt játék-időzónán alapul. A `card_date` naptári dátum, időzóna-átváltás nélkül.

## 10. Hitelesítési token

A bejelentkezett felhasználó aktuális játékbeli azonosításához nem külön `CurrentUser` objektum használatos. Az API JWT tartalmazza az ehhez szükséges adatokat.
Kötelező claim-ek:
| Claim             | Típus   | Leírás                                                |
| ----------------- | ------- | ----------------------------------------------------- |
| `game_id`         | integer | Az aktuális játék azonosítója                         |
| `registration_id` | integer | A felhasználó játékbeli regisztrációjának azonosítója |
| `role`            | string  | Szerepkör: `player` vagy `admin`                      |
| `exp`             | integer | A token lejárati időpontja (Unix timestamp)           |

A token további opcionális claim-eket is tartalmazhat, például `iss`, `aud` és `iat` értékeket.