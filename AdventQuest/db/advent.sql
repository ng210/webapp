-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Gép: 127.0.0.1:3307
-- Létrehozás ideje: 2026. Nov 26. 07:28
-- Kiszolgáló verziója: 10.4.32-MariaDB
-- PHP verzió: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Adatbázis: `advent`
--

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `answers`
--

CREATE TABLE `answers` (
  `id` int(11) NOT NULL,
  `registration_id` int(11) NOT NULL,
  `question_id` int(11) NOT NULL,
  `answer` text NOT NULL,
  `submitted_at` datetime NOT NULL DEFAULT current_timestamp(),
  `admin_evaluation` tinyint(1) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `games`
--

CREATE TABLE `games` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `asset_path` varchar(100) DEFAULT NULL,
  `deadline_time` time NOT NULL,
  `publish_correct_answers` tinyint(1) NOT NULL DEFAULT 1,
  `publish_delay_hours` int(11) NOT NULL DEFAULT 0,
  `registration_mode` varchar(30) NOT NULL DEFAULT 'on_login',
  `is_active` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- A tábla adatainak kiíratása `games`
--

INSERT INTO `games` (`id`, `name`, `description`, `asset_path`, `deadline_time`, `publish_correct_answers`, `publish_delay_hours`, `registration_mode`, `is_active`) VALUES
(1, 'Großes Weihnachts-Quiz', 'Großes Weihnachts-Quiz\r\nSprachniveau A1+/A2-\r\n2026.11.30-2026.12.15', '/images', '22:00:00', 1, 8, 'on_login', 0);

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `questions`
--

CREATE TABLE `questions` (
  `id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `question_date` date NOT NULL,
  `title` varchar(255) NOT NULL DEFAULT 'Új kérdés',
  `image_path` varchar(255) DEFAULT NULL,
  `question_text` text NOT NULL DEFAULT 'A kérdés még nincs megadva.',
  `question_type` varchar(30) NOT NULL DEFAULT 'multiple_choice',
  `options` text DEFAULT '1. válasz\r\n2. válasz\r\n3. válasz\r\n4. válasz',
  `correct_answer` text NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- A tábla adatainak kiíratása `questions`
--

INSERT INTO `questions` (`id`, `game_id`, `question_date`, `title`, `image_path`, `question_text`, `question_type`, `options`, `correct_answer`) VALUES
(13, 1, '2026-11-30', '', '01wbaum.png', 'Wo gab es vor über 400 Jahren die ersten geschmückten Weihnachtsbäume?', 'multiple_choice', 'Im Elsass (eine Region zwischen Deutschland und Frankreich)\nIn England\nIn Italien\nIn Schweden', 'A'),
(14, 1, '2026-12-01', '', '02zuckerl.png', 'Früher hängte man Äpfel, Nüsse und Süßigkeiten (wie das ungarische Szaloncukor / Salonzuckerl) an den Baum. Heute benutzt man oft glänzende Silberstreifen (Lametta). Was bedeuten diese Streifen?', 'multiple_choice', 'Sterne\nEiszapfen\nKerzen\nSchnee', 'B'),
(15, 1, '2026-12-02', '', '03nikolaus.png', 'Wann kommt in Deutschland und Österreich der Nikolaus? Und wie heißt sein gruseliger Begleiter in den Alpen?', 'multiple_choice', 'Am 6. Dezember; der Krampus\nAm 24. Dezember; das Christkind\nAm 1. Dezember; der Nussknacker\nAm 6. Januar; der Weihnachtsmann', 'A'),
(16, 1, '2026-12-03', '', '04zwige.png', 'Am 4. Dezember stellt man Zweige von einem Kirschbaum oder Apfelbaum in eine Vase mit Wasser. Warum macht man das?', 'multiple_choice', 'Man macht daraus einen Tee.\nMan verbrennt sie an Heiligabend.\nWenn die Zweige an Weihnachten blühen, bringen sie Glück.\nSie sind ein Geschenk für den Nikolaus.', 'C'),
(17, 1, '2026-12-04', '', '05kuchen.png', 'Aus welcher Stadt kommt der bekannte Weihnachtskuchen „Christstollen“? Und wie sieht er aus?', 'multiple_choice', 'Aus München – wie ein hoher Berg\nAus Dresden – wie das Jesuskind in weißen Tüchern\nAus Hamburg – wie ein Schiff\nAus Berlin – wie ein Stern', 'B'),
(18, 1, '2026-12-07', '', '06pyramide.png', 'Aus welcher Region in Deutschland kommen die „Weihnachtspyramide“ und der Lichterbogen („Schwibbogen“)? Und was zeigt der Bogen?', 'multiple_choice', 'Aus dem Erzgebirge – den Eingang zu einem Bergwerk\nAus dem Schwarzwald – eine große Uhr\nVom Meer – einen Regenbogen\nAus Bayern – ein großes Stadttor', 'A'),
(19, 1, '2026-12-08', '', '07nussknacker.png', 'Die Nussknacker aus Holz schauen oft sehr streng. Wen zeigen diese Figuren?', 'multiple_choice', 'Kinder aus Märchen\nPiraten und Seeleute\nKönige, Soldaten und Polizisten\nBäcker und Köche', 'C'),
(20, 1, '2026-12-09', '', '08lebkuchen.png', 'In welchem Land steht das größte Lebkuchenhaus der Welt (ein Nachbau aus dem Film Kevin – Allein zu Haus)?', 'multiple_choice', 'In Deutschland\nIn Schweden\nIn Österreich\nIn den USA', 'D'),
(21, 1, '2026-12-10', '', '09punsch.png', 'Woher kommt das Wort „Punsch“ (für die Zahl 5, weil das Getränk fünf Zutaten hat)? Und wie heißt der bekannte deutsche Punsch mit brennendem Zucker?', 'multiple_choice', 'Aus Indien; Feuerzangenbowle\nAus Schweden; Glögg\nAus Frankreich; Kakao\nAus Italien; Espresso', 'A'),
(22, 1, '2026-12-11', '', '10wmarkt.png', 'In welcher Stadt in England gibt es den größten deutschen Weihnachtsmarkt außerhalb von Deutschland und Österreich?', 'multiple_choice', 'In Birmingham („Frankfurt Christmas Market“)\nIn London\nIn Manchester\nIn Liverpool', 'A'),
(23, 1, '2026-12-14', '', '11rodeln.png', 'Wann und wo wurde das Schlittenfahren (Rodeln) zum offiziellen Sport mit einem großen Rennen?', 'multiple_choice', '1924 in Frankreich\n1896 in Griechenland\n1883 in der Schweiz (in Davos)\n1905 in Österreich', 'C'),
(24, 1, '2026-12-15', '', '12glück.png', 'Auf dem Weihnachtsmarkt in Nürnberg kauft man kleine, lustige Figuren (zum Beispiel Schornsteinfeger) als Glücksbringer. Woraus sind diese Figuren gemacht?', 'multiple_choice', 'Aus getrockneten Pflaumen (Zwetschgen)\nAus frischen Äpfeln\nAus Orangen\nAus Bananen', 'A');

-- --------------------------------------------------------

--
-- Tábla szerkezet ehhez a táblához `registrations`
--

CREATE TABLE `registrations` (
  `id` int(11) NOT NULL,
  `game_id` int(11) NOT NULL,
  `auth_id` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `role` varchar(30) NOT NULL DEFAULT 'player',
  `registered_at` datetime NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- A tábla adatainak kiíratása `registrations`
--

INSERT INTO `registrations` (`id`, `game_id`, `auth_id`, `email`, `display_name`, `role`, `registered_at`) VALUES
(2, 1, '102894393577793921252', 'nemeth.gabor@hbsz.edu.hu', 'Németh Gábor', 'user', '2026-11-26 04:35:26');

--
-- Indexek a kiírt táblákhoz
--

--
-- A tábla indexei `answers`
--
ALTER TABLE `answers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_answers_registration_card` (`registration_id`,`question_id`),
  ADD KEY `fk_answers_card` (`question_id`);

--
-- A tábla indexei `games`
--
ALTER TABLE `games`
  ADD PRIMARY KEY (`id`);

--
-- A tábla indexei `questions`
--
ALTER TABLE `questions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_questions_game_date` (`game_id`,`question_date`);

--
-- A tábla indexei `registrations`
--
ALTER TABLE `registrations`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_registrations_game_auth` (`game_id`,`auth_id`) USING BTREE;

--
-- A kiírt táblák AUTO_INCREMENT értéke
--

--
-- AUTO_INCREMENT a táblához `answers`
--
ALTER TABLE `answers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT a táblához `games`
--
ALTER TABLE `games`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT a táblához `questions`
--
ALTER TABLE `questions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT a táblához `registrations`
--
ALTER TABLE `registrations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- Megkötések a kiírt táblákhoz
--

--
-- Megkötések a táblához `answers`
--
ALTER TABLE `answers`
  ADD CONSTRAINT `fk_answers_card` FOREIGN KEY (`question_id`) REFERENCES `questions` (`id`),
  ADD CONSTRAINT `fk_answers_registration` FOREIGN KEY (`registration_id`) REFERENCES `registrations` (`id`);

--
-- Megkötések a táblához `questions`
--
ALTER TABLE `questions`
  ADD CONSTRAINT `fk_questions_game` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE;

--
-- Megkötések a táblához `registrations`
--
ALTER TABLE `registrations`
  ADD CONSTRAINT `fk_registrations_game` FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
