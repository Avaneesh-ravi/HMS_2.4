<?php
require_once __DIR__ . '/' . '../config/database.php';
require_once __DIR__ . '/' . '../includes/functions.php';
ensureSession();
ob_start();

header('Content-Type: application/json');

if (empty($_SESSION['admin_id'])) {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Unauthorized']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Invalid request method']);
    exit;
}

try {
    $pdo = getDBConnection();
    $hospitalId = (int)($_SESSION['hospital_id'] ?? 0);

    if ($hospitalId === 0) {
        // Super admin trying to save global branding? Or maybe super admin cannot save?
        echo json_encode(['success' => false, 'message' => 'Super admin cannot modify hospital branding globally here. Select a specific hospital first.']);
        exit;
    }

    $hospitalName = $_POST['hospitalName'] ?? '';
    $address = $_POST['address'] ?? '';
    $contactNumber = $_POST['contactNumber'] ?? '';
    $email = $_POST['email'] ?? '';
    $logoData = $_POST['logo'] ?? '';
    
    $updateQuery = "UPDATE hospital SET name = :name, address1 = :address, mobile = :phone, email = :email";
    $params = [
        ':name' => $hospitalName,
        ':address' => $address,
        ':phone' => $contactNumber,
        ':email' => $email,
        ':id' => $hospitalId
    ];

    if (!empty($logoData) && strpos($logoData, 'data:image/') === 0) {
        $base64String = $logoData; // keep original for fallback
        list($type, $decodedLogoData) = explode(';', $logoData);
        list(, $decodedLogoData)      = explode(',', $decodedLogoData);
        $decodedLogoData = base64_decode($decodedLogoData);
        
        $ext = 'png';
        if (strpos($type, 'jpeg') !== false) $ext = 'jpg';
        else if (strpos($type, 'gif') !== false) $ext = 'gif';
        else if (strpos($type, 'svg') !== false) $ext = 'svg';

        $filename = 'logo_' . $hospitalId . '_' . time() . '.' . $ext;
        
        // Supabase Storage Migration
        $supabaseUrl = getenv('SUPABASE_URL');
        $supabaseKey = getenv('SUPABASE_SERVICE_ROLE_KEY');
        $bucket = getenv('SUPABASE_BUCKET') ?: 'logos';

        if (!empty($supabaseUrl) && !empty($supabaseKey)) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, "$supabaseUrl/storage/v1/object/$bucket/$filename");
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'POST');
            curl_setopt($ch, CURLOPT_POSTFIELDS, $decodedLogoData);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                "Authorization: Bearer $supabaseKey",
                "apikey: $supabaseKey",
                "Content-Type: image/$ext"
            ]);
            $response = curl_exec($ch);
            curl_close($ch);
            
            $publicUrl = "$supabaseUrl/storage/v1/object/public/$bucket/$filename";
            $updateQuery .= ", logo = :logo";
            $params[':logo'] = $publicUrl;
        } else {
            // Local fallback if Supabase credentials are missing (local testing)
            if (getenv('VERCEL') || getenv('VERCEL_ENV')) {
                // On stateless Vercel without Supabase keys, use Base64 inline database storage to prevent EROFS crash
                $updateQuery .= ", logo = :logo";
                $params[':logo'] = $base64String;
            } else {
                $uploadPath = __DIR__ . '/../uploads/' . $filename;
                if (!is_dir(__DIR__ . '/../uploads/')) {
                    mkdir(__DIR__ . '/../uploads/', 0777, true);
                }
                file_put_contents($uploadPath, $decodedLogoData);
                $updateQuery .= ", logo = :logo";
                $params[':logo'] = $filename;
            }
        }
    }

    $updateQuery .= " WHERE hospital_id = :id";
    $stmt = $pdo->prepare($updateQuery);
    $stmt->execute($params);

    ob_clean();
    echo json_encode(['success' => true, 'message' => 'Branding settings updated successfully']);

} catch (Exception $e) {
    ob_clean();
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $e->getMessage()]);
}
