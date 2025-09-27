-- AI Play Game Demo Database Schema
-- ゲーム実行データとAIエージェントの記録用テーブル

CREATE TABLE IF NOT EXISTS agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type ENUM('ga', 'llm') NOT NULL,
  config_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS levels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  config_json TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS runs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  agent_id INT NOT NULL,
  level_id INT NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_ms INT DEFAULT NULL,
  result ENUM('completed', 'timeout', 'failed', 'cancelled') DEFAULT NULL,
  score INT DEFAULT 0,
  notes TEXT,
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (level_id) REFERENCES levels(id)
);

CREATE TABLE IF NOT EXISTS inputs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  run_id INT NOT NULL,
  t_ms INT NOT NULL,
  input_type ENUM('keyboard', 'gamepad', 'ai') NOT NULL,
  input_data JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS decisions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  run_id INT NOT NULL,
  t_ms INT NOT NULL,
  obs_json JSON,
  action_json JSON,
  reason VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (run_id) REFERENCES runs(id) ON DELETE CASCADE
);

-- 初期データの挿入
INSERT INTO agents (name, type, config_json) VALUES 
('GA Agent', 'ga', '{"population_size": 50, "mutation_rate": 0.1, "crossover_rate": 0.8}'),
('LLM Agent', 'llm', '{"model": "llama3.1:8b-instruct-q4_0", "temperature": 0.2}');

INSERT INTO levels (name, config_json) VALUES 
('Basic Level', '{"width": 1000, "height": 540, "difficulty": "easy"}'),
('Advanced Level', '{"width": 2000, "height": 540, "difficulty": "hard"}');