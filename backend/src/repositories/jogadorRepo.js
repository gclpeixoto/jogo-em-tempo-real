const db = require("../db");

// Entra na sala criando jogador
async function criarJogador(idSala, nomeJogador) {
  const sql = `
    INSERT INTO jogo.jogador (id_sala, nome)
    VALUES ($1, $2)
    RETURNING id_jogador, id_sala, nome, pontos, conectado, entrou_em;
  `;
  const result = await db.query(sql, [idSala, nomeJogador]);
  return result.rows[0];
}

// Lista jogadores da sala (útil p/ o Socket depois)
async function listarJogadoresDaSala(idSala) {
  const sql = `
    SELECT id_jogador, nome, pontos, conectado, entrou_em
    FROM jogo.jogador
    WHERE id_sala = $1
    ORDER BY entrou_em ASC;
  `;
  const result = await db.query(sql, [idSala]);
  return result.rows;
}

module.exports = {
  criarJogador,
  listarJogadoresDaSala
};
