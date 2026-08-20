<?php
/**
 * get-hospitals.php
 * Fetch all active hospitals for the selection page
 */

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

header('Content-Type: application/json');

try {
    $pdo = getDBConnection();
    
    $query = "SELECT hospital_id as id, name as hospital_name, address1, mobile, logo FROM hospital WHERE status = 'Active' ORDER BY name ASC";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $hospitals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Transform the response
    $result = array_map(function($hospital) {
        $logo = $hospital['logo'];
        if (!empty($logo) && strpos($logo, 'http') !== 0 && strpos($logo, 'data:image/') !== 0) {
            $logo = '../api/backend/uploads/' . $logo;
        }

        return [
            'id' => (int)$hospital['id'],
            'name' => $hospital['hospital_name'],
            'logo' => $logo,
            'address' => $hospital['address1'],
            'contactNumber' => $hospital['mobile']
        ];
    }, $hospitals);
    
    echo json_encode([
        'success' => true,
        'hospitals' => $result
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Failed to fetch hospitals: ' . $e->getMessage()
    ]);
}
