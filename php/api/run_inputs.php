<?php
require __DIR__.'/_db.php'; require_api_key();
$in = json_in();
$p = db()->prepare("INSERT INTO inputs(run_id,seq,fps,ms_start,ms_len,data) VALUES (?,?,?,?,?,?)");
$p->execute([
  (int)$in['run_id'], (int)$in['seq'], (int)$in['fps'],
  (int)$in['ms_start'], (int)$in['ms_len'],
  base64_decode($in['data_base64'] ?? '', true) ?: ''
]);
json_out(['ok'=>true]);
