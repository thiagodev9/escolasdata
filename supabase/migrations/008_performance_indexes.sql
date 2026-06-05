-- Performance indexes para queries multi-tenant
-- Elimina seq scans em tabelas grandes filtradas por escola_id

-- Alunos
CREATE INDEX IF NOT EXISTS idx_alunos_escola_status ON alunos(escola_id, status);
CREATE INDEX IF NOT EXISTS idx_alunos_escola_nome   ON alunos(escola_id, nome);

-- Turmas
CREATE INDEX IF NOT EXISTS idx_turmas_escola ON turmas(escola_id);

-- Presenças (query mais frequente: escola + data + status)
CREATE INDEX IF NOT EXISTS idx_presencas_escola_data   ON presencas(escola_id, data);
CREATE INDEX IF NOT EXISTS idx_presencas_escola_status ON presencas(escola_id, data, status);

-- Mensalidades
CREATE INDEX IF NOT EXISTS idx_mensalidades_escola_mes    ON mensalidades(escola_id, mes_referencia);
CREATE INDEX IF NOT EXISTS idx_mensalidades_escola_status ON mensalidades(escola_id, status);
CREATE INDEX IF NOT EXISTS idx_mensalidades_aluno         ON mensalidades(aluno_id, mes_referencia);

-- Registros diários (portal do pai)
CREATE INDEX IF NOT EXISTS idx_registros_aluno_data ON registros_diarios(aluno_id, data DESC);
CREATE INDEX IF NOT EXISTS idx_registros_escola     ON registros_diarios(escola_id, data DESC);

-- Feed
CREATE INDEX IF NOT EXISTS idx_feed_escola_criado ON feed_posts(escola_id, criado_em DESC);

-- Matrículas (Kanban)
CREATE INDEX IF NOT EXISTS idx_matriculas_escola_status ON matriculas(escola_id, status);

-- Colaboradores
CREATE INDEX IF NOT EXISTS idx_colaboradores_escola ON colaboradores(escola_id, ativo);

-- Responsáveis / vínculos
CREATE INDEX IF NOT EXISTS idx_alunos_resp_responsavel ON alunos_responsaveis(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_alunos_resp_aluno       ON alunos_responsaveis(aluno_id);
CREATE INDEX IF NOT EXISTS idx_alunos_turmas_aluno     ON alunos_turmas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_alunos_turmas_turma     ON alunos_turmas(turma_id);

-- Avisos de falta (portal)
CREATE INDEX IF NOT EXISTS idx_avisos_falta_escola_data ON avisos_falta(escola_id, data);
CREATE INDEX IF NOT EXISTS idx_avisos_falta_aluno_data  ON avisos_falta(aluno_id, data);

-- Visualizações do diário (notificações de leitura)
CREATE INDEX IF NOT EXISTS idx_diario_viz_responsavel ON diario_visualizacoes(responsavel_id);
CREATE INDEX IF NOT EXISTS idx_diario_viz_registro    ON diario_visualizacoes(registro_id);
