CREATE TABLE questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    game_id INT NOT NULL,
    question_date DATE NOT NULL,
    title VARCHAR(255) NOT NULL DEFAULT 'Új kérdés',
    image_path VARCHAR(255) NULL,
    question_text TEXT NOT NULL DEFAULT 'A kérdés még nincs megadva.',
    question_type VARCHAR(30) NOT NULL DEFAULT 'multiple_choice',
    options TEXT DEFAULT '1. válasz
2. válasz
3. válasz
4. válasz',
    correct_answer TEXT NOT NULL DEFAULT '1',
    UNIQUE KEY uq_questions_game_date (game_id, question_date),

    CONSTRAINT fk_questions_game
        FOREIGN KEY (game_id) REFERENCES games(id)
        ON DELETE CASCADE
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_unicode_ci;

ALTER TABLE questions
ADD CONSTRAINT chk_questions_question_type_options
    CHECK (
        (question_type = 'multiple_choice' AND options IS NOT NULL)
        OR
        (question_type = 'text' AND options IS NULL)
    );
