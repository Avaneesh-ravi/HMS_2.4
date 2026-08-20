<?php
/**
 * Database connection (PDO) — single reusable connection object.
 * Now using PostgreSQL (Supabase) instead of MySQL.
 */

if (!defined('DB_HOST')) define('DB_HOST', 'aws-0-ap-northeast-1.pooler.supabase.com');
if (!defined('DB_PORT')) define('DB_PORT', '6543');
if (!defined('DB_NAME')) define('DB_NAME', 'postgres');
if (!defined('DB_USER')) define('DB_USER', 'postgres.oeithmuipahqhaoznznd');
if (!defined('DB_PASS')) define('DB_PASS', 'Avaneesh4084@');

function getDBConnection(): PDO
{
    static $pdo = null;

    if ($pdo === null) {
        try {
            $dsn = 'pgsql:host=' . DB_HOST . ';port=' . DB_PORT . ';dbname=' . DB_NAME . ';sslmode=require';
            $options = [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            die('Database connection failed. Please check config/database.php — ' . $e->getMessage());
        } catch (Exception $e) {
            die('Configuration error: ' . $e->getMessage());
        }
    }

    return $pdo;
}