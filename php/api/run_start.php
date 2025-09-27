<?php
require __DIR__.'/_db.php'; require_api_key();
$in = json_in();
$agent = $in['agent'] ?? ['name'=>'LLM-Online','kind'=>'llm','version'=>null];
$level = $in['level'] ?? ['name'=>'demo-01','seed'=>12345,'config_json'=>['seed'=>12345]];

$p = db()->prepare("INSERT INTO agents(name,kind,version) VALUES(?,?,?)
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id), version=VALUES(version)");
$p->execute([$agent['name'],$agent['kind'],$agent['version']??null]);
$agent_id = db()->lastInsertId();

$p = db()->prepare("INSERT INTO levels(name,seed,config_json) VALUES(?,?,JSON_OBJECT('seed',?))
ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)");
$p->execute([$level['name'], (int)$level['seed'], (int)$level['seed']]);
$level_id = db()->lastInsertId();

$p = db()->prepare("INSERT INTO runs(agent_id,level_id) VALUES(?,?)");
$p->execute([$agent_id,$level_id]);
json_out(['run_id'=>(int)db()->lastInsertId()]);
