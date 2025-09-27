CREATE TABLE IF NOT EXISTS agents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  kind ENUM('human','ga','llm') NOT NULL,
  version VARCHAR(64) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS levels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(64) NOT NULL UNIQUE,
  seed INT NOT NULL,
  config_json JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS runs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  agent_id INT NOT NULL,
  level_id INT NOT NULL,
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  duration_ms INT NOT NULL DEFAULT 0,
  result ENUM('clear','death','timeout') NOT NULL DEFAULT 'timeout',
  score INT DEFAULT 0,
  notes VARCHAR(255) NULL,
  INDEX idx_agent (agent_id),
  INDEX idx_level (level_id),
  FOREIGN KEY (agent_id) REFERENCES agents(id),
  FOREIGN KEY (level_id) REFERENCES levels(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS inputs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  run_id BIGINT NOT NULL,
  seq INT NOT NULL,
  fps TINYINT NOT NULL,
  ms_start INT NOT NULL,
  ms_len INT NOT NULL,
  data MEDIUMBLOB NOT NULL,
  INDEX idx_inputs_run_seq (run_id, seq),
  FOREIGN KEY (run_id) REFERENCES runs(id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS decisions (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  run_id BIGINT NOT NULL,
  t_ms INT NOT NULL,
  obs_json JSON NOT NULL,
  action_json JSON NOT NULL,
  reason VARCHAR(255) NULL,
  INDEX idx_decisions_run (run_id, t_ms),
  FOREIGN KEY (run_id) REFERENCES runs(id)
) ENGINE=InnoDB;
