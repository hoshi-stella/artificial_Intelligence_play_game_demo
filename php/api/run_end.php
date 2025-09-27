<?php
require __DIR__.'/_db.php'; require_api_key();
$in = json_in();
$p = db()->prepare("UPDATE runs SET duration_ms=?, result=?, score=?, notes=? WHERE id=?");
$p->execute([(int)$in['duration_ms'], $in['result'] ?? 'timeout', (int)($in['score'] ?? 0),
             substr($in['notes'] ?? '',0,255), (int)$in['run_id']]);
json_out(['ok'=>true]);
