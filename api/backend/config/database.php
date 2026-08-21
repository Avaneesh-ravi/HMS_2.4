<?php
/**
 * Database connection (PDO) — single reusable connection object.
 * PostgreSQL (Supabase) with automatic dual-port failover (5432 & 6543).
 */

if (!defined('DB_HOST')) define('DB_HOST', getenv('DB_HOST') ?: 'aws-0-ap-northeast-1.pooler.supabase.com');
if (!defined('DB_PORT')) define('DB_PORT', getenv('DB_PORT') ?: '5432');
if (!defined('DB_NAME')) define('DB_NAME', getenv('DB_NAME') ?: 'postgres');
if (!defined('DB_USER')) define('DB_USER', getenv('DB_USER') ?: 'postgres.oeithmuipahqhaoznznd');
if (!defined('DB_PASS')) define('DB_PASS', getenv('DB_PASS') ?: 'Avaneesh4084@');

function getDBConnection(): PDO {
    static $pdo = null;

    if ($pdo === null) {
        $ports = [(int)DB_PORT, 5432, 6543];
        $ports = array_unique($ports);
        $lastException = null;

        foreach ($ports as $p) {
            try {
                $dsn = 'pgsql:host=' . DB_HOST . ';port=' . $p . ';dbname=' . DB_NAME . ';sslmode=require';
                $options = [
                    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES   => true,
                    PDO::ATTR_TIMEOUT            => 5,
                ];
                $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
                return $pdo;
            } catch (PDOException $e) {
                $lastException = $e;
            }
        }
        throw new Exception('Database connection failed: ' . ($lastException ? $lastException->getMessage() : 'unknown error'));
    }

    return $pdo;
}
