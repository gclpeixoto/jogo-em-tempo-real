const db = require("../db");

// Cria sala automaticamente
async function criarSala(groupId = 1) {
  const sql = `
    INSERT INTO jogo.sala (nome_sala, id_grupo)
    VALUES (concat('sala_', substr(gen_random_uuid()::text, 1, 8)), $1)
    RETURNING id_sala, nome_sala, id_grupo, status, criada_em;
  `;
  const result = await db.query(sql, [groupId]);
  return result.rows[0];
}

// Buscar sala por ID
async function buscarSalaPorId(idSala) {
  const sql = `
    SELECT id_sala, nome_sala, id_grupo, status, criada_em
    FROM jogo.sala
    WHERE id_sala = $1;
  `;
  const result = await db.query(sql, [idSala]);
  return result.rows[0] || null;
}

module.exports = {
  criarSala,
  buscarSalaPorId
};
