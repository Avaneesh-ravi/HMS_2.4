<?php
require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../includes/functions.php';

header('Content-Type: application/json; charset=UTF-8');

try {
    $pdo = getDBConnection();
    
    $query = "SELECT hospital_id as id, name as hospital_name, address1, mobile, logo FROM hospital WHERE status = 'Active' ORDER BY name ASC";
    $stmt = $pdo->prepare($query);
    $stmt->execute();
    $hospitals = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
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
    echo json_encode([
        'success' => true,
        'fallback' => true,
        'hospitals' => [
            [
                'id' => 1,
                'name' => 'Apollo Healthcare Center',
                'logo' => null,
                'address' => 'Erode, Tamil Nadu',
                'contactNumber' => '+91 44 1234 5678'
            ],
            [
                'id' => 2,
                'name' => 'City Medical Centre',
                'logo' => null,
                'address' => 'Chennai, Tamil Nadu',
                'contactNumber' => '+91 44 9876 5432'
            ],
            [
                'id' => 3,
                'name' => 'Government Hospital',
                'logo' => null,
                'address' => 'Salem, Tamil Nadu',
                'contactNumber' => '+91 42 7245 1234'
            ]
        ]
    ]);
}
