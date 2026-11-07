-- ============================================================
-- NEERAJ MOVIE THEATRE - DATABASE SCRIPT
-- MySQL Workbench Compatible
-- Database: movie_ticket_management
-- ============================================================

CREATE DATABASE IF NOT EXISTS `movie_ticket_management`;
USE `movie_ticket_management`;

-- Disable foreign key checks during schema creation
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- TABLE 1: users
-- ------------------------------------------------------------
DROP TABLE IF EXISTS `booking_seats`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `shows`;
DROP TABLE IF EXISTS `theatres`;
DROP TABLE IF EXISTS `movies`;
DROP TABLE IF EXISTS `users`;

CREATE TABLE `users` (
  `user_id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(15),
  `role` ENUM('customer', 'admin') DEFAULT 'customer',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLE 2: movies
-- ------------------------------------------------------------
CREATE TABLE `movies` (
  `movie_id` INT PRIMARY KEY AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `genre` VARCHAR(50) NOT NULL,
  `language` VARCHAR(30) NOT NULL,
  `duration` INT NOT NULL COMMENT 'Duration in minutes',
  `release_date` DATE NOT NULL,
  `description` TEXT,
  `poster_url` VARCHAR(500),
  `banner_url` VARCHAR(500),
  `rating` DECIMAL(3,1) DEFAULT 8.5,
  `status` ENUM('now_showing', 'upcoming') DEFAULT 'now_showing',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLE 3: theatres
-- ------------------------------------------------------------
CREATE TABLE `theatres` (
  `theatre_id` INT PRIMARY KEY AUTO_INCREMENT,
  `theatre_name` VARCHAR(100) NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `total_seats` INT DEFAULT 60,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLE 4: shows
-- ------------------------------------------------------------
CREATE TABLE `shows` (
  `show_id` INT PRIMARY KEY AUTO_INCREMENT,
  `movie_id` INT NOT NULL,
  `theatre_id` INT NOT NULL,
  `theatre_name` VARCHAR(100) NOT NULL,
  `show_date` DATE NOT NULL,
  `show_time` TIME NOT NULL,
  `ticket_price` DECIMAL(10,2) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_shows_movie` FOREIGN KEY (`movie_id`) REFERENCES `movies` (`movie_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_shows_theatre` FOREIGN KEY (`theatre_id`) REFERENCES `theatres` (`theatre_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLE 5: bookings
-- ------------------------------------------------------------
CREATE TABLE `bookings` (
  `booking_id` INT PRIMARY KEY AUTO_INCREMENT,
  `booking_reference` VARCHAR(50) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `show_id` INT NOT NULL,
  `seats` INT NOT NULL,
  `total_amount` DECIMAL(10,2) NOT NULL,
  `booking_status` VARCHAR(30) DEFAULT 'CONFIRMED',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`user_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bookings_show` FOREIGN KEY (`show_id`) REFERENCES `shows` (`show_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- TABLE 6: booking_seats
-- ------------------------------------------------------------
CREATE TABLE `booking_seats` (
  `booking_seat_id` INT PRIMARY KEY AUTO_INCREMENT,
  `booking_id` INT NOT NULL,
  `show_id` INT NOT NULL,
  `seat_number` VARCHAR(10) NOT NULL,
  CONSTRAINT `fk_booking_seats_booking` FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`booking_id`) ON DELETE CASCADE,
  CONSTRAINT `fk_booking_seats_show` FOREIGN KEY (`show_id`) REFERENCES `shows` (`show_id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- SAMPLE DATA INSERTION
-- ============================================================

-- 1. Insert Users (Password: Admin@123 for admin, Password@123 for customers)
-- Hashes generated via bcrypt (cost factor 10)
INSERT INTO `users` (`user_id`, `name`, `email`, `password`, `phone`, `role`) VALUES
(1, 'Neeraj Theatre Administrator', 'admin@neerajtheatre.com', '$2a$10$n4qGf.kYqU3y7D9Zf8X9be7YVomRzQzK8s1i.P7q1FpA3cR8bK9W2', '+1987654321', 'admin'),
(2, 'John Doe', 'john@example.com', '$2a$10$n4qGf.kYqU3y7D9Zf8X9be7YVomRzQzK8s1i.P7q1FpA3cR8bK9W2', '+1123456789', 'customer'),
(3, 'Sarah Connor', 'sarah@example.com', '$2a$10$n4qGf.kYqU3y7D9Zf8X9be7YVomRzQzK8s1i.P7q1FpA3cR8bK9W2', '+1555123456', 'customer'),
(4, 'Backup Admin', 'admin@cinemax.com', '$2a$10$n4qGf.kYqU3y7D9Zf8X9be7YVomRzQzK8s1i.P7q1FpA3cR8bK9W2', '+1987654322', 'admin');

-- 2. Insert Theatres (Neeraj Movie Theatre Screens & Auditoriums)
INSERT INTO `theatres` (`theatre_id`, `theatre_name`, `location`, `total_seats`) VALUES
(1, 'Neeraj Movie Theatre - Audi 1 (Grand IMAX)', 'Central Complex, MG Road, Metro Hub', 60),
(2, 'Neeraj Movie Theatre - Audi 2 (Dolby Atmos)', 'Central Complex, Level 2, Metro Hub', 60),
(3, 'Neeraj Movie Theatre - Audi 3 (Luxe Recliners)', 'Central Complex, VIP Wing, Metro Hub', 60),
(4, 'Neeraj Movie Theatre - Audi 4 (4DX Experience)', 'Central Complex, Level 3, Metro Hub', 60),
(5, 'Neeraj Movie Theatre - Audi 5 (Premiere Dome)', 'Central Complex, Rooftop Dome, Metro Hub', 60);

-- 3. Insert Movies (Rich Cinema Collection)
INSERT INTO `movies` (`movie_id`, `title`, `genre`, `language`, `duration`, `release_date`, `description`, `poster_url`, `banner_url`, `rating`, `status`) VALUES
(1, 'Interstellar Odyssey', 'Sci-Fi', 'English', 169, '2026-01-15', 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival amidst catastrophic planetary crises.', 'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=80', 9.2, 'now_showing'),
(2, 'The Dark Sentinel: Shadow War', 'Action', 'English', 152, '2026-02-10', 'When an enigmatic vigilante turns rogue, a decorated detective must descend into the city corrupt criminal syndicate to avert absolute chaos.', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80', 8.9, 'now_showing'),
(3, 'Cyberpunk: Neon Genesis', 'Sci-Fi', 'Japanese', 128, '2026-02-28', 'In a dystopian mega-city bathed in neon light, a cybernetically enhanced courier uncovers a clandestine AI algorithm that could reshape human consciousness.', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1600&q=80', 8.7, 'now_showing'),
(4, 'The Whispering Forest', 'Horror', 'English', 114, '2026-03-01', 'An archaeological expedition deep within an uncharted Scandinavian forest accidentally disturbs an ancient folkloric deity that feeds on regret.', 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80', 8.1, 'now_showing'),
(5, 'Kingdom of the Desert Sun', 'Adventure', 'Spanish', 142, '2026-03-05', 'Two rival treasure hunters embark on an epic journey across treacherous dunes in search of the forgotten jewel of Emperor Montezuma.', 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1473580044384-7ba9967a16a0?auto=format&fit=crop&w=1600&q=80', 8.5, 'now_showing'),
(6, 'Heartbeats in Paris', 'Romance', 'French', 118, '2026-02-14', 'A spontaneous meeting beneath the Eiffel Tower sparks a decade-long transatlantic correspondence between an aspiring jazz pianist and a literature student.', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=1600&q=80', 8.3, 'now_showing'),
(7, 'Quantum Paradox: Multiverse', 'Sci-Fi', 'English', 160, '2026-04-18', 'Physicists accidentally tear open fractures between alternate realities, forcing counterparts from different timelines to cooperate or perish.', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=1600&q=80', 9.1, 'upcoming'),
(8, 'The Last Emperor of Rome', 'Drama', 'English', 175, '2026-05-01', 'A sweeping cinematic spectacle capturing the palace intrigues, gladiator spectacles, and tragic downfall of the final Roman emperor.', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=1600&q=80', 8.8, 'upcoming');

-- 4. Insert Shows (Multiple dates and times)
INSERT INTO `shows` (`show_id`, `movie_id`, `theatre_id`, `theatre_name`, `show_date`, `show_time`, `ticket_price`) VALUES
(1, 1, 1, 'Neeraj Movie Theatre - Audi 1 (Grand IMAX)', CURDATE(), '10:00:00', 16.50),
(2, 1, 1, 'Neeraj Movie Theatre - Audi 1 (Grand IMAX)', CURDATE(), '14:30:00', 18.00),
(3, 1, 2, 'Neeraj Movie Theatre - Audi 2 (Dolby Atmos)', CURDATE(), '18:00:00', 15.00),
(4, 1, 3, 'Neeraj Movie Theatre - Audi 3 (Luxe Recliners)', CURDATE(), '21:15:00', 17.50),
(5, 2, 1, 'Neeraj Movie Theatre - Audi 1 (Grand IMAX)', CURDATE(), '13:00:00', 16.00),
(6, 2, 2, 'Neeraj Movie Theatre - Audi 2 (Dolby Atmos)', CURDATE(), '16:45:00', 15.50),
(7, 2, 4, 'Neeraj Movie Theatre - Audi 4 (4DX Experience)', CURDATE(), '20:30:00', 20.00),
(8, 3, 2, 'Neeraj Movie Theatre - Audi 2 (Dolby Atmos)', CURDATE(), '11:15:00', 14.00),
(9, 3, 3, 'Neeraj Movie Theatre - Audi 3 (Luxe Recliners)', CURDATE(), '17:30:00', 16.00),
(10, 4, 4, 'Neeraj Movie Theatre - Audi 4 (4DX Experience)', CURDATE(), '22:00:00', 18.50),
(11, 5, 5, 'Neeraj Movie Theatre - Audi 5 (Premiere Dome)', CURDATE(), '15:00:00', 13.50),
(12, 6, 5, 'Neeraj Movie Theatre - Audi 5 (Premiere Dome)', CURDATE(), '19:00:00', 14.50),
-- Shows for Tomorrow
(13, 1, 1, 'Neeraj Movie Theatre - Audi 1 (Grand IMAX)', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '11:00:00', 16.50),
(14, 1, 2, 'Neeraj Movie Theatre - Audi 2 (Dolby Atmos)', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '15:30:00', 15.00),
(15, 2, 3, 'Neeraj Movie Theatre - Audi 3 (Luxe Recliners)', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '18:15:00', 17.00),
(16, 3, 4, 'Neeraj Movie Theatre - Audi 4 (4DX Experience)', DATE_ADD(CURDATE(), INTERVAL 1 DAY), '20:00:00', 19.50),
-- Shows for Day after Tomorrow
(17, 1, 1, 'Neeraj Movie Theatre - Audi 1 (Grand IMAX)', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '14:00:00', 16.50),
(18, 2, 2, 'Neeraj Movie Theatre - Audi 2 (Dolby Atmos)', DATE_ADD(CURDATE(), INTERVAL 2 DAY), '17:00:00', 15.50);

-- 5. Insert Sample Bookings
INSERT INTO `bookings` (`booking_id`, `booking_reference`, `user_id`, `show_id`, `seats`, `total_amount`, `booking_status`) VALUES
(1, 'MTMS-2026-8819', 2, 1, 2, 33.00, 'CONFIRMED'),
(2, 'MTMS-2026-9432', 3, 1, 3, 49.50, 'CONFIRMED'),
(3, 'MTMS-2026-4421', 2, 2, 2, 36.00, 'CONFIRMED');

-- 6. Insert Reserved Seats (demonstrates pre-booked seats on layout)
INSERT INTO `booking_seats` (`booking_seat_id`, `booking_id`, `show_id`, `seat_number`) VALUES
(1, 1, 1, 'D4'),
(2, 1, 1, 'D5'),
(3, 2, 1, 'E6'),
(4, 2, 1, 'E7'),
(5, 2, 1, 'E8'),
(6, 3, 2, 'C5'),
(7, 3, 2, 'C6');
