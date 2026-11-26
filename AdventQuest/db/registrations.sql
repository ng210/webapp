CREATE TABLE registrations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    auth_id VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    display_name VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'player',
    registered_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UNIQUE KEY uq_registrations_game_auth (game_id, auth_id),

    CONSTRAINT fk_registrations_game
        FOREIGN KEY (game_id) REFERENCES games(id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;