SET search_path TO jogo;


CREATE TABLE grupo_perguntas (
    id_grupo SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);


CREATE TABLE sala (
    id_sala UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome_sala VARCHAR(50) NOT NULL UNIQUE,
    id_grupo INTEGER NOT NULL REFERENCES grupo_perguntas(id_grupo),
    status VARCHAR(20) NOT NULL DEFAULT 'aguardando',  -- aguardando, jogando, finalizado
    criada_em TIMESTAMP DEFAULT NOW()
);


CREATE TABLE jogador (
    id_jogador UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sala UUID NOT NULL REFERENCES sala(id_sala) ON DELETE CASCADE,
    nome VARCHAR(50) NOT NULL,
    pontos INTEGER DEFAULT 0,
    conectado BOOLEAN DEFAULT TRUE,
    entrou_em TIMESTAMP DEFAULT NOW()
);

CREATE TABLE pergunta (
    id_pergunta SERIAL PRIMARY KEY,
    id_grupo INTEGER NOT NULL REFERENCES grupo_perguntas(id_grupo) ON DELETE CASCADE,
    texto TEXT NOT NULL,
    alternativa_a TEXT NOT NULL,
    alternativa_b TEXT NOT NULL,
    alternativa_c TEXT NOT NULL,
    alternativa_d TEXT NOT NULL,
    resposta_correta CHAR(1) NOT NULL CHECK (resposta_correta IN ('A','B','C','D'))
);


CREATE TABLE resposta_jogador (
    id_resposta SERIAL PRIMARY KEY,
    id_jogador UUID NOT NULL REFERENCES jogador(id_jogador) ON DELETE CASCADE,
    id_pergunta INTEGER NOT NULL REFERENCES pergunta(id_pergunta),
    resposta CHAR(1) NOT NULL CHECK (resposta IN ('A','B','C','D')),
    correta BOOLEAN NOT NULL,
    respondida_em TIMESTAMP DEFAULT NOW()
);
