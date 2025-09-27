<?php
require __DIR__.'/_db.php'; require_api_key();
$in = json_in(); $obs = $in['obs'] ?? null; if(!$obs){ http_response_code(400); exit; }

$system = "You must output ONLY compact JSON: ".
          '{"right":bool,"left":bool,"jump":bool,"run":bool,"n_frames":int,"reason":string}';
$user = "You control a Mario-like runner. Decide next 6 frames.\n".
        "Rules: avoid pits/enemies; if obs.gap<=1 and obs.g=true then jump with run.\n".
        "Obs: ".json_encode($obs);

$payload = [
  'model' => getenv('LLM_MODEL') ?: 'llama3.1:8b-instruct-q4_0',
  'messages' => [
    ['role'=>'system','content'=>$system],
    ['role'=>'user','content'=>$user],
  ],
  'temperature'=>0.2, 'max_tokens'=>48
];

$ch = curl_init(getenv('LLM_URL'));
curl_setopt_array($ch, [
  CURLOPT_POST=>true,
  CURLOPT_HTTPHEADER=>['Content-Type: application/json'],
  CURLOPT_POSTFIELDS=>json_encode($payload),
  CURLOPT_RETURNTRANSFER=>true,
  CURLOPT_TIMEOUT=>2
]);
$raw = curl_exec($ch); $code = curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
if($code!==200 || !$raw){ echo '{"right":true,"left":false,"jump":false,"run":false,"n_frames":4,"reason":"fallback"}'; exit; }

$txt = json_decode($raw,true)['choices'][0]['message']['content'] ?? '';
$out = json_decode($txt,true);
if(!$out){ echo '{"right":true,"left":false,"jump":false,"run":false,"n_frames":4,"reason":"fallback-parse"}'; exit; }

header('Content-Type: application/json'); echo json_encode($out);
