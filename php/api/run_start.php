<?php
require __DIR__.'/_db.php';
require_api_key();

$in = json_in();
$agent_id = (int)($in['agent_id'] ?? 1);
$level_id = (int)($in['level_id'] ?? 1);

// 新しい実行を開始
$p = db()->prepare("INSERT INTO runs(agent_id, level_id) VALUES (?, ?)");
$p->execute([$agent_id, $level_id]);
$run_id = db()->lastInsertId();

// エージェントとレベル情報を取得
$agent = db()->prepare("SELECT * FROM agents WHERE id = ?");
$agent->execute([$agent_id]);
$agent_data = $agent->fetch();

$level = db()->prepare("SELECT * FROM levels WHERE id = ?");
$level->execute([$level_id]);
$level_data = $level->fetch();

json_out([
  'run_id' => $run_id,
  'agent' => $agent_data,
  'level' => $level_data,
  'started_at' => date('Y-m-d H:i:s')
]);