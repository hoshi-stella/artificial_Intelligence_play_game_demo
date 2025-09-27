<?php
require __DIR__.'/_db.php';
require_api_key();

$in = json_in();
$run_id = (int)($in['run_id']);
$inputs = $in['inputs'] ?? [];

if (!$run_id || empty($inputs)) {
  http_response_code(400);
  json_out(['error' => 'run_id and inputs are required']);
  exit;
}

// バッチで入力データを挿入
$p = db()->prepare("INSERT INTO inputs(run_id, t_ms, input_type, input_data) VALUES (?, ?, ?, ?)");
$inserted = 0;

foreach ($inputs as $input) {
  $p->execute([
    $run_id,
    (int)($input['t_ms'] ?? 0),
    $input['input_type'] ?? 'keyboard',
    json_encode($input['input_data'] ?? [], JSON_UNESCAPED_UNICODE)
  ]);
  $inserted++;
}

json_out(['ok' => true, 'inserted' => $inserted]);