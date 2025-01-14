-- MySQL dump 10.13  Distrib 8.0.34, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: game
-- ------------------------------------------------------
-- Server version	8.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Dumping data for table `zadania`
--

LOCK TABLES `zadania` WRITE;
/*!40000 ALTER TABLE `zadania` DISABLE KEYS */;
INSERT INTO `zadania` VALUES (1,'Może zakupy?','Kup 1 przedmiot w sklepie',1,1000,200,'Zakupy',NULL,1),(2,'Praca popłaca','Ukończ 3 prace',5000,0,1000,'Praca',NULL,3),(3,'Czas do walki','Pokonaj 5 przeciwników na arenie',NULL,500,1000,'Arena',NULL,5),(4,'Gladiator','Pokonaj 5 przeciwników na arenie',NULL,1000,500,'Arena',NULL,5),(31,'Walcz!','Pokonaj 3 przeciwników na arenie',NULL,500,200,'Arena',NULL,3),(32,'Kowal czeka','Ulepsz 3 przedmioty',1,1000,250,'Kowal',NULL,3),(33,'Wydatki','Wydaj 5000 miedziaków',2,0,600,'Miedziaki',NULL,5000),(121,'Czas wydawać','Wydaj 10000 miedziaków',1,0,400,'Miedziaki',NULL,10000),(122,'Walki','Pokonaj 10 przeciwników na arenie',NULL,2000,1000,'Arena',NULL,10),(123,'Potęga','Ulepsz 5 przedmiotów',NULL,3000,2000,'Kowal',NULL,5),(124,'Do sklepu','Kup 3 przedmioty w sklepie',5,NULL,1000,'Zakupy',NULL,3),(125,'Robota czeka','Ukończ 4 prace',5,500,1500,'Praca',NULL,4);
/*!40000 ALTER TABLE `zadania` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-11-20 11:46:55
