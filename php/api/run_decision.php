<?php
require __DIR__.'/_db.php'; require_api_key();
$in = json_in();
$p = db()->prepare("INSERT INTO decisions(run_id,t_ms,obs_json,action_json,reason) VALUES (?,?,?,?,?)");
$p->execute([
  (int)$in['run_id'], (int)$in['t_ms'],
  json_encode($in['obs_json'] ?? [], JSON_UNESCAPED_UNICODE),
  json_encode($in['action_json'] ?? [], JSON_UNESCAPED_UNICODE),
  substr($in['reason'] ?? '', 0, 255)
]);
json_out(['ok'=>true]);
