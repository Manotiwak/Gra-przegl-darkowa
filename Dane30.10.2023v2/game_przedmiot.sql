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
-- Dumping data for table `przedmiot`
--

LOCK TABLES `przedmiot` WRITE;
/*!40000 ALTER TABLE `przedmiot` DISABLE KEYS */;
INSERT INTO `przedmiot` VALUES (1,'Skóra wilka','brak','pospolity',100,'Produkt','brak.jpg',0,1,NULL),(2,'Nić','brak','pospolity',200,'Produkt','brak.jpg',0,1,NULL),(3,'Lśniąca Nić','brak','rzadki',500,'Produkt','brak.jpg',0,1,NULL),(1000,'Hełm1','brak','pospolity',1000,'Hełm','brak.jpg',0,1,2),(1001,'Hełm2','brak','pospolity',1000,'Hełm','brak.jpg',0,1,3),(2000,'Naszyjnik1','brak','pospolity',2000,'Naszyjnik','brak.jpg',0,1,3),(2001,'Naszyjnik2','brak','pospolity',2000,'Naszyjnik','brak.jpg',0,1,3),(3000,'Odzież1','brak','pospolity',3000,'Odzież','brak.jpg',0,1,4),(3001,'Odzież2','brak','pospolity',3000,'Odzież','brak.jpg',0,1,4),(4000,'Pas1','brak','legendarny',5000,'Pas','brak.jpg',0,1,3),(5000,'Spodnie1','brak','rzadki',4000,'Spodnie','brak.jpg',0,1,3),(6000,'Rękawice1','brak','pospolity',2000,'Rękawice','brak.jpg',0,1,4),(7000,'Buty','brak','pospolity',3000,'Buty','brak.jpg',0,1,3),(8000,'Broń1','brak','pospolity',2000,'Broń','brak.jpg',0,1,9),(9000,'Zwierze1','brak','pospolity',3000,'Zwierze','brak.jpg',0,1,3),(10000,'Narzędzie1','brak','pospolity',4000,'Narzędzie','brak.jpg',0,1,3),(11000,'Diament','brak','legendarny',10000,'Produkt','brak.jpg',0,1,NULL),(12000,'Topór wojenny','Wikinga','legendarny',6000,'Broń','brak.jpg',0,1,9),(13000,'Różdżka','brak','epicki',5000,'Broń','brak.jpg',0,1,4),(14000,'Rękawice Maga','brak','epicki',7000,'Rękawice','brak.jpg',0,1,2),(15000,'Buty woja','brak','rzadki',4000,'Buty','brak.jpg',0,1,3),(16000,'Hełm kleryka','brak','rzadki',4400,'Hełm','brak.jpg',0,1,2),(17000,'Skórzane spodnie','brak','rzadki',5000,'Spodnie','brak.jpg',0,1,4),(18000,'Zbroja Pioniera','brak','pospolity',3600,'Odzież','brak.jpg',0,1,10020),(18001,'Zbroja Pioniera +1','brak','pospolity',4000,'Odzież','brak.jpg',1,1,10021),(18002,'Zbroja Pioniera +2','brak','pospolity',4600,'Odzież','brak.jpg',2,1,10022),(18003,'Zbroja Pioniera +3','brak','pospolity',5400,'Odzież','brak.jpg',3,1,10023),(18004,'Zbroja Pioniera +4','brak','pospolity',6000,'Odzież','brak.jpg',4,1,10024),(18005,'Zbroja Pioniera +5','brak','pospolity',7000,'Odzież','brak.jpg',5,1,10025),(18006,'Zbroja Pioniera +6','brak','pospolity',8500,'Odzież','brak.jpg',6,1,10026),(18007,'Zbroja Pioniera +7','brak','pospolity',10000,'Odzież','brak.jpg',7,1,10027),(18008,'Zbroja Pioniera +8','brak','pospolity',12000,'Odzież','brak.jpg',8,1,10028),(18009,'Zbroja Pioniera +9','brak','pospolity',15000,'Odzież','brak.jpg',9,1,10029);
/*!40000 ALTER TABLE `przedmiot` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2023-10-30 23:03:22
