-- -----------------------------------------------------
-- This is the fix for connection issues.
-- -----------------------------------------------------

-- ALTER USER 'USERNAMEHERE'@'%' IDENTIFIED WITH mysql_native_password BY 'PASSWORDHERE';
-- This must be done before the app tries to use the user to connect.
-- Its a permanent change to the user so its only done once.

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `drawtastic` DEFAULT CHARACTER SET utf8 ;
USE drawtastic ;

-- -----------------------------------------------------
-- Table drawtastic.draw_option
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `drawtastic`.`draw_option` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `name_UNIQUE` (`name` ASC) VISIBLE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_bin;

-- -----------------------------------------------------
-- Table drawtastic.drawing
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `drawtastic`.`drawing` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `artist` VARCHAR(45) NOT NULL,
  `winner` VARCHAR(45) NULL,
  `time` DATETIME NOT NULL,
  `image` BLOB NOT NULL,
  `draw_option_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_drawing_draw_option_idx` (`draw_option_id` ASC) VISIBLE,
  CONSTRAINT `fk_drawing_draw_option`
    FOREIGN KEY (`draw_option_id`)
    REFERENCES `drawtastic`.`draw_option` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_bin;


-- -----------------------------------------------------
-- Population drawtastic.draw_option
-- -----------------------------------------------------
insert into draw_option VALUES (DEFAULT, "car");
insert into draw_option VALUES (DEFAULT, "house");
insert into draw_option VALUES (DEFAULT, "tomato");
insert into draw_option VALUES (DEFAULT, "person");
