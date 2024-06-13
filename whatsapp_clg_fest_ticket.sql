-- MySQL dump 10.13  Distrib 8.0.33, for Win64 (x86_64)
--
-- Host: localhost    Database: whatsapp_clg
-- ------------------------------------------------------
-- Server version	8.0.34

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
-- Table structure for table `fest_ticket`
--

DROP TABLE IF EXISTS `fest_ticket`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fest_ticket` (
  `ticket_id` varchar(255) NOT NULL,
  `amount` int NOT NULL,
  `currency` varchar(10) NOT NULL,
  `customer_email` varchar(255) NOT NULL,
  `sender_id` varchar(50) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`ticket_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fest_ticket`
--

LOCK TABLES `fest_ticket` WRITE;
/*!40000 ALTER TABLE `fest_ticket` DISABLE KEYS */;
INSERT INTO `fest_ticket` VALUES ('cs_test_a101Zu6ZrOahJG4Gi3vSa3QWbi3SxlavpnW6Xgs8cbMAg8Vt7y37W7XGvh',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-21 10:20:44'),('cs_test_a110axr9mKM7VARKdULvOTooQU5BtkYo2kx2npmXUSKbPGvy28XZj3aHQh',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-23 12:34:06'),('cs_test_a11qYh0YYbNuIfT1jl3emQAnwqZe4I8ypu8fnPNSin8zH0QgDFLcsyjNCN',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-26 09:15:55'),('cs_test_a15NCQj8Xgz2ihmQVNjBHyjI664gEpt5e0AKdvk0y7qqt8HIVGiCLtzML3',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-23 12:50:04'),('cs_test_a17fD5ET01tJG25FteEwVbqcv6rT5lguHw06ty7UfIHiAMQDXdK4Q1yniV',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-21 09:54:32'),('cs_test_a18NhWvATjnOEocKh3F7kHuPPEisv1emiFJ6pNEnzHjvDWcvYxmNmIXm5z',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-24 05:19:45'),('cs_test_a1A3yKzqgcAJo8ZHh9HJqjt4VzAfF5SMEm3IkBIVaZqN8BHBNHDYIYZax9',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-21 10:05:57'),('cs_test_a1AvngZ9eVJJHsJydZrqH7371Jk2eF2jAYTQRa2TGklH45EvHVYdalHbhe',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-26 09:40:41'),('cs_test_a1bcFYGFiDQkjxRuaCjOhl0mKacQYeVJxkNeVjewT0h22WlPQ6QRf1Th7l',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-24 09:41:47'),('cs_test_a1cJofkS9thVDPS7RP5mebyqpUQklJtwwaBR1befjxdGYspIdDZXvwB3hk',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-27 16:20:00'),('cs_test_a1CQLpONLA8mlGQGD8F4peMzSTGMY7qdFU6Sisi19b3xXVFGw6Zfz5QmMr',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-22 12:13:30'),('cs_test_a1doR3XXS5M59SrTfhf3ZS0W1hYT2wHZ042gIIpCG7s0z6OzJGMGJzmxVx',500,'inr','zainkaleem27@gmail.com','917760372901','2024-06-13 15:18:31'),('cs_test_a1dTatAJkm4Y0lAIGOCDRZfsghsHD9QtMa1DK5iCAlFMoQFLuNmT26OOJc',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-06-13 15:05:02'),('cs_test_a1eJ0FjsI7tKzHqzNbVRyedODqdx6yyOiIGGnTVppLBlzphhYQb3DsHqtc',150000,'inr','zainkaleem27@gmail.com','917760372901','2024-06-13 15:42:32'),('cs_test_a1Fv81AHrz85aSyh5BKExttiBQVjuz5pZVHKmvGPYVMayZcfdegvN8evTW',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-21 10:04:32'),('cs_test_a1G7lJUWJNt0X1sSikE3VdL8wZCmu9FNLy4jxaPNUrhJIWzlnmWJKmAgYO',2000,'inr','syedadil093@gmail.com','919901184938','2024-06-13 14:28:25'),('cs_test_a1G9RZBsSBPxStxo2iK9du19uj6YMRy4mShpYPBUSX1LL2axN5P7FgvPm1',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-26 09:54:30'),('cs_test_a1GjbwH73KdB6DJLz9DPazyykDcAZfFe149N1V1eQ5q8aQKdz3M7PW544x',2000,'inr','zainkaleem27@gmail.com','917760372901','2024-06-13 14:31:05'),('cs_test_a1hi9TF6nG8VVgcWhlnYvo8erEZ6hGbe9Czsbo81PZ2wqfqkzTl644XlJq',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-21 09:58:54'),('cs_test_a1HODdhqvskINQVIwkWPtfsfL3GdtjyOtaaJ2dd8tmNvRYzje1R8k9f7vM',300000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-28 09:05:21'),('cs_test_a1Hpgm5hZCMXqnJ5JnzyhRyUOQbHWoVJTmCXA1u2PqnJnQBCWoEx31KdUa',80000,'inr','mohammedfaisal3366@gmail.com','919353676794','2024-05-26 09:42:57'),('cs_test_a1HQTYrKN9zw3WjDDBYIolIRQc2t9dh7g4yqkpoJRbkEuP8AlgzVs9WQPD',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-23 12:33:09'),('cs_test_a1Icghq226EPx7cdAZWw4Pp8mXOrWPZWuBpAZiDOMInPjePr2XoHcD0z2y',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-26 06:11:29'),('cs_test_a1inEeZso06rVbShdeFNpLfSFgdbpOCm0btV1zLEFkwo6IoWJRaj2UiGJs',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-23 13:26:05'),('cs_test_a1kCB9ETxGKFU7YvsWSMBzaZZxLDtCT4fLS0LQgSaIfzZMF6pqXb8W0r0e',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-26 16:37:57'),('cs_test_a1kWngJD2RPaosDzk4jz3PPlqrMtePlRVQqHl4tfMkQhCNEAMc2cf779e0',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-23 07:05:45'),('cs_test_a1LjqJKGNpvy1G2RmMVoJojEJeEsgkGjVQ2xmexuzhiiOsady89IqFkedY',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-22 12:11:58'),('cs_test_a1mcWYVKwRItjfZsiWwyQ5fNkJYB0djiFaxTpBlnJIKdXB6D5IzzUBUTTj',10500,'inr','zainkaleem27@gmail.com','917760372901','2024-06-13 15:31:11'),('cs_test_a1O2bmSElTIsmR4d1AEubzWxIXmgA65eqgCYTe4kUPFWfGMRXpVm4vesYH',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-21 10:37:21'),('cs_test_a1orrCe0J8np3VeFAd20ylKMwz5WaeT3KJVcT3C7i2aSCXYaQxtJV0ez8l',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-22 13:17:00'),('cs_test_a1p41382eaT2JZijVEs9VQ7jVFJvOzHu848d9gdbScmt5MuW1qTo8qh1dj',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-24 10:25:06'),('cs_test_a1p9hN3heltJeFSi3NGUn2prO0jlduyakavB09O7lRxo4aE0tImKia6wL8',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-23 12:18:34'),('cs_test_a1pjlw6LE6Vv6a9gQLaVWNIJjP2yfMU8FWsduCj4c0eBrVVsVoR7V4JV52',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-26 06:17:35'),('cs_test_a1pTLelfAskp9jkjUsx7ZDJOHstrbQCmYmv71fWYNeHH2a2Fu3ujybiASR',7500,'inr','zainkaleem27@gmail.com','917760372901','2024-06-13 15:34:48'),('cs_test_a1pZ9yhLN1kCQE4fYc8EO0cXvqoX0MFPWjrM5N8mBCRaG2XyAWMnmBQnh5',1000,'inr','zainkaleem27@gmail.com','917760372901','2024-06-13 14:30:07'),('cs_test_a1q3zTjdjI2Rsw0eCmwygKPhaNUaKOXt5PZRhRVluFOrbaoPfiWriuTbdl',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-22 11:58:41'),('cs_test_a1qUxRBj1BzocTlzYvoexOaAiHAWO3YgGfzYce5NROkkxS2u4H6NoA4usK',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-24 18:32:31'),('cs_test_a1r7ClftjjKc0RG8Cm6bA1BTVaC2vpQ1Iway0CIiVfN5UFPM2reMiBMY6u',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-24 09:55:29'),('cs_test_a1rhIem9POCHuEHNK2Nq9O8sVCISNQYemDCtNqW4AbOysTUDXh3MDtf1N0',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-23 10:07:23'),('cs_test_a1salee1B8NEftfciCMMoNXTHJllSqP3OGzCVjQcKKTuSEmZV6XP2mVnSc',5000,'inr','syedadil093@gmail.com','919901184938','2024-06-13 15:01:33'),('cs_test_a1Tp8TzaiGub0XmJYYspHGQKheVcXVDI05QYTP8Is46WPHAF6r1E90V1Xa',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-06-01 13:42:59'),('cs_test_a1v2fQdCEyt4MqUS0g2ubb3b4JUKjBSIrkdlMUTBvyrNdytTtpycfcb4Au',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-21 10:21:56'),('cs_test_a1v8r9BMfQYd2dKxxd5lJaFlEk0fbxBhwu0tkXic5dCvjNVU2qSQM5owcW',10500,'inr','zainkaleem27@gmail.com','917760372901','2024-06-13 15:40:28'),('cs_test_a1VMiPjbI5ft1fXocccLhrGy01220t6wxSQ4pMfeM7cDudus8JRsANl59z',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-27 16:11:01'),('cs_test_a1y6nQBQMOtoPSFoiXYH4KNMvJpYtEscg2v20wUF9ftH4ucr6QnSZ16ElW',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-23 06:21:23'),('cs_test_a1yAAgD1jnHYb7ScSWd1QmqTF5GKNMXn9ASgdKPes6di6fhqLexmfGxiaW',5000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-23 12:37:19'),('cs_test_a1YoOkrQY1QCR428PpH4dEWElqBvNSTiahajmIE9q0NhepkexmXXjnlxgf',300000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-28 09:03:26'),('cs_test_a1yOXWjsgQXiCmOrIuyrzAUdjEsofGVMM0Kvny3tBAIXx9TlR7kyjMzPLP',3000,'inr','zainkaleem27@gmail.com','917760372901','2024-06-13 15:20:34'),('cs_test_a1ype3c1AgufUPU4S5flkuxtsQkVEAEF3RxSXI9i3dh8uXq5sa8GxSj0Ht',80000,'inr','zainkaleem27@gmail.com','917760372901','2024-05-26 08:37:23'),('cs_test_a1zMZ2D6HNTzsmGzGRal3dw4vvR79qLmsOtQMJIWVbc8vLUmJWvVYcLW3L',5000,'inr','syedadil093@gmail.com','919901184938','2024-05-23 10:07:56'),('cs_test_a1ZOuY3zEcgeIGYhjbOjkPUCVF4Y5uXJboY8ub7uA8T42wSKKh89QATqQm',5000,'inr','syedadil093@gmail.com','919901184938','2024-05-21 09:56:34'),('cs_test_b12bxCuJ3Z4URZ0zHQRO0sBpGCXNzwz3dDaNXCsMeFwM68vTTneOny89Oi',9500,'inr','zainkaleem27@gmail.com','917760372901','2024-06-13 15:13:51'),('cs_test_b13zCSeE2CYethJMkn2zCuyhXVeobumX4i1JUsleV3boxfAYystXe3zRan',8500,'inr','zainkaleem27@gmail.com','917760372901','2024-06-13 14:39:45'),('cs_test_b1hZiuYH0s0ko2Q1CPfMr7ETPuSKcCXXnUmNnK0D62ftMwhvkNNj9F1drd',4500,'inr','zainkaleem27@gmail.com','917760372901','2024-06-13 14:24:36'),('cs_test_b1MCbm21xHr7ElSP61jrNwF2qYMyO8A4fL4qDT5Nj2xwrVtIrCiAGF2sZd',15500,'inr','zainkaleem27@gmail.com','917760372901','2024-06-13 14:59:40'),('cs_test_b1pXHig2aiDY4M7fpOvtxgrglWrfCudPXK7Sje0TrcoPytnkGppP0Flz6T',10500,'inr','syedadil093@gmail.com','919901184938','2024-06-13 14:32:48'),('cs_test_b1vEC9bgmJEASP0yJP68w5ITaTuLPgCX4eIna5UEBFyPQjkE27G2ZuphUh',4500,'inr','zainkaleem27@gmail.com','917760372901','2024-06-13 15:10:40');
/*!40000 ALTER TABLE `fest_ticket` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2024-06-13 22:14:20
